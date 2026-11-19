import type { Answers, MethodKind } from "./method-rules";

/** One hiring workflow, used by the real product and by the demo (same screens, different data).
 *  Every job moves through the same seven steps; each person sees only the tasks that are theirs. */

export type StepId = "description" | "analysis" | "plan" | "test" | "candidates" | "scoring" | "decision";
export type TeamRole = "builder" | "hr" | "expert" | "rater" | "manager";

export type Member = { id: string; name: string; email: string; roles: TeamRole[] };
export type ExpertRating = { elementId: string; importance: number; dayOne: boolean; applies: boolean; at: string };
export type Override = { key: string; label: string; decision: "keep" | "drop" | "add"; reason: string; by: string; at: string };
export type Version = { at: string; by: string; text: string; note: string };
export type LocalCandidate = { id: string; name: string; email: string; addedAt: string };

export type Job = {
  id: string;
  title: string;
  organization: string;
  fictional: boolean;
  createdAt: string;
  onet: { code: string; title: string } | null;
  team: Member[];
  description: { versions: Version[]; source: "none" | "uploaded" | "written" | "ai"; skipped: boolean; approvedBy: string | null };
  analysis: { ratings: Record<string, ExpertRating[]>; confirmedBy: string | null };
  plan: { answers: Answers; overrides: Override[]; approvedBy: string | null };
  test: { expertApprovedBy: string | null; hrApprovedBy: string | null };
  candidates: LocalCandidate[];
  /** Set for the demo job whose scoring and decisions run on the fictional hiring kit. */
  kit: boolean;
};

export const STEPS: { id: StepId; n: number; name: string; what: string; owner: TeamRole[] }[] = [
  { id: "description", n: 1, name: "Job description", what: "Upload, revise or write the job description, or skip it and use O*NET alone.", owner: ["builder"] },
  { id: "analysis", n: 2, name: "Job analysis", what: "Match the job to O*NET, then experts rate what's needed on day one.", owner: ["builder", "expert"] },
  { id: "plan", n: 3, name: "Test plan", what: "The 8 criteria choose how to test. Experts confirm or change each choice, with a reason.", owner: ["builder", "expert"] },
  { id: "test", n: 4, name: "Hiring test", what: "Draft the tests and scoring guides. An expert and HR approve them.", owner: ["builder", "expert", "hr"] },
  { id: "candidates", n: 5, name: "Candidates", what: "Add candidates and send each one their test link.", owner: ["hr"] },
  { id: "scoring", n: 6, name: "Scoring", what: "Raters practice, then score blind. The hiring manager runs the live parts.", owner: ["rater", "manager", "hr"] },
  { id: "decision", n: 7, name: "Decision & fairness", what: "Record each decision with a reason and check pass rates across groups.", owner: ["manager", "hr"] },
];

export type StepState = { id: StepId; done: boolean; locked: boolean; needs: string };
export type KitProgress = { candidates: number; scored: number; decided: number };

/** Each step unlocks when the one before it is done. */
export function stepStates(job: Job, kit?: KitProgress): StepState[] {
  const ratedBy = Object.values(job.analysis.ratings).filter((r) => r.length > 0).length;
  const done: Record<StepId, boolean> = {
    description: job.description.skipped || Boolean(job.description.approvedBy),
    analysis: Boolean(job.analysis.confirmedBy),
    plan: Boolean(job.plan.approvedBy),
    test: Boolean(job.test.expertApprovedBy && job.test.hrApprovedBy),
    candidates: job.kit ? (kit?.candidates ?? 0) > 0 : job.candidates.length > 0,
    scoring: job.kit ? Boolean(kit && kit.candidates > 0 && kit.scored >= kit.candidates) : false,
    decision: job.kit ? Boolean(kit && kit.candidates > 0 && kit.decided >= kit.candidates) : false,
  };
  const needs: Record<StepId, string> = {
    description: "",
    analysis: "Finish or skip the job description first.",
    plan: ratedBy ? "The job analysis needs to be confirmed first." : "Experts rate the job first.",
    test: "The test plan needs to be approved first.",
    candidates: "An expert and HR approve the hiring test first.",
    scoring: "Add candidates first.",
    decision: "Candidates are scored first.",
  };
  const order = STEPS.map((s) => s.id);
  return order.map((id, i) => {
    const prev = order[i - 1];
    // Scoring and decisions run side by side once candidates exist.
    const locked = prev ? !done[prev] && !(id === "decision" && done.candidates) : false;
    return { id, done: done[id], locked, needs: locked ? needs[id] : "" };
  });
}

