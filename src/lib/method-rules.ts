import { recommendAptitude } from "./packet";

/** Criterion-based choice of assessment methods. Every method chosen (or skipped) cites the criterion and the data
 *  behind it, so the plan can be explained and defended. Experts confirm or override each choice with a reason.
 *
 *  Criteria, checked in order:
 *   1. How the work is done (hands-on, with people, analytical, written/digital) → the main method
 *   2. License or credential required → verify it; don't re-test what it covers
 *   3. Safety, tools or equipment → on site and supervised, never at home
 *   4. Risk of outside help or AI → timed/proctored, or a walk-through of the submission
 *   5. Needed on day one vs trainable → only day-one skills are tested
 *   6. Hiring volume → a short screen first when there are many applicants
 *   7. Fairness → prefer work samples; aptitude tests only when the job clearly calls for them
 *   8. Candidate burden → time limits by job level; flag long tests as possibly paid */

export type Signal = { name: string; importance: number | null };
export type Mode = "hands_on" | "people" | "analytic" | "written";
export type MethodKind = "license" | "practical" | "roleplay" | "work_sample" | "timed_sample" | "sjt" | "knowledge" | "aptitude" | "interview";
export type Stage = "screen" | "main" | "finalists" | "before_offer";
export type Status = "required" | "recommended" | "consider" | "confirm";

export type Method = {
  kind: MethodKind;
  label: string;
  stage: Stage;
  delivery: string;
  time: string;
  status: Status;
  because: string[];
};
export type CriterionResult = { n: number; name: string; result: string; source: string };
export type Answers = { license?: boolean; volume?: "low" | "high"; remoteOk?: boolean };
export type MethodPlan = {
  mode: Mode;
  /** Plain description of how the work is done (may name two modes). */
  modeSummary: string;
  modeScores: Record<Mode, number>;
  modeEvidence: string[];
  jobZone: number | null;
  methods: Method[];
  criteria: CriterionResult[];
  questions: string[];
};

export const MODE_LABEL: Record<Mode, string> = {
  hands_on: "Hands-on work with tools, equipment or materials",
  people: "Work with customers, clients or the public",
  analytic: "Analysis, numbers and problem solving",
  written: "Written and computer-based work",
};
export const STAGE_LABEL: Record<Stage, string> = {
  screen: "Screen",
  main: "Main test",
  finalists: "Finalists",
  before_offer: "Before the offer",
};

/** O*NET skills, abilities, knowledge areas and work activities that show how the work is done. */
export const MODE_SIGNALS: Record<Mode, string[]> = {
  hands_on: [
    "Manual Dexterity", "Arm-Hand Steadiness", "Finger Dexterity", "Static Strength", "Multilimb Coordination",
    "Control Precision", "Trunk Strength", "Extent Flexibility", "Repairing", "Equipment Maintenance", "Installation",
    "Operation and Control", "Equipment Selection", "Mechanical", "Building and Construction",
    "Handling and Moving Objects", "Repairing and Maintaining Mechanical Equipment", "Performing General Physical Activities",
    "Controlling Machines and Processes", "Operating Vehicles, Mechanized Devices, or Equipment",
    "Inspecting Equipment, Structures, or Materials", "Repairing and Maintaining Electronic Equipment",
  ],
  people: [
    "Customer and Personal Service", "Service Orientation", "Social Perceptiveness", "Persuasion", "Negotiation",
    "Instructing", "Speaking", "Active Listening", "Oral Expression", "Assisting and Caring for Others",
    "Performing for or Working Directly with the Public", "Communicating with People Outside the Organization",
    "Resolving Conflicts and Negotiating with Others", "Training and Teaching Others", "Selling or Influencing Others",
  ],
  analytic: [
    "Mathematics", "Mathematical Reasoning", "Number Facility", "Critical Thinking", "Complex Problem Solving",
    "Deductive Reasoning", "Inductive Reasoning", "Systems Analysis", "Judgment and Decision Making",
    "Analyzing Data or Information", "Processing Information", "Programming", "Science",
  ],
  // Producing written work. Reading and language comprehension are left out: every job needs them, so they
  // don't show how the work is done.
  // General computer use is left out for the same reason: nearly every office job rates it high.
  written: ["Writing", "Written Expression", "Documenting/Recording Information", "Clerical"],
};

const HAZARD = /hazard|protective or safety equipment|safety equipment|exposed to/i;
const SAFETY_KNOWLEDGE = ["Public Safety and Security", "Building and Construction"];

