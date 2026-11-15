import { describe, expect, it } from "vitest";
import { pickDayOne, pickTasks, planParts } from "@/lib/quick-plan";
import { sanitizeAssessment, sanitizeInterview, templateAssessment } from "@/lib/packet-draft";
import type { OnetElement } from "@/lib/onet-api";
import { packetProblems } from "@/lib/packet";
import { packetDemo } from "@/data/packet-demo";

const el = (id: string, kind: string, name: string, imp: number | null): OnetElement =>
  ({ id, kind, name, description: name, benchmark_importance: imp }) as OnetElement;
const analyst = [
  el("t1", "task", "Analyze large data sets using statistical software.", null),
  el("t2", "task", "Create charts to explain results.", null),
  el("t3", "task", "Present findings to stakeholders.", null),
  el("k1", "knowledge", "Mathematics", 4.5),
  el("s1", "skill", "Mathematics", 4.4),
  el("a1", "ability", "Deductive Reasoning", 4.2),
  el("s2", "skill", "Critical Thinking", 4.2),
  el("s3", "skill", "Programming", 3.1),
];

describe("quick plan", () => {
  it("lists each skill once, keeping the higher rating", () => {
    const s = pickDayOne(analyst);
    expect(s.filter((x) => x.name === "Mathematics")).toHaveLength(1);
    expect(s[0]).toMatchObject({ name: "Mathematics", importance: 4.5 });
  });
  it("adds aptitude tests only when O*NET rates the ability 4 or higher", () => {
    const parts = planParts(analyst, pickTasks(analyst));
    const labels = parts.map((p) => p.label);
    expect(labels).toContain("Numerical reasoning test");
    expect(labels).toContain("Logical reasoning test");
    expect(labels).not.toContain("Coding test");
    expect(parts[0]!.kind).toBe("skills");
    expect(parts.at(-1)!.kind).toBe("interview");
  });
  it("suggests a live exercise for people-facing jobs only", () => {
    const trainer = [...analyst, el("s9", "skill", "Instructing", 4.3)];
    expect(planParts(trainer, pickTasks(trainer)).some((p) => p.kind === "live")).toBe(true);
    expect(planParts(analyst, pickTasks(analyst)).some((p) => p.kind === "live")).toBe(false);
  });
});

const five = ["a", "b", "c", "d", "e"];
const goodAssessment = {
  title: "Data Analyst: Skills Assessment",
  time: "About 2 hours",
  scenario: "A regional clinic network has 14 months of appointment data across 6 sites. No-show rates rose from 8% to 13% this year and the operations director needs to know why before the budget meeting in two weeks.",
  instructions: ["Answer every item.", "No names in the document.", "Use your own work.", "Ask for accommodations first."],
  task_ids: ["t1", "nope"],
  parts: [
    { title: "Part 1: Analysis", items: [{ label: "Approach", detail: "Describe the analysis you'd run." }] },
    { title: "Part 2: Written questions", items: [{ label: "Pushback", detail: "A manager disagrees. Respond." }] },
  ],
  rubric: [
    { name: "Sound analysis", part: "Part 1", critical: false, anchors: five },
    { name: "Clear charts", part: "Part 1", critical: false, anchors: five },
    { name: "Judgment", part: "Part 2", critical: false, anchors: five },
    { name: "Broken line", part: "Part 2", critical: true, anchors: ["only", "four", "anchors", "here"] },
  ],
};

describe("AI draft checks", () => {
  it("accepts a complete assessment, drops broken scoring lines and fills in submission rules", () => {
    const ws = sanitizeAssessment(goodAssessment, "Data Analyst", pickTasks(analyst), "Mathematics")!;
    expect(ws.rubric).toHaveLength(3);
    expect(ws.rubric.some((l) => l.critical)).toBe(true); // first line made critical when none are
    expect(ws.task).toBe("Analyze large data sets using statistical software");
    expect(ws.submission.fileName).toMatch(/^firstname_lastname_data_analyst\.pdf/);
    expect(packetProblems({ ...packetDemo, workSample: ws })).toEqual([]);
  });
  it("rejects an assessment that's too thin to use", () => {
    expect(sanitizeAssessment({ ...goodAssessment, parts: goodAssessment.parts.slice(0, 1) }, "X", [], "")).toBeNull();
    expect(sanitizeAssessment("not an object", "X", [], "")).toBeNull();
  });
  it("keeps only interview questions with five anchors and aptitude items with a valid answer", () => {
    const r = sanitizeInterview(
      {
        questions: [
          { question: "Tell me about a deadline you missed.", follow_up: "What first?", measures: "Dependability", anchors: five },
          { question: "Bad one", follow_up: "", measures: "", anchors: ["x"] },
        ],
        aptitude_samples: [
          { module: "Numerical reasoning", prompt: "12 of 48 is what percent?", options: ["20%", "25%", "30%", "40%"], answer_index: 1 },
          { module: "Numerical reasoning", prompt: "Broken", options: ["a", "b", "c"], answer_index: 7 },
          { module: "Coding", prompt: "Not requested", options: ["a", "b", "c", "d"], answer_index: 0 },
        ],
      },
      ["Numerical reasoning"],
    );
    expect(r.questions).toHaveLength(1);
    expect(r.aptitude).toHaveLength(1);
  });
  it("the no-AI template is complete and clearly marked as a template", () => {
    const t = templateAssessment("Data Analyst", pickTasks(analyst), "Mathematics");
    expect(t.title).toMatch(/template/);
    expect(packetProblems({ ...packetDemo, workSample: t })).toEqual([]);
  });
});
