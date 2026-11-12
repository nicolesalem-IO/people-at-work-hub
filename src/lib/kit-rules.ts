// Rules for the interactive hiring kit. Pure functions so the same logic can run in the browser
// demo now and in the database layer later.
import { passRule, type RubricLine } from "@/lib/packet";

export type Step = "work_sample" | "teach_back" | "interview";
export type Choice = "advance" | "decline" | "hold";

export interface SheetVersion {
  at: string;
  reason: string;
  scores: Record<string, number>;
  notes: Record<string, string>;
}

export interface Sheet {
  id: string;
  candidateId: string;
  step: Step;
  raterId: string;
  scores: Record<string, number>;
  notes: Record<string, string>;
  submittedAt: string | null;
  history: SheetVersion[]; // earlier submitted versions, oldest first
}

export interface Decision {
  candidateId: string;
  choice: Choice;
  reason: string;
  by: string;
  at: string;
}

export const RETENTION_MONTHS = 36;
export const GAP_LIMIT = 1;
export const AGREEMENT_TARGET = 0.8;

const round1 = (n: number) => Math.round(n * 10) / 10;

export const submitted = (sheets: Sheet[], candidateId: string, step: Step) =>
  sheets
    .filter((s) => s.candidateId === candidateId && s.step === step && s.submittedAt)
    .sort((a, b) => (a.submittedAt! < b.submittedAt! ? -1 : 1));

/** Lines where the first two blind raters are more than 1 point apart. */
export function gapLines(lines: RubricLine[], a: Sheet, b: Sheet) {
  return lines.filter((l) => Math.abs((a.scores[l.id] ?? 0) - (b.scores[l.id] ?? 0)) > GAP_LIMIT).map((l) => l.id);
}

export type BlindResult =
  | { status: "waiting"; count: number }
  | { status: "needs_third"; gaps: string[] }
  | { status: "final"; lineScores: Record<string, number>; average: number; pass: boolean; failedCritical: string[] };

/** Two blind raters; a third settles any line more than 1 point apart (the two closest scores are averaged). */
export function blindResult(lines: RubricLine[], sheets: Sheet[], candidateId: string): BlindResult {
  const done = submitted(sheets, candidateId, "work_sample");
  if (done.length < 2) return { status: "waiting", count: done.length };
  const [a, b, c] = done as [Sheet, Sheet, Sheet | undefined];
  const gaps = gapLines(lines, a, b);
  if (gaps.length && !c) return { status: "needs_third", gaps };
  const lineScores: Record<string, number> = {};
  for (const l of lines) {
    const x = a.scores[l.id]!, y = b.scores[l.id]!;
    if (!gaps.includes(l.id) || !c) {
      lineScores[l.id] = round1((x + y) / 2);
      continue;
    }
    const z = c.scores[l.id]!;
    const pairs: [number, number][] = [[x, y], [x, z], [y, z]];
    pairs.sort((p, q) => Math.abs(p[0] - p[1]) - Math.abs(q[0] - q[1]));
    lineScores[l.id] = round1((pairs[0]![0] + pairs[0]![1]) / 2);
  }
  const r = passRule(lines, lineScores);
  if (!r.complete) return { status: "waiting", count: done.length };
  return { status: "final", lineScores, average: r.average, pass: r.pass, failedCritical: r.failedCritical };
}

/** Teach-back and interview: everyone in the room scores alone; the result averages their submitted sheets. */
export function panelResult(lines: RubricLine[], sheets: Sheet[], candidateId: string, step: Exclude<Step, "work_sample">) {
  const done = submitted(sheets, candidateId, step);
  if (!done.length) return null;
  const lineScores: Record<string, number> = {};
  for (const l of lines) lineScores[l.id] = round1(done.reduce((t, s) => t + (s.scores[l.id] ?? 0), 0) / done.length);
  const r = passRule(lines, lineScores);
  return r.complete ? { ...r, lineScores, raters: done.length } : null;
}

/** Share of line pairs from the first two blind raters that land within 1 point. */
export function agreement(lines: RubricLine[], sheets: Sheet[]) {
  let within = 0, total = 0;
  const ids = [...new Set(sheets.filter((s) => s.step === "work_sample").map((s) => s.candidateId))];
  for (const id of ids) {
    const done = submitted(sheets, id, "work_sample");
    if (done.length < 2) continue;
    for (const l of lines) {
      total++;
      if (Math.abs(done[0]!.scores[l.id]! - done[1]!.scores[l.id]!) <= GAP_LIMIT) within++;
    }
  }
  return total ? { rate: within / total, pairs: total, onTarget: within / total >= AGREEMENT_TARGET } : null;
}

/** A rater is calibrated when every line on every benchmark lands within 1 point of the expert score. */
export function calibrationCheck(
  lines: RubricLine[],
  benchmarks: { id: string; expert: Record<string, number> }[],
  mine: Record<string, Record<string, number>>,
) {
  const misses: { benchmark: string; line: string; expert: number; yours: number }[] = [];
  let complete = true;
  for (const b of benchmarks)
    for (const l of lines) {
      const yours = mine[b.id]?.[l.id];
      if (!yours) { complete = false; continue; }
      if (Math.abs(yours - b.expert[l.id]!) > GAP_LIMIT) misses.push({ benchmark: b.id, line: l.id, expert: b.expert[l.id]!, yours });
    }
  return { complete, misses, passed: complete && misses.length === 0 };
}

/** Replaces a submitted sheet, keeping the earlier version; a reason is required once a sheet is submitted. */
export function reviseSheet(sheet: Sheet, scores: Record<string, number>, notes: Record<string, string>, at: string, reason?: string): Sheet {
  if (!sheet.submittedAt) return { ...sheet, scores, notes };
  if (!reason?.trim()) throw new Error("A reason is required to change a submitted score.");
  return {
    ...sheet,
    history: [...sheet.history, { at: sheet.submittedAt, reason: reason.trim(), scores: sheet.scores, notes: sheet.notes }],
    scores,
    notes,
    submittedAt: at,
  };
}

export function retainUntil(iso: string, months = RETENTION_MONTHS) {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}