/** Jobs that need a license or certificate to work. Matched by O*NET-SOC code prefix; experts confirm for others. */
export const LICENSED: { prefix: string; credential: string }[] = [
  { prefix: "47-2152", credential: "plumbing license (journeyman or master, as your state requires)" },
  { prefix: "47-2111", credential: "electrical license" },
  { prefix: "49-9021", credential: "EPA Section 608 certification" },
  { prefix: "53-3032", credential: "commercial driver's license (CDL)" },
  { prefix: "53-3033", credential: "driver's license with a clean driving record, as your insurer requires" },
  { prefix: "29-1141", credential: "registered nurse (RN) license" },
  { prefix: "29-2061", credential: "practical nurse (LPN/LVN) license" },
  { prefix: "29-1051", credential: "pharmacist license" },
  { prefix: "29-1", credential: "state license for this health occupation" },
  { prefix: "29-2", credential: "state license or certification for this health occupation" },
  { prefix: "23-1011", credential: "bar admission" },
  { prefix: "39-5012", credential: "cosmetology license" },
  { prefix: "33-2011", credential: "firefighter certification" },
  { prefix: "47-2061", credential: "any state or OSHA safety certification your sites require" },
];
export const licenseFor = (code: string) => LICENSED.find((l) => code.startsWith(l.prefix))?.credential ?? null;

const fmt = (n: number) => (Math.round(n * 10) / 10).toFixed(1);

