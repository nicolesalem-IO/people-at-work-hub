import { newJob, type ExpertRating, type Job, type Member } from "@/lib/workflow";

// Fictional demo workspace. Two jobs at different points in the same workflow the real product uses:
// an L&D Specialist hire that's being scored, and a Plumber hire that's just starting.

const at = (d: string) => `${d}T15:00:00.000Z`;

const ldTeam: Member[] = [
  { id: "nicole", name: "Nicole", email: "nicole@example.test", roles: ["builder"] },
  { id: "maya", name: "Maya Chen", email: "maya@example.test", roles: ["hr"] },
  { id: "daniel", name: "Daniel Okafor", email: "daniel@example.test", roles: ["manager", "expert"] },
  { id: "priya", name: "Priya Shah", email: "priya@example.test", roles: ["expert"] },
  { id: "lena", name: "Lena Park", email: "lena@example.test", roles: ["rater"] },
  { id: "sam", name: "Sam Ortiz", email: "sam@example.test", roles: ["rater"] },
];

const r = (elementId: string, importance: number, dayOne: boolean, d = "2026-10-14"): ExpertRating => ({ elementId, importance, dayOne, applies: true, at: at(d) });

const LD_DESCRIPTION = `Learning & Development Specialist, Northwind Health (Patient Access)

About the job
You design and run short, practical training for our 40 schedulers and patient access staff, and check that it changes how they work.

What you'll do
- Find out what staff need to learn, using audit results, supervisor input and call data.
- Design short training sessions with clear goals, hands-on practice and a check at the end.
- Run sessions in person and online, often in 15–30 minute blocks so phones stay covered.
- Measure whether training worked (audit accuracy, time to route requests) and revise it.
- Keep training materials and job aids up to date when policies change.

What you need on day one
- Experience designing and delivering workplace training.
- Clear writing and speaking for staff with different backgrounds.
- Comfort using simple data to judge whether training worked.`;

const ld: Job = {
  ...newJob({ id: "demo-ld", title: "Learning & Development Specialist", organization: "Northwind Health", onet: { code: "13-1151.00", title: "Training and Development Specialists" }, team: ldTeam, now: at("2026-10-01"), fictional: true }),
  kit: true,
  description: {
    versions: [
      { at: at("2026-10-02"), by: "Nicole", text: LD_DESCRIPTION.replace("in 15–30 minute blocks so phones stay covered", "in person"), note: "Uploaded the current posting." },
      { at: at("2026-10-06"), by: "Nicole", text: LD_DESCRIPTION, note: "Added short sessions and the measures supervisors use, after Priya's review." },
    ],
    source: "uploaded",
    skipped: false,
    approvedBy: "Nicole",
  },
  analysis: {
    ratings: {
      priya: [r("2.B.1.e", 5, true), r("2.A.1.d", 4, true), r("2.C.6", 5, true), r("2.A.2.c", 4, true), r("94", 5, true), r("20475", 4, false), r("19559", 3, false)],
      daniel: [r("2.B.1.e", 5, true, "2026-10-15"), r("2.A.1.d", 5, true, "2026-10-15"), r("2.C.6", 4, true, "2026-10-15"), r("2.A.2.c", 4, true, "2026-10-15"), r("94", 5, true, "2026-10-15"), r("20475", 3, false, "2026-10-15"), r("19559", 4, false, "2026-10-15")],
    },
    confirmedBy: "Nicole",
  },
  plan: {
    answers: { volume: "low", license: false },
    overrides: [
      { key: "roleplay:Live exercise (role-play or teach-back)", label: "Live exercise (role-play or teach-back)", decision: "keep", reason: "Run it as a 10-minute teach-back: trainers teach a new skill to a confused learner, which is the core of this job.", by: "Priya Shah", at: at("2026-10-20") },
      { key: "aptitude:Verbal reasoning test", label: "Verbal reasoning test", decision: "drop", reason: "The written skills assessment already shows reading and writing at the level this job needs.", by: "Priya Shah", at: at("2026-10-20") },
    ],
    approvedBy: "Nicole",
  },
  test: { expertApprovedBy: "Priya Shah", hrApprovedBy: "Maya Chen" },
};

const plumbTeam: Member[] = [
  { id: "nicole", name: "Nicole", email: "nicole@example.test", roles: ["builder"] },
  { id: "maya", name: "Maya Chen", email: "maya@example.test", roles: ["hr"] },
  { id: "marcus", name: "Marcus Reed", email: "marcus@example.test", roles: ["expert", "manager"] },
  { id: "priya", name: "Priya Shah", email: "priya@example.test", roles: ["expert"] },
  { id: "sam", name: "Sam Ortiz", email: "sam@example.test", roles: ["rater"] },
];

const plumber: Job = {
  ...newJob({ id: "demo-plumber", title: "Plumber", organization: "Northwind Health Facilities", onet: { code: "47-2152.00", title: "Plumbers, Pipefitters, and Steamfitters" }, team: plumbTeam, now: at("2026-11-10"), fictional: true }),
  description: {
    versions: [
      {
        at: at("2026-11-10"),
        by: "Nicole",
        note: "Uploaded the posting from the facilities team.",
        text: `Plumber, Northwind Health Facilities

Maintain and repair water, drain, steam and medical gas piping across two hospital campuses. Respond to urgent leaks, replace fixtures, and keep work orders up to date. Must hold a state journeyman plumbing license. Some evenings and on-call weekends.`,
      },
    ],
    source: "uploaded",
    skipped: false,
    approvedBy: null,
  },
};

export const demoJobs = (): Job[] => [ld, plumber].map((j) => structuredClone(j));
