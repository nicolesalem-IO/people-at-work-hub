import { createServerFn } from "@tanstack/react-start";
import { benchmark } from "@/data/assessment-demo";
import { packetDemo } from "@/data/packet-demo";
import { fetchOccupation, searchOnet } from "./onet.functions";
import { isOnetCode, type OnetElement, type OnetMatch } from "./onet-api";
import {
  ASSESSMENT_PROMPT,
  INTERVIEW_PROMPT,
  assessmentSchema,
  interviewSchema,
  sanitizeAssessment,
  sanitizeInterview,
  templateAssessment,
  type AptitudeSample,
  type WorkSample,
} from "./packet-draft";
import type { InterviewQuestion } from "./packet";
import { pickDayOne, pickTasks, planParts, type QuickPlan } from "./quick-plan";

// Public demo endpoints (signed-out visitors can try them). Protections: input limits, a per-occupation cache,
// and an hourly AI budget so anonymous traffic can't run up AI costs.
const DAY = 24 * 60 * 60 * 1000,
  AI_PER_HOUR = 40;
let budget = { start: Date.now(), used: 0 };
function aiBudget() {
  if (Date.now() - budget.start > 60 * 60 * 1000) budget = { start: Date.now(), used: 0 };
  if (budget.used >= AI_PER_HOUR) return false;
  budget.used++;
  return true;
}

type Loaded = { live: boolean; notice: string; matches: OnetMatch[]; occupation: OnetMatch; elements: OnetElement[] };

async function loadOccupation(input: { title: string; code: string }): Promise<Loaded | { empty: string; live: boolean; matches: OnetMatch[] }> {
  let matches: OnetMatch[] = [];
  try {
    matches = input.code ? [] : await searchOnet(input.title);
    const code = input.code || matches[0]?.code;
    if (!code) return { empty: `No O*NET occupation matched "${input.title}". Try a more common job title.`, live: true, matches };
    const occ = await fetchOccupation(code);
    if (!occ.elements.some((e) => e.kind === "task")) throw new Error("no-details");
    return {
      live: true,
      notice: "",
      matches,
      occupation: { code, title: occ.title || matches.find((m) => m.code === code)?.title || input.title },
      elements: occ.elements,
    };
  } catch {
    // No key, or O*NET unreachable: use the saved, real O*NET benchmark instead of failing.
    return {
      live: false,
      matches: [],
      occupation: { code: benchmark.occupation, title: benchmark.title },
      elements: benchmark.elements as OnetElement[],
      notice: `Live O*NET isn't connected right now, so this shows the saved O*NET benchmark for ${benchmark.title}${input.title && !/train|learn|develop|l&d|instruct/i.test(input.title) ? ` instead of "${input.title}"` : ""}.`,
    };
  }
}

const validate = (d: { title?: string; code?: string }) => {
  const title = String(d?.title ?? "").trim().slice(0, 80),
    code = String(d?.code ?? "").trim();
  if (!isOnetCode(code) && title.length < 2) throw new Error("Type a job title (at least 2 characters).");
  return { title, code: isOnetCode(code) ? code : "" };
};

export const buildQuickPlan = createServerFn({ method: "POST" })
  .inputValidator(validate)
  .handler(async ({ data }): Promise<QuickPlan> => {
    const l = await loadOccupation(data);
    if ("empty" in l)
      return { live: l.live, notice: l.empty, occupation: { code: "", title: "" }, alternatives: l.matches.slice(0, 4), skills: [], tasks: [], parts: [] };
    const skills = pickDayOne(l.elements),
      tasks = pickTasks(l.elements);
    if (!skills.length || !tasks.length)
      return { live: l.live, notice: "O*NET has too little detail for this occupation to draft a plan.", occupation: l.occupation, alternatives: [], skills: [], tasks: [], parts: [] };
    return {
      live: l.live,
      notice: l.notice,
      occupation: l.occupation,
      alternatives: l.matches.filter((m) => m.code !== l.occupation.code).slice(0, 4),
      skills,
      tasks,
      parts: planParts(l.elements, tasks),
    };
  });

