import type { OnetElement, OnetMatch } from "./onet-api";

/** "See a test plan in seconds": job title → O*NET occupation → skills needed on day one →
 *  draft test plan → three sample questions, each tagged with the job task and skill it measures.
 *  Everything here is a draft for expert review, never a hiring decision. */

export type PlanMethod = "hands_on" | "scenarios" | "reasoning" | "interview";
export const methodLabels: Record<PlanMethod, string> = {
  hands_on: "Hands-on tasks",
  scenarios: "Job scenarios",
  reasoning: "Reasoning questions",
  interview: "Structured interview",
};
export type QuickSkill = {
  id: string;
  name: string;
  kind: string;
  importance: number | null;
  method: PlanMethod;
};
export type QuickTask = { id: string; name: string };
export type QuickQuestion = {
  method: Exclude<PlanMethod, "interview">;
  prompt: string;
  options: string[];
  answer_index: number | null;
  skill_id: string;
  task_id: string;
  why: string;
};
export type NamedQuestion = QuickQuestion & { skill_name: string; task_name: string };
export type QuickPlan = {
  live: boolean;
  ai: boolean;
  notice: string;
  occupation: OnetMatch;
  alternatives: OnetMatch[];
  skills: QuickSkill[];
  tasks: QuickTask[];
  plan: { method: PlanMethod; label: string; weight: number; skills: string[] }[];
  questions: NamedQuestion[];
};

export function nameQuestions(
  qs: QuickQuestion[],
  elements: { id: string; name: string }[],
): NamedQuestion[] {
  const name = (id: string) => elements.find((e) => e.id === id)?.name ?? id;
  return qs.map((q) => ({ ...q, skill_name: name(q.skill_id), task_name: name(q.task_id) }));
}

const PEOPLE = /judg|decision|social|coordinat|negotiat|persua|service|conflict|cooperat|monitor/i;
const REASONING =
  /reasoning|mathemat|comprehension|deductive|inductive|information ordering|problem sensitivity|written|oral|category|number/i;

/** Where a day-one skill is best measured. Abilities and reasoning skills → reasoning questions;
 *  interpersonal judgment → scenarios; job knowledge and applied skills → hands-on tasks. */
export function methodFor(e: { kind: string; name: string }): PlanMethod {
  if (PEOPLE.test(e.name)) return "scenarios";
  if (e.kind === "ability" || REASONING.test(e.name)) return "reasoning";
  return "hands_on";
}

export function pickDayOne(elements: OnetElement[], limit = 6): QuickSkill[] {
  const pool = elements.filter((e) => ["skill", "ability", "knowledge"].includes(e.kind));
  const ranked = [...pool].sort(
    (a, b) => (b.benchmark_importance ?? 0) - (a.benchmark_importance ?? 0),
  );
  const picked: QuickSkill[] = [];
  const per: Record<string, number> = {};
  for (const e of ranked) {
    const method = methodFor(e);
    if ((per[method] ?? 0) >= 3) continue;
    per[method] = (per[method] ?? 0) + 1;
    picked.push({
      id: e.id,
      name: e.name,
      kind: e.kind,
      importance: e.benchmark_importance,
      method,
    });
    if (picked.length >= limit) break;
  }
  return picked;
}

export function pickTasks(elements: OnetElement[], limit = 5): QuickTask[] {
  const tasks = elements.filter((e) => e.kind === "task");
  return [...tasks]
    .sort((a, b) => (b.benchmark_importance ?? 0) - (a.benchmark_importance ?? 0))
    .slice(0, limit)
    .map((t) => ({ id: t.id, name: t.name }));
}

/** Weights follow importance; the interview is fixed at 15% for what tests can't measure. Rounded to 5s, total 100. */
export function planFor(skills: QuickSkill[]) {
  const methods: Exclude<PlanMethod, "interview">[] = ["hands_on", "scenarios", "reasoning"];
  const mass = methods.map((m) =>
    skills.filter((s) => s.method === m).reduce((n, s) => n + (s.importance ?? 3), 0),
  );
  const total = mass.reduce((a, b) => a + b, 0) || 1;
  const raw = mass.map((v) => (v ? Math.max(10, Math.round((85 * v) / total / 5) * 5) : 0));
  const sum = raw.reduce((a, b) => a + b, 0);
  const biggest = raw.indexOf(Math.max(...raw));
  if (sum && biggest >= 0) raw[biggest] = (raw[biggest] ?? 0) + (85 - sum);
  // Reasoning (cognitive) questions are capped at 25%: they predict well but carry the largest group
  // differences, so the rest is shared between hands-on tasks and job scenarios.
  const REASONING_CAP = 25;
  if ((raw[2] ?? 0) > REASONING_CAP) {
    const extra = (raw[2] ?? 0) - REASONING_CAP;
    raw[2] = REASONING_CAP;
    const toScenarios = raw[1] && raw[0] ? Math.floor(extra / 2 / 5) * 5 : raw[1] ? extra : 0;
    raw[1] = (raw[1] ?? 0) + toScenarios;
    raw[0] = (raw[0] ?? 0) + extra - toScenarios;
  }
  return [
    ...methods
      .map((m, n) => ({
        method: m as PlanMethod,
        label: methodLabels[m],
        weight: raw[n] ?? 0,
        skills: skills.filter((s) => s.method === m).map((s) => s.name),
      }))
      .filter((p) => p.weight > 0),
    {
      method: "interview" as PlanMethod,
      label: methodLabels.interview,
      weight: 15,
      skills: ["Work styles tests can't capture"],
    },
  ];
}