export const currentStep = (job: Job, kit?: KitProgress) => {
  const s = stepStates(job, kit);
  return s.find((x) => !x.done && !x.locked) ?? s[s.length - 1]!;
};

export type Task = { jobId: string; jobTitle: string; step: StepId; title: string; detail: string; locked: boolean; needs: string; done: boolean };

/** The tasks one person has on one job, in workflow order. */
export function tasksFor(memberId: string, job: Job, kit?: KitProgress): Task[] {
  const me = job.team.find((m) => m.id === memberId);
  if (!me) return [];
  const st = Object.fromEntries(stepStates(job, kit).map((s) => [s.id, s])) as Record<StepId, StepState>;
  const has = (r: TeamRole) => me.roles.includes(r);
  const t = (step: StepId, title: string, detail: string, done: boolean): Task => ({
    jobId: job.id,
    jobTitle: job.title,
    step,
    title,
    detail,
    done,
    locked: st[step].locked,
    needs: st[step].needs,
  });
  const out: Task[] = [];
  const myRatings = job.analysis.ratings[me.id] ?? [];
  if (has("builder")) out.push(t("description", "Add the job description", "Upload, revise or write it, or skip it and use O*NET alone.", st.description.done));
  if (has("expert")) out.push(t("analysis", "Rate the job", "One question at a time: how important each task and skill is, and whether it's needed on day one.", myRatings.length > 0));
  if (has("builder")) out.push(t("analysis", "Confirm the job analysis", "Review the expert ratings and where they agree.", st.analysis.done));
  if (has("builder") || has("expert")) out.push(t("plan", has("builder") ? "Approve the test plan" : "Review the test plan", "Confirm or change each test method. Changes need a reason.", st.plan.done));
  if (has("expert")) out.push(t("test", "Approve the hiring test", "Check each exercise and scoring guide against the real job.", Boolean(job.test.expertApprovedBy)));
  if (has("hr")) out.push(t("test", "HR approval of the hiring test", "Check fairness, accommodations and instructions.", Boolean(job.test.hrApprovedBy)));
  if (has("hr")) out.push(t("candidates", "Add candidates and send links", "Each candidate gets a private link to their test.", st.candidates.done));
  if (has("rater")) out.push(t("scoring", "Practice, then score your assigned candidates", "Score blind against the written guide. You won't see names.", st.scoring.done));
  if (has("manager")) out.push(t("scoring", "Run the live exercise and interview", "For finalists, with the scoring guides.", st.scoring.done));
  if (has("manager")) out.push(t("decision", "Record decisions", "Each decision needs a reason.", st.decision.done));
  if (has("hr")) out.push(t("decision", "Check fairness and close the round", "Pass rates by group, rater agreement and records.", st.decision.done));
  return out;
}

export const ROLE_LABEL: Record<TeamRole, string> = {
  builder: "Builds the test",
  hr: "HR",
  expert: "Job expert",
  rater: "Rater",
  manager: "Hiring manager",
};

/** Methods are identified by kind + label so an override sticks to the method it was made on. */
export const methodKey = (m: { kind: MethodKind; label: string }) => `${m.kind}:${m.label}`;

export function newJob(input: { id: string; title: string; organization: string; onet: Job["onet"]; team: Member[]; now: string; fictional?: boolean }): Job {
  return {
    id: input.id,
    title: input.title,
    organization: input.organization,
    fictional: input.fictional ?? false,
    createdAt: input.now,
    onet: input.onet,
    team: input.team,
    description: { versions: [], source: "none", skipped: false, approvedBy: null },
    analysis: { ratings: {}, confirmedBy: null },
    plan: { answers: {}, overrides: [], approvedBy: null },
    test: { expertApprovedBy: null, hrApprovedBy: null },
    candidates: [],
    kit: false,
  };
}

/** Experts' ratings combined per element: average importance, how many said day one, and whether they agree. */
export function ratingSummary(job: Job) {
  const by = new Map<string, ExpertRating[]>();
  for (const list of Object.values(job.analysis.ratings)) for (const r of list) by.set(r.elementId, [...(by.get(r.elementId) ?? []), r]);
  return [...by.entries()].map(([elementId, rs]) => {
    const imps = rs.filter((r) => r.applies).map((r) => r.importance);
    const mean = imps.length ? imps.reduce((a, b) => a + b, 0) / imps.length : 0;
    const spread = imps.length ? Math.max(...imps) - Math.min(...imps) : 0;
    return { elementId, raters: rs.length, mean, dayOne: rs.filter((r) => r.dayOne).length, agree: spread <= 1 };
  });
}
