import type { Decision, Sheet } from "@/lib/kit-rules";

// Fictional candidates for the Northwind Health L&D Specialist demo kit.
// Raters only ever see `id`; names appear for HR and, after the work sample, the hiring manager.
export interface KitCandidate {
  id: string;
  name: string;
  appliedAt: string;
  qualification: "met" | "hr_review";
  qualificationNote?: string;
  group?: string; // optional self-reported group, fictional; only HR and analysts ever see it
  response: string; // work sample submission
}

export const kitCandidates: KitCandidate[] = [
  {
    id: "C-1041",
    group: "Group A",
    name: "Riley Brooks",
    appliedAt: "2026-10-28",
    qualification: "met",
    response:
      "Objectives: (1) Given 5 mixed urgent and routine requests arriving in pairs, route 5 of 5 to the correct queue. (2) State the 3 urgent signs from memory with no prompts.\n\nPractice (18 min): Pairs of learners get request cards two at a time from a shuffled deck, with a 60-second timer. Partner checks against the routing key and gives feedback after each round. Rounds 3–4 add after-hours requests.\n\nCheck (7 min): Each learner routes a new set of 5 paired cards alone. Pass = 5 of 5. Anyone below gets a 10-minute follow-up with their supervisor that week.",
  },
  {
    id: "C-1042",
    group: "Group B",
    name: "Jordan Ellis",
    appliedAt: "2026-10-29",
    qualification: "met",
    response:
      "Objectives: (1) Schedulers will correctly route urgent requests, 5 of 5, in a timed check. (2) Schedulers will name the after-hours route without notes.\n\nPractice: I'd walk through the policy slides (15 min) with examples of each request type, then open it up for questions and stories from the floor (10 min).\n\nCheck (5 min): Timed routing of 5 requests; pass = 5 of 5, with a re-check the next week for anyone who misses.",
  },
  {
    id: "C-1043",
    group: "Group A",
    name: "Casey Morgan",
    appliedAt: "2026-10-30",
    qualification: "met",
    response:
      "Objectives: Learners will understand the urgent routing policy and be able to route urgent calls correctly.\n\nPractice (20 min): Role-play where one person calls in with a request and the other routes it. Two callers phone in at the same time in the last round.\n\nCheck: Short quiz on the policy at the end, plus a feedback form.",
  },
  {
    id: "C-1044",
    group: "Group B",
    name: "Morgan Lee",
    appliedAt: "2026-11-03",
    qualification: "met",
    response:
      "Objectives: (1) Route two simultaneous requests correctly in under 2 minutes, 4 of 5 times. (2) Explain to a peer why urgent beats first-come.\n\nPractice (15 min): Whiteboard scenarios with two requests at once; groups decide and I give feedback on each.\n\nCheck (8 min): Each person routes 5 pairs alone. I record who meets 4 of 5.",
  },
  {
    id: "C-1045",
    group: "Group B",
    name: "Avery Kim",
    appliedAt: "2026-11-04",
    qualification: "hr_review",
    qualificationNote: "Answered “No” to a relevant degree; lists 6 years as a nurse educator.",
    response: "",
  },
];

// Benchmark responses with expert scores, used for rater calibration before live scoring.
export const kitBenchmarks = [
  {
    id: "B1",
    label: "Benchmark A",
    response:
      "Objective: understand the routing policy. Activity: 25-minute presentation of the policy with Q&A. Check: satisfaction survey.",
    expert: { objectives: 1, practice: 1, check: 1 },
  },
  {
    id: "B2",
    label: "Benchmark B",
    response:
      "Objectives: route urgent requests correctly; know the after-hours number. Practice (15 min): learners route sample requests one at a time from a worksheet and compare answers. Check: route 5 requests alone.",
    expert: { objectives: 3, practice: 3, check: 3 },
  },
  {
    id: "B3",
    label: "Benchmark C",
    response:
      "Objectives: (1) route 5 of 5 paired requests in under 90 seconds each; (2) name the 3 urgent signs unprompted. Practice: timed pairs of requests that get harder each round, with partner feedback. Check: 5 new pairs alone, pass = 5 of 5, follow-up session for misses.",
    expert: { objectives: 5, practice: 5, check: 5 },
  },
];

const sheet = (
  candidateId: string,
  step: Sheet["step"],
  raterId: string,
  scores: Record<string, number>,
  notes: Record<string, string>,
  submittedAt: string,
): Sheet => ({ id: `${candidateId}-${step}-${raterId}`, candidateId, step, raterId, scores, notes, submittedAt, history: [] });

export const kitSeedSheets: Sheet[] = [
  sheet("C-1041", "work_sample", "sam", { objectives: 4, practice: 4, check: 3 }, { practice: "Paired, timed rounds with partner feedback" }, "2026-11-05T16:10:00Z"),
  sheet("C-1041", "work_sample", "lena", { objectives: 4, practice: 4, check: 3 }, { check: "Check has a standard; follow-up is vague" }, "2026-11-05T18:40:00Z"),
  sheet("C-1042", "work_sample", "sam", { objectives: 4, practice: 1, check: 4 }, { practice: "Slides and discussion only" }, "2026-11-06T15:00:00Z"),
  sheet("C-1042", "work_sample", "lena", { objectives: 4, practice: 1, check: 4 }, { practice: "No hands-on routing at all" }, "2026-11-06T17:20:00Z"),
  sheet("C-1043", "work_sample", "sam", { objectives: 2, practice: 2, check: 2 }, { practice: "Role-play is one call at a time until the end" }, "2026-11-07T15:30:00Z"),
  sheet("C-1043", "work_sample", "lena", { objectives: 2, practice: 4, check: 2 }, { practice: "Last round has two callers at once" }, "2026-11-07T19:05:00Z"),
  sheet("C-1041", "teach_back", "daniel", { checks: 4, clear: 4, confusion: 3 }, { confusion: "Re-explained with a new example; didn't check it landed" }, "2026-11-10T17:00:00Z"),
];

export const kitSeedDecisions: Decision[] = [];

// Seeded calibration results: Sam and Lena are calibrated; Nicole (third rater) still has to calibrate.
export const kitSeedCalibration: Record<string, Record<string, Record<string, number>>> = {
  sam: { B1: { objectives: 1, practice: 1, check: 2 }, B2: { objectives: 3, practice: 3, check: 3 }, B3: { objectives: 5, practice: 4, check: 5 } },
  lena: { B1: { objectives: 1, practice: 2, check: 1 }, B2: { objectives: 3, practice: 3, check: 4 }, B3: { objectives: 5, practice: 5, check: 5 } },
};
