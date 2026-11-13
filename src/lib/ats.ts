import type { Screening } from "./hiring-stages";

/** This app is not an applicant tracking system. These helpers hand screening criteria to the
 *  company's ATS and hand stage results back, keyed by the ATS candidate ID. */

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const toCsv = (rows: unknown[][]) => rows.map((r) => r.map(cell).join(",")).join("\n");

type Lookup = (id: string) => string | undefined;
const sources = (ids: string[], lookup: Lookup) => ids.map((id) => lookup(id) ?? id).join("; ");

/** Plain-text version for pasting into an ATS application form builder. */
export function screeningCriteriaText(s: Screening, lookup: Lookup = () => undefined) {
  const q = s.qualifications.map(
    (x, n) =>
      `${n + 1}. ${x.label}? (Yes / No${x.degree ? " / Equivalent experience" : ""})\n   Knockout: answer must be Yes${x.degree ? " or Equivalent experience" : ""}.\n   Based on: ${sources(x.evidence_ids, lookup)}`,
  );
  const e = s.experience.map(
    (x, n) =>
      `${n + 1}. ${x.label}\n${x.anchors.map((a, i) => `   ${i} = ${a}`).join("\n")}\n   Based on: ${sources(x.evidence_ids, lookup)}`,
  );
  return `MINIMUM QUALIFICATIONS (knockout questions)\n${q.join("\n")}\n\nTRAINING & EXPERIENCE RATING (score each 0–3; minimum total ${s.minimum_experience} of ${s.experience.length * 3})\n${e.join("\n")}\n\nGenerated from the job analysis. Review with HR/legal before use.`;
}

/** One row per question, for ATS import or review. */
export function screeningCriteriaCsv(s: Screening, lookup: Lookup = () => undefined) {
  return toCsv([
    ["type", "question", "accepted_answers_or_anchors", "based_on"],
    ...s.qualifications.map((x) => [
      "knockout",
      x.label,
      x.degree ? "Yes | Equivalent experience" : "Yes",
      sources(x.evidence_ids, lookup),
    ]),
    ...s.experience.map((x) => [
      "experience_rating_0_3",
      x.label,
      x.anchors.map((a, i) => `${i}: ${a}`).join(" | "),
      sources(x.evidence_ids, lookup),
    ]),
  ]);
}

export type ExportCandidate = {
  ats_id?: string | undefined;
  name: string;
  email: string;
  stage: string;
  stage_results?: Record<string, { pass: boolean | null }> | undefined;
  overall: number | null;
  decision?: string | undefined;
};
const hurdle = (r?: { pass: boolean | null }) =>
  !r ? "" : r.pass === null ? "review" : r.pass ? "pass" : "not passed";

/** Results file to load back into the ATS. The overall score is only reported for finalists. */
export function resultsExportCsv(list: ExportCandidate[]) {
  return toCsv([
    [
      "ats_candidate_id",
      "name",
      "email",
      "hiring_stage",
      "stage_0_qualifications",
      "stage_1_online_assessment",
      "stage_2_hands_on_tasks",
      "stage_3_interview",
      "overall_score",
      "decision",
    ],
    ...list.map((c) => [
      c.ats_id ?? "",
      c.name,
      c.email,
      c.stage,
      hurdle(c.stage_results?.["0"]),
      hurdle(c.stage_results?.["1"]),
      hurdle(c.stage_results?.["2"]),
      hurdle(c.stage_results?.["3"]),
      c.overall === null ? "" : c.overall.toFixed(1),
      c.decision ?? "",
    ]),
  ]);
}

export function downloadText(filename: string, text: string, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
