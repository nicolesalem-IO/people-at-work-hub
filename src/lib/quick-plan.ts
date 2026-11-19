import type { OnetElement, OnetMatch } from "./onet-api";
import { chooseMethods, type MethodPlan, type Signal } from "./method-rules";

/** "See a test plan for any job": job title → O*NET occupation → skills needed on day one → the parts of the
 *  hiring test that fit this job → an AI-drafted sample. Everything is a draft for expert review. */

export type QuickSkill = { id: string; name: string; kind: string; importance: number | null };
export type QuickTask = { id: string; name: string };
export type QuickPlan = {
  live: boolean;
  notice: string;
  occupation: OnetMatch;
  alternatives: OnetMatch[];
  skills: QuickSkill[];
  tasks: QuickTask[];
  plan: MethodPlan | null;
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

/** Everything the method rules read: O*NET skills, abilities, knowledge, work activities and work context. */
export function signalsOf(elements: OnetElement[], extra: Signal[] = []): Signal[] {
  return [
    ...elements.filter((e) => e.kind !== "task" && e.kind !== "tool").map((e) => ({ name: e.name, importance: e.benchmark_importance })),
    ...extra,
  ];
}

/** Which methods fit this job, chosen by the criteria in method-rules.ts (experts confirm later). */
export function planFor(code: string, elements: OnetElement[], extra: Signal[] = [], jobZone: number | null = null): MethodPlan {
  return chooseMethods({ code, signals: signalsOf(elements, extra), jobZone });
}
