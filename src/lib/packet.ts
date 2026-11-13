// Hiring team packet: one work sample, a finalist teach-back and a structured interview,
// each scored on written 1–5 anchors (BARS). This is the shape the AI generator will fill.

export type Anchors = [string, string, string, string, string];

export interface RubricLine {
  id: string;
  name: string;
  critical: boolean;
  anchors: Anchors; // index 0 = score 1 … index 4 = score 5; score 3 = day-one standard
}

export interface ChainRow {
  task: string; // O*NET job task
  skill: string; // day-one skill
  testedIn: "Work sample" | "Teach-back" | "Interview";
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
    minutes: number;
    task: string;
    skill: string;
    materials: string;
    instructions: string;
    rubric: RubricLine[];
  };
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
    if (lines.length < 2 || lines.length > 4) out.push(`${where}: use 2 to 4 rubric lines`);
    if (!lines.some((l) => l.critical)) out.push(`${where}: mark at least one line critical`);
    for (const l of lines) if (l.anchors.some((a) => !a.trim())) out.push(`${where}: "${l.name}" needs all five anchors written`);
  };
  rubric("Work sample", p.workSample.rubric);
  rubric("Teach-back", p.teachBack.rubric);
  if (p.interview.questions.length < 3) out.push("Interview: use at least 3 questions");
  for (const q of p.interview.questions) if (q.anchors.some((a) => !a.trim())) out.push(`Interview: question ${q.id} needs all five anchors`);
  for (const where of ["Work sample", "Teach-back", "Interview"] as const)
    if (!p.chain.some((c) => c.testedIn === where)) out.push(`${where} isn't linked to a job task`);
  return out;
}
