import { describe, expect, it } from "vitest";
import { assessmentDemo, benchmark } from "@/data/assessment-demo";
import { eligibleKsaos } from "@/lib/assessment-rules";
import { contextFor, draftPrompt, toDraftItems, type DraftContext } from "@/lib/item-draft";
import { claudeErrorMessage, ClaudeError } from "@/lib/claude.server";

const ctx: DraftContext = {
  method: "aptitude",
  title: "Learning & Development Specialist",
  skills: [{ id: "1.A.1.c.1", name: "Mathematical Reasoning" }],
  tasks: [{ id: "98", name: "Monitor training effectiveness" }],
  incidents: [],
};
const good = {
  title: "Completion trend",
  stem: "45 of 60 finished last month and 54 of 60 this month. By how many points did completion rise?",
  options: ["9", "12", "15", "20"],
  correct: 2,
  key: [],
  explanation: "Tracking completion is part of evaluating training.",
  ksao_ids: ["1.A.1.c.1"],
  task_ids: ["98"],
  minutes: 2,
  rubric: [],
  materials: "",
};
let n = 0;
const id = () => `t-${++n}`;

describe("AI item drafts", () => {
  it("Valid items become drafts that still need SME approval", () => {
    const [item] = toDraftItems({ items: [good] }, ctx, id);
    expect(item).toMatchObject({
      status: "draft",
      approvals: [],
      method: "aptitude",
      correct: 2,
      practice: false,
    });
  });
  it("Items citing skills or tasks outside this role are dropped", () => {
    expect(
      toDraftItems(
        {
          items: [
            { ...good, ksao_ids: ["made-up"] },
            { ...good, task_ids: ["999"] },
          ],
        },
        ctx,
        id,
      ),
    ).toHaveLength(0);
  });
  it("Multiple-choice items need exactly 4 options and a valid key", () => {
    expect(
      toDraftItems(
        {
          items: [
            { ...good, options: ["a", "b"] },
            { ...good, correct: 7 },
          ],
        },
        ctx,
        id,
      ),
    ).toHaveLength(0);
  });
  it("SJT items need 4 expert effectiveness ratings from 1 to 5", () => {
    const sjt = { ...ctx, method: "sjt" as const };
    expect(toDraftItems({ items: [{ ...good, key: [5, 2, 1, 3] }] }, sjt, id)).toHaveLength(1);
    expect(toDraftItems({ items: [{ ...good, key: [5, 9, 1, 3] }] }, sjt, id)).toHaveLength(0);
  });
  it("Work samples need anchored rubrics with 5 levels and keep their materials", () => {
    const ws = { ...ctx, method: "work_sample" as const };
    const rubric = [{ dimension: "Objectives", levels: ["1", "2", "3", "4", "5"] }];
    const [item] = toDraftItems(
      { items: [{ ...good, options: [], rubric, materials: "Needs assessment summary" }] },
      ws,
      id,
    );
    expect(item).toMatchObject({ options: [], rubric, materials: "Needs assessment summary" });
    expect(
      toDraftItems({ items: [{ ...good, rubric: [{ dimension: "x", levels: ["1"] }] }] }, ws, id),
    ).toHaveLength(0);
  });
  it("Garbage output produces nothing instead of crashing", () => {
    expect(toDraftItems(null, ctx, id)).toEqual([]);
    expect(toDraftItems({ items: "nope" }, ctx, id)).toEqual([]);
  });
  it("The demo role gives the AI real skills, tasks and incidents to work from", () => {
    const c = contextFor(
      assessmentDemo,
      "sjt",
      benchmark.elements,
      eligibleKsaos(assessmentDemo, (x) => benchmark.elements.find((e) => e.id === x)?.kind ?? ""),
    );
    expect(c.skills.length).toBeGreaterThan(0);
    expect(c.tasks.length).toBeGreaterThan(0);
    expect(draftPrompt(c).system).toContain("protected characteristics");
  });
  it("AI errors become friendly messages without provider details", () => {
    expect(claudeErrorMessage(new ClaudeError("missing-key", 0))).toContain("ANTHROPIC_API_KEY");
    expect(claudeErrorMessage(new ClaudeError("claude-429", 429))).toContain("busy");
    expect(claudeErrorMessage(new Error("x"))).not.toContain("x");
  });
});