/** Mean of the three strongest signals for a mode (one stray rating can't decide the method). */
function modeScore(signals: Signal[], mode: Mode) {
  const names = new Set(MODE_SIGNALS[mode]);
  const best = new Map<string, number>();
  for (const s of signals) if (names.has(s.name) && s.importance !== null) best.set(s.name, Math.max(best.get(s.name) ?? 0, s.importance));
  const top = [...best.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  return { score: top.length ? top.reduce((t, [, v]) => t + v, 0) / top.length : 0, top };
}

export function chooseMethods(input: { code: string; signals: Signal[]; jobZone: number | null; answers?: Answers }): MethodPlan {
  const { code, signals, jobZone } = input;
  const a = input.answers ?? {};
  const scored = (Object.keys(MODE_SIGNALS) as Mode[]).map((m) => ({ mode: m, ...modeScore(signals, m) }));
  const modeScores = Object.fromEntries(scored.map((s) => [s.mode, Math.round(s.score * 100) / 100])) as Record<Mode, number>;
  const hands = scored.find((s) => s.mode === "hands_on")!;
  // Hands-on work wins when it is clearly important: it can't be shown on paper.
  const ranked = hands.score >= 3.5 ? [hands, ...scored.filter((s) => s !== hands).sort((x, y) => y.score - x.score)] : [...scored].sort((x, y) => y.score - x.score);
  let primary = ranked[0]!;
  // Live exercises need an assessor for every candidate. When a people-facing job also has substantial written or
  // analytic work, that work sample comes first and the live exercise moves to finalists (criteria 6 and 8).
  let liveMovedToFinalists = false;
  if (primary.mode === "people" && ranked[1] && ranked[1].mode !== "hands_on" && ranked[1].score >= 3.75) {
    primary = ranked[1];
    liveMovedToFinalists = true;
  }
  const secondary = ranked.find((s) => s !== primary && s.score >= 3.75 && primary.score - s.score <= 0.6 && !(s.mode === "analytic" && primary.mode === "written") && !(s.mode === "written" && primary.mode === "analytic"));
  const mode = primary.mode;
  const evidence = primary.top.map(([n, v]) => `${n} ${fmt(v)}`);

  const zone = jobZone ?? 3;
  const credential = a.license === false ? null : licenseFor(code);
  const licensed = Boolean(credential) || a.license === true;
  const hazard = signals.filter((s) => HAZARD.test(s.name) && (s.importance ?? 0) >= 3.5);
  const safetyKnow = signals.filter((s) => SAFETY_KNOWLEDGE.includes(s.name) && (s.importance ?? 0) >= 3.5);
  const onSiteNeeded = mode === "hands_on" || hazard.length > 0;
  const methods: Method[] = [];
  const questions: string[] = [];

  // 2. License
  if (licensed)
    methods.push({ kind: "license", label: "License check", stage: "before_offer", delivery: "Records check", time: "No candidate time", status: "required", because: [`Criterion 2: this job requires a ${credential ?? "license or certificate"}. Verify it rather than re-testing what it covers.`] });
  else if (mode === "hands_on" && zone >= 3) {
    methods.push({ kind: "license", label: "License check", stage: "before_offer", delivery: "Records check", time: "No candidate time", status: "confirm", because: ["Criterion 2: skilled hands-on trades often need a license or certificate. Confirm with your experts."] });
    questions.push("Does this job require a license or certificate in your state? If yes, we verify it before the offer.");
  }

  // 6. Volume → screen
  const screenLabel = mode === "hands_on" || licensed ? "Short job knowledge check" : "Situational judgment questions";
  if (a.volume === "high")
    methods.push({ kind: mode === "hands_on" || licensed ? "knowledge" : "sjt", label: screenLabel, stage: "screen", delivery: "Online, timed", time: "About 20 minutes", status: "recommended", because: ["Criterion 6: many applicants. A short, job-based screen narrows the pool before the time-intensive main test."] });
  else if (a.volume === undefined) {
    if (zone <= 2) methods.push({ kind: mode === "hands_on" ? "knowledge" : "sjt", label: screenLabel, stage: "screen", delivery: "Online, timed", time: "About 20 minutes", status: "consider", because: ["Criterion 6: entry-level jobs often get many applicants. Add a short screen if you expect more than about 50 per opening."] });
    questions.push("About how many applicants do you expect per opening? Over about 50 adds a short online screen first.");
  }

  // 3. Safety and code knowledge for licensed or hazardous hands-on work
  if (mode === "hands_on" && (licensed || safetyKnow.length))
    methods.push({ kind: "knowledge", label: licensed ? "Safety and local code check" : "Safety knowledge check", stage: "main", delivery: "On site, before the practical", time: "About 15 minutes", status: "recommended", because: [`Criterion 3: ${safetyKnow.length ? `O*NET rates ${safetyKnow.map((s) => `${s.name} ${fmt(s.importance ?? 0)}`).join(", ")}` : "safety-sensitive work"}.${licensed ? " The license covers general trade knowledge, so this checks only safety and local code." : ""}`] });

  // 1 + 3 + 4 + 8. Main method from how the work is done
  const peopleEv = scored.find((x) => x.mode === "people")!.top.map(([n, v]) => `${n} ${fmt(v)}`).join(", ");
  const modeSummary = liveMovedToFinalists
    ? `${MODE_LABEL.people}, plus ${MODE_LABEL[mode].toLowerCase()}`
    : MODE_LABEL[mode];
  const why1 = liveMovedToFinalists
    ? `Criterion 1: the job combines work with people (O*NET: ${peopleEv}) with ${MODE_LABEL[mode].toLowerCase()} (O*NET: ${evidence.join(", ")}). This test covers the written side; the live exercise covers the people side.`
    : `Criterion 1: the work is mainly ${MODE_LABEL[mode].toLowerCase()} (O*NET: ${evidence.join(", ")}).`;
  if (mode === "hands_on")
    methods.push({ kind: "practical", label: "Hands-on practical", stage: "main", delivery: "On site, supervised by two trained raters", time: zone >= 3 ? "45 to 90 minutes" : "30 to 45 minutes", status: "required", because: [why1, `Criterion 3: real tools and equipment${hazard.length ? ` and hazards (${hazard.map((h) => h.name).slice(0, 2).join("; ")})` : ""}, so it's done on site with safety equipment provided, never at home.`, "Criterion 4: done in person, so it's the candidate's own work."] });
  else if (mode === "people")
    methods.push({ kind: "roleplay", label: "Role-play simulation", stage: "main", delivery: "Live (in person or video), with a trained role-player", time: "20 to 30 minutes", status: "required", because: [why1, "Criterion 4: live, so it's the candidate's own work and AI can't do it for them."] });
  else {
    const remote = a.remoteOk !== false && zone >= 3;
    const cap = zone >= 5 ? "About 3 hours" : zone === 4 ? "About 2 hours" : "About 90 minutes";
    methods.push(
      remote
        ? { kind: "work_sample", label: "Take-home skills assessment", stage: "main", delivery: "Take-home, written", time: cap, status: "required", because: [why1, `Criterion 8: job level ${zone} of 5, so up to ${cap.toLowerCase().replace("about ", "")} is reasonable${zone >= 5 ? "; consider paying candidates for tests this long" : ""}.`, "Criterion 4: outside help is possible at home, so finalists walk the raters through their submission in the interview."] }
        : { kind: "timed_sample", label: "Timed skills assessment", stage: "main", delivery: "Online, timed and proctored", time: "45 to 60 minutes", status: "required", because: [why1, `Criterion 8: job level ${zone} of 5, so a short timed test fits better than a long take-home.`, "Criterion 4: timed and proctored, so it's the candidate's own work."] },
    );
  }

  // Secondary mode → a second, shorter method for finalists
  if (secondary) {
    const ev = secondary.top.map(([n, v]) => `${n} ${fmt(v)}`).join(", ");
    if (secondary.mode === "people")
      methods.push({ kind: "roleplay", label: "Live exercise (role-play or teach-back)", stage: "finalists", delivery: "Live, with a trained role-player", time: "15 to 20 minutes", status: liveMovedToFinalists ? "required" : "recommended", because: [`Criterion 1: working with people is ${liveMovedToFinalists ? "the most important part of this job" : "also central"} (O*NET: ${ev}). A written test can't show it.`, ...(liveMovedToFinalists ? ["Criteria 6 and 8: live exercises need an assessor for every candidate, so they come after the written test, for finalists only."] : [])] });
    else if (secondary.mode === "hands_on")
      methods.push({ kind: "practical", label: "Short hands-on task", stage: "finalists", delivery: "On site, supervised", time: "20 to 30 minutes", status: "recommended", because: [`Criterion 1: hands-on work is also important (O*NET: ${ev}).`] });
    else if (mode === "hands_on" || mode === "people")
      methods.push({ kind: "timed_sample", label: "Short written exercise", stage: "finalists", delivery: "On site or online, timed", time: "20 to 30 minutes", status: "consider", because: [`Criterion 1: ${MODE_LABEL[secondary.mode].toLowerCase()} also matters (O*NET: ${ev}), e.g. writing up a job or a customer record.`] });
  }

  // 7. Fairness: aptitude only when the job clearly calls for it
  const apt = recommendAptitude(signals.map((s) => ({ name: s.name, importance: s.importance })));
  const aptNeeded = apt.filter((r) => r.level !== "not_needed");
  for (const r of aptNeeded)
    methods.push({ kind: "aptitude", label: `${r.module} test`, stage: mode === "analytic" || mode === "written" ? "screen" : "main", delivery: "Online, timed", time: "About 15 minutes", status: "consider", because: [`Criterion 7: O*NET rates ${r.because.join(", ")} of 5. Aptitude tests show larger group differences than work samples, so include it only if your experts confirm it's needed on day one and the main test doesn't already cover it.`] });

  methods.push({ kind: "interview", label: "Structured interview", stage: "finalists", delivery: "Live, same questions for everyone", time: "20 to 30 minutes", status: "required", because: ["For work styles a test can't show (dependability, teamwork). Scored with written guides."] });

  const order: Stage[] = ["screen", "main", "finalists", "before_offer"];
  methods.sort((x, y) => order.indexOf(x.stage) - order.indexOf(y.stage));

  const main = methods.find((m) => m.stage === "main" && ["practical", "roleplay", "work_sample", "timed_sample"].includes(m.kind))!;
  const criteria: CriterionResult[] = [
    { n: 1, name: "How the work is done", result: `${modeSummary} → ${main.label.toLowerCase()}${secondary ? `, then ${methods.find((m) => m.stage === "finalists" && m.kind !== "interview")?.label.toLowerCase() ?? "a second exercise"} for finalists` : ""}.`, source: `O*NET: ${liveMovedToFinalists ? `${peopleEv}; ` : ""}${evidence.join(", ")}` },
    { n: 2, name: "License or credential", result: licensed ? `Required: ${credential ?? "license or certificate"}. Verified, not re-tested.` : mode === "hands_on" && zone >= 3 ? "Possibly required. Experts confirm." : "None expected.", source: credential ? "Licensed occupation (O*NET-SOC code)" : "Expert question" },
    { n: 3, name: "Safety, tools or equipment", result: onSiteNeeded ? "Yes, so testing is on site and supervised, never at home." : "No special equipment. Remote testing is fine.", source: hazard.length ? `O*NET work context: ${hazard.map((h) => h.name).slice(0, 2).join("; ")}` : "O*NET skills, abilities and work activities" },
    { n: 4, name: "Outside help or AI", result: main.kind === "work_sample" ? "Possible at home, so finalists walk raters through their submission." : "Low: the main test is live, on site or proctored.", source: "Test format" },
    { n: 5, name: "Day one or trainable", result: "Only skills your experts rate as needed on day one are tested. Trainable skills go to onboarding.", source: "Expert ratings" },
    { n: 6, name: "Hiring volume", result: a.volume === "high" ? "High, so a short screen comes first." : a.volume === "low" ? "Low, so no separate screen." : "Not known yet. Ask the hiring team.", source: "Hiring team" },
    { n: 7, name: "Fairness", result: aptNeeded.length ? `Work samples lead. ${aptNeeded.map((r) => r.module.toLowerCase()).join(", ")} only if experts confirm.` : "Work samples only. No aptitude test needed.", source: "Adverse impact research; four-fifths check after hiring" },
    { n: 8, name: "Candidate burden", result: `Main test: ${main.time.toLowerCase()}. Job level ${jobZone ?? "unknown (assumed 3)"} of 5.`, source: "O*NET job zone" },
  ];
  return { mode, modeSummary, modeScores, modeEvidence: evidence, jobZone, methods, criteria, questions };
}

/** The main test's format, which decides how the AI drafts it and what the candidate is told. */
export function mainFormat(plan: MethodPlan): "take_home" | "timed" | "on_site" | "live" {
  const main = plan.methods.find((m) => m.stage === "main" && ["practical", "roleplay", "work_sample", "timed_sample"].includes(m.kind));
  return main?.kind === "practical" ? "on_site" : main?.kind === "roleplay" ? "live" : main?.kind === "timed_sample" ? "timed" : "take_home";
}