export type DraftResult = {
  ai: boolean;
  notice: string;
  assessment?: WorkSample;
  interview?: InterviewQuestion[];
  aptitude?: AptitudeSample[];
};
const cache = new Map<string, { at: number; value: DraftResult }>();

/** Drafts one piece of the hiring packet with Claude. The occupation is re-loaded server-side by code,
 *  so nothing a visitor sends goes into the prompt except the code. */
export const draftSample = createServerFn({ method: "POST" })
  .inputValidator((d: { code?: string; part?: string }) => {
    const code = String(d?.code ?? "").trim();
    if (!isOnetCode(code)) throw new Error("Pick an occupation first.");
    if (d?.part !== "assessment" && d?.part !== "interview") throw new Error("Unknown part.");
    return { code, part: d.part as "assessment" | "interview" };
  })
  .handler(async ({ data }): Promise<DraftResult> => {
    const key = `${data.code}:${data.part}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < DAY) return hit.value;
    const l = await loadOccupation({ title: "", code: data.code });
    if ("empty" in l) return { ai: false, notice: l.empty };
    const role = l.occupation.title,
      tasks = pickTasks(l.elements, 8),
      skills = pickDayOne(l.elements),
      parts = planParts(l.elements, tasks),
      modules = parts.filter((p) => p.kind === "aptitude").map((p) => p.label.replace(/ test$/, ""));
    const fallback = (why = "AI drafting isn't available right now."): DraftResult => {
      if (data.part === "interview") {
        const samePacket = l.occupation.code === benchmark.occupation;
        return { ai: false, notice: `${why} Showing example questions instead.`, interview: samePacket ? packetDemo.interview.questions : packetDemo.interview.questions.slice(0, 3), aptitude: [] };
      }
      return {
        ai: false,
        notice: `${why} Showing a template your experts would fill in.`,
        assessment: l.occupation.code === benchmark.occupation ? packetDemo.workSample : templateAssessment(role, tasks, skills[0]?.name ?? ""),
      };
    };
    if (!aiBudget()) return fallback("The hourly AI limit was reached.");
    try {
      const { claudeJson, CLAUDE_FAST } = await import("./claude.server");
      const context = `Job: ${role} (O*NET ${l.occupation.code})\n\nTop job tasks:\n${tasks.map((t) => `[${t.id}] ${t.name}`).join("\n")}\n\nSkills and abilities rated most important:\n${skills.map((s) => `${s.name} (${s.importance ?? "?"} of 5)`).join("\n")}`;
      let value: DraftResult;
      if (data.part === "assessment") {
        const out = await claudeJson<unknown>({ model: CLAUDE_FAST, system: ASSESSMENT_PROMPT, user: context, name: "skills_assessment", schema: assessmentSchema as unknown as Record<string, unknown>, maxTokens: 4000, timeoutMs: 24000 });
        const assessment = sanitizeAssessment(out, role, tasks, skills[0]?.name ?? "");
        if (!assessment) return fallback("The AI draft was incomplete.");
        value = { ai: true, notice: "", assessment };
      } else {
        const out = await claudeJson<unknown>({ model: CLAUDE_FAST, system: INTERVIEW_PROMPT, user: `${context}\n\nAptitude modules: ${modules.length ? modules.join(", ") : "none"}`, name: "interview_and_aptitude", schema: interviewSchema as unknown as Record<string, unknown>, maxTokens: 3000, timeoutMs: 24000 });
        const r = sanitizeInterview(out, modules);
        if (r.questions.length < 3) return fallback("The AI draft was incomplete.");
        value = { ai: true, notice: "", interview: r.questions, aptitude: r.aptitude };
      }
      cache.set(key, { at: Date.now(), value });
      return value;
    } catch (e) {
      console.error("draftSample failed", e);
      const { claudeErrorMessage } = await import("./claude.server");
      return fallback(claudeErrorMessage(e));
    }
  });
