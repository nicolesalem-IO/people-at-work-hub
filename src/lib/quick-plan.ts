import type { OnetElement, OnetMatch } from "./onet-api";
import { recommendAptitude } from "./packet";

/** "See a test plan for any job": job title → O*NET occupation → skills needed on day one → the parts of the
 *  hiring test that fit this job → an AI-drafted sample. Everything is a draft for expert review. */

export type QuickSkill = { id: string; name: string; kind: string; importance: number | null };
export type QuickTask = { id: string; name: string };
export type PlanPart = {
  kind: "skills" | "aptitude" | "live" | "interview";
  label: string;
  detail: string;
  status: "always" | "recommended" | "consider";
};
export type QuickPlan = {
  live: boolean;
  notice: string;
  occupation: OnetMatch;
  alternatives: OnetMatch[];
  skills: QuickSkill[];
  tasks: QuickTask[];
  parts: PlanPart[];
};

/** Top skills, knowledge and abilities by O*NET importance. O*NET lists some names twice (e.g. Mathematics as both
 *  a skill and a knowledge area): keep the higher-rated one. */
export function pickDayOne(elements: OnetElement[], limit = 8): QuickSkill[] {
  const best = new Map<string, OnetElement>();
  for (const e of elements) {
    if (!["skill", "ability", "knowledge"].includes(e.kind)) continue;
    const prev = best.get(e.name);
    if (!prev || (e.benchmark_importance ?? 0) > (prev.benchmark_importance ?? 0)) best.set(e.name, e);
  }
  return [...best.values()]
    .sort((a, b) => (b.benchmark_importance ?? 0) - (a.benchmark_importance ?? 0))
    .slice(0, limit)
    .map((e) => ({ id: e.id, name: e.name, kind: e.kind, importance: e.benchmark_importance }));
}

export function pickTasks(elements: OnetElement[], limit = 6): QuickTask[] {
  return elements
    .filter((e) => e.kind === "task")
    .sort((a, b) => (b.benchmark_importance ?? 0) - (a.benchmark_importance ?? 0))
    .slice(0, limit)
    .map((t) => ({ id: t.id, name: t.name }));
}

const LIVE = ["Instructing", "Speaking", "Persuasion", "Negotiation", "Service Orientation", "Social Perceptiveness", "Customer and Personal Service"];

/** Which parts of the hiring test fit this job, from O*NET importance alone (experts confirm later). */
export function planParts(elements: OnetElement[], tasks: QuickTask[]): PlanPart[] {
  const parts: PlanPart[] = [
    {
      kind: "skills",
      label: "Skills assessment",
      status: "always",
      detail: `A detailed take-home built from the job's top tasks: ${tasks
        .slice(0, 3)
        .map((t) => t.name.replace(/\.$/, "").toLowerCase())
        .join("; ")}.`,
    },
  ];
  const ratings = elements.map((e) => ({ name: e.name, importance: e.benchmark_importance }));
  for (const r of recommendAptitude(ratings))
    if (r.level !== "not_needed")
      parts.push({
        kind: "aptitude",
        label: `${r.module} test`,
        status: "consider",
        detail: `O*NET rates ${r.because.join(", ")} of 5. Include it if your experts confirm it's needed on day one.`,
      });
  const live = elements
    .filter((e) => LIVE.includes(e.name) && (e.benchmark_importance ?? 0) >= 4)
    .sort((a, b) => (b.benchmark_importance ?? 0) - (a.benchmark_importance ?? 0));
  if (live.length)
    parts.push({
      kind: "live",
      label: "Live exercise for finalists",
      status: "recommended",
      detail: `O*NET rates ${[...new Set(live.map((e) => `${e.name} ${e.benchmark_importance}`))].slice(0, 2).join(", ")}. A short teach-back or role-play shows it directly.`,
    });
  parts.push({
    kind: "interview",
    label: "Structured interview",
    status: "always",
    detail: "Same questions for every finalist, scored with written guides, for work styles a written test can't show.",
  });
  return parts;
}