/** Model output is untrusted: keep only questions that cite a provided task and skill, with valid options. */
export function sanitizeQuestions(
  list: unknown,
  skills: QuickSkill[],
  tasks: QuickTask[],
): QuickQuestion[] {
  if (!Array.isArray(list)) return [];
  const skillIds = new Set(skills.map((s) => s.id)),
    taskIds = new Set(tasks.map((t) => t.id));
  return list
    .flatMap((q): QuickQuestion[] => {
      if (typeof q !== "object" || !q) return [];
      const r = q as Record<string, unknown>;
      const method = r["method"];
      if (method !== "hands_on" && method !== "scenarios" && method !== "reasoning") return [];
      const prompt = String(r["prompt"] ?? "")
        .trim()
        .slice(0, 700);
      const options = Array.isArray(r["options"])
        ? (r["options"] as unknown[])
            .map((o) => String(o).trim().slice(0, 200))
            .filter(Boolean)
            .slice(0, 5)
        : [];
      const ai = Number(r["answer_index"]);
      const skill_id = String(r["skill_id"] ?? ""),
        task_id = String(r["task_id"] ?? "");
      if (!prompt || !skillIds.has(skill_id) || !taskIds.has(task_id)) return [];
      if (method === "hands_on")
        return [
          {
            method,
            prompt,
            options: [],
            answer_index: null,
            skill_id,
            task_id,
            why: String(r["why"] ?? "").slice(0, 240),
          },
        ];
      if (options.length < 3 || !Number.isInteger(ai) || ai < 0 || ai >= options.length) return [];
      return [
        {
          method,
          prompt,
          options,
          answer_index: ai,
          skill_id,
          task_id,
          why: String(r["why"] ?? "").slice(0, 240),
        },
      ];
    })
    .slice(0, 3);
}

/** Hand-written originals for the saved L&D benchmark (13-1151.00), used when AI is unavailable. */
export const savedQuestions: QuickQuestion[] = [
  {
    method: "reasoning",
    prompt:
      "18 of 24 new hires finished onboarding training in week one, and 4 more finished in week two. What share finished within two weeks?",
    options: ["67%", "75%", "83%", "92%"],
    answer_index: 3,
    skill_id: "1.A.1.c.1",
    task_id: "98",
    why: "Tracking completion and effectiveness data is part of the job from day one.",
  },
  {
    method: "scenarios",
    prompt:
      "A manager asks you to cut a 3-hour safety course to 30 minutes by Friday. What do you do first?",
    options: [
      "Cut the slides with the least text and ship it Friday",
      "Ask what has to change on the job and which safety steps must be practiced, then propose what fits in 30 minutes",
      "Refuse because the full course is required",
      "Send the full course as pre-reading and run a 30-minute Q&A",
    ],
    answer_index: 1,
    skill_id: "2.B.4.e",
    task_id: "103",
    why: "Balancing a stakeholder request against learning needs is a common critical incident.",
  },
  {
    method: "hands_on",
    prompt:
      "Read a short needs-assessment summary (12 schedulers; 6 of 12 route urgent requests correctly; 30 minutes available). Outline a 30-minute module with two measurable objectives, one practice activity and a quick check for learning.",
    options: [],
    answer_index: null,
    skill_id: "2.C.6",
    task_id: "20474",
    why: "Designing orientation and training is a core task; raters score it with anchored rubrics.",
  },
];

/** Generic fallback for any occupation, built from its own top task and skills. */
export function fallbackQuestions(skills: QuickSkill[], tasks: QuickTask[]): QuickQuestion[] {
  const by = (m: PlanMethod) => skills.find((s) => s.method === m) ?? skills[0];
  const t0 = tasks[0],
    t1 = tasks[1] ?? tasks[0];
  if (!t0 || !skills.length) return [];
  const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1).replace(/\.$/, "");
  const out: QuickQuestion[] = [];
  const h = by("hands_on");
  if (h)
    out.push({
      method: "hands_on",
      prompt: `Work sample: using the materials provided, show how you would ${lower(t0.name)} Explain your steps and what you would check before finishing.`,
      options: [],
      answer_index: null,
      skill_id: h.id,
      task_id: t0.id,
      why: "A realistic slice of the most important task, scored with a rubric.",
    });
  const s = by("scenarios");
  if (s && t1)
    out.push({
      method: "scenarios",
      prompt: `While you ${lower(t1.name)}, a colleague asks you to drop it for an urgent request from their manager. What is the most effective first step?`,
      options: [
        "Drop your work immediately",
        "Ask about the deadline and impact of both, then agree on priorities with your lead",
        "Ignore the request until your task is done",
        "Ask the colleague to do your task",
      ],
      answer_index: 1,
      skill_id: s.id,
      task_id: t1.id,
      why: "Judgment under competing priorities, keyed by job experts.",
    });
  const r = by("reasoning");
  if (r)
    out.push({
      method: "reasoning",
      prompt:
        "A team completed 45 of 60 planned tasks last week and 54 of 60 this week. By how many percentage points did the completion rate improve?",
      options: ["9", "12", "15", "20"],
      answer_index: 2,
      skill_id: r.id,
      task_id: t0.id,
      why: "Short, job-flavored numerical reasoning.",
    });
  return out;
}

/** Every skill a sample question measures must also appear in the day-one list and the plan. */
export function withCitedSkills(
  skills: QuickSkill[],
  questions: QuickQuestion[],
  elements: { id: string; name: string; kind: string; benchmark_importance: number | null }[],
): QuickSkill[] {
  const out = [...skills];
  for (const q of questions) {
    const found = out.find((s) => s.id === q.skill_id);
    if (found) {
      found.method = q.method;
      continue;
    }
    const e = elements.find((x) => x.id === q.skill_id);
    if (e)
      out.push({
        id: e.id,
        name: e.name,
        kind: e.kind,
        importance: e.benchmark_importance,
        method: q.method,
      });
  }
  return out;
}
