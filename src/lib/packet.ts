// Hiring team packet: a skills assessment built from the job, aptitude tests when the job analysis calls for them,
// a finalist teach-back and a structured interview, each scored with written guides. This is the shape the AI generator will fill.

export type Anchors = [string, string, string, string, string];

export interface RubricLine {
  id: string;
  name: string;
  critical: boolean;
  anchors: Anchors; // index 0 = score 1 … index 4 = score 5; score 3 = day-one standard
  part?: string; // which part of the assessment it scores, e.g. "Part 1, item 2"
}

export interface AssessmentPart {
  title: string; // e.g. "Part 1: Training design"
  intro?: string;
  items: { label: string; detail: string; examples?: string }[];
}

export interface AptitudeModule {
  name: string; // e.g. "Numerical reasoning"
  decision: "included" | "not_included";
  reason: string; // tied to the job analysis
  items?: number;
  minutes?: number;
  scoring?: string;
}

export interface ChainRow {
  task: string; // O*NET job task
  skill: string; // day-one skill
  testedIn: "Skills assessment" | "Aptitude test" | "Teach-back" | "Interview";
  lines: string; // rubric lines that score it
}

export interface InterviewQuestion {
  id: string;
  question: string;
  followUp: string;
  measures: string;
  anchors: Anchors;
}

export interface PacketData {
  role: string;
  organization: string;
  onetCode: string;
  date: string; // ISO date
  fictional: boolean;
  chain: ChainRow[];
  notTested: { skill: string; reason: string }[];
  workSample: {
    title: string;
    format: "take_home" | "timed";
    time: string; // how long candidates should plan on, e.g. "About 2 hours"
    window: string; // e.g. "3 business days from your invitation"
    task: string;
    skill: string;
    instructions: string[]; // general rules shown first: length, tone, what not to include
    submission: { format: string; maxLength: string; fileName: string; how: string };
    scenario: string;
    parts: AssessmentPart[];
    rubric: RubricLine[];
  };
  aptitude: AptitudeModule[];
  teachBack: {
    minutes: number;
    teachMinutes: number;
    setup: string;
    confusedLine: string;
    task: string;
    skill: string;
    rubric: RubricLine[];
  };
  interview: {
    minutes: number;
    opening: string;
    questions: InterviewQuestion[];
    dontAsk: string;
  };
}

export const PASS_AVERAGE = 3;
export const CRITICAL_FLOOR = 2;
export const SCORE_LABELS = ["Far below", "Below", "Day-one standard", "Above", "Well above"] as const;

/** Applies the pass rule to one set of rubric scores (1–5 per line). */
export function passRule(lines: RubricLine[], scores: Record<string, number>) {
  const vals = lines.map((l) => scores[l.id] ?? 0);
  if (vals.some((v) => !(v >= 1 && v <= 5))) return { complete: false as const };
  const average = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  const failedCritical = lines.filter((l) => l.critical && (scores[l.id] ?? 0) < CRITICAL_FLOOR).map((l) => l.name);
  return { complete: true as const, average, failedCritical, pass: average >= PASS_AVERAGE && failedCritical.length === 0 };
}

/** Problems that would make a packet unusable; an empty list means it can go to experts for approval. */
export function packetProblems(p: PacketData): string[] {
  const out: string[] = [];
  const rubric = (where: string, lines: RubricLine[]) => {
    if (lines.length < 2 || lines.length > 8) out.push(`${where}: use 2 to 8 rubric lines`);
    if (!lines.some((l) => l.critical)) out.push(`${where}: mark at least one line critical`);
    for (const l of lines) if (l.anchors.some((a) => !a.trim())) out.push(`${where}: "${l.name}" needs all five anchors written`);
  };
  rubric("Work sample", p.workSample.rubric);
  const sub = p.workSample.submission;
  if (![sub.format, sub.maxLength, sub.fileName, sub.how].every((x) => x.trim()))
    out.push("Work sample: say exactly what to submit (format, length, file name, how)");
  if (!p.workSample.parts.length || p.workSample.parts.some((pt) => !pt.items.length))
    out.push("Work sample: every part needs at least one numbered item");
  for (const m of p.aptitude) if (!m.reason.trim()) out.push(`Aptitude: explain why ${m.name} is ${m.decision === "included" ? "included" : "left out"}`);
  rubric("Teach-back", p.teachBack.rubric);
  if (p.interview.questions.length < 3) out.push("Interview: use at least 3 questions");
  for (const q of p.interview.questions) if (q.anchors.some((a) => !a.trim())) out.push(`Interview: question ${q.id} needs all five anchors`);
  for (const where of ["Skills assessment", "Teach-back", "Interview"] as const)
    if (!p.chain.some((c) => c.testedIn === where)) out.push(`${where} isn't linked to a job task`);
  return out;
}

// Aptitude tests are added only when the job analysis supports them.
const APTITUDE_SIGNALS: Record<string, string[]> = {
  "Numerical reasoning": ["Mathematics", "Mathematical Reasoning", "Number Facility"],
  "Verbal reasoning": ["Reading Comprehension", "Written Comprehension"],
  "Logical reasoning": ["Deductive Reasoning", "Inductive Reasoning", "Information Ordering"],
  Coding: ["Programming"],
  "Mechanical reasoning": ["Mechanical"],
};

/**
 * Recommends aptitude modules from ratings (1–5). "recommended" when a related ability or skill is rated 4+
 * and experts said it's needed on day one; "consider" when it's 4+ but day-one need is unknown; otherwise left out.
 * `coveredBySkills` lists abilities the skills assessment already measures, so they aren't tested twice.
 */
export function recommendAptitude(
  ratings: { name: string; importance: number | null; entry?: boolean }[],
  coveredBySkills: string[] = [],
) {
  return Object.entries(APTITUDE_SIGNALS).map(([module, names]) => {
    const hits = ratings.filter((r) => names.includes(r.name) && (r.importance ?? 0) >= 4 && !coveredBySkills.includes(r.name));
    const top = ratings.filter((r) => names.includes(r.name)).sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))[0];
    const level: "recommended" | "consider" | "not_needed" = !hits.length ? "not_needed" : hits.some((h) => h.entry === true) ? "recommended" : "consider";
    return { module, level, because: hits.map((h) => `${h.name} ${h.importance}`), top: top ? `${top.name} ${top.importance ?? "unrated"}` : null };
  });
}
