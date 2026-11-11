import { describe, expect, it } from "vitest";
import { benchmark } from "@/data/assessment-demo";
import {
  pickDayOne,
  pickTasks,
  planFor,
  sanitizeQuestions,
  savedQuestions,
  fallbackQuestions,
  nameQuestions,
  methodFor,
  withCitedSkills,
} from "@/lib/quick-plan";
import type { OnetElement } from "@/lib/onet-api";

const els = benchmark.elements as OnetElement[];
describe("Quick test plan", () => {
  it("Day-one skills come from skills, abilities and knowledge, most important first, max 3 per method", () => {
    const s = pickDayOne(els);
    expect(s.length).toBe(6);
    expect(s.every((x) => ["skill", "ability", "knowledge"].includes(x.kind))).toBe(true);
    for (const m of ["hands_on", "scenarios", "reasoning"])
      expect(s.filter((x) => x.method === m).length).toBeLessThanOrEqual(3);
  });
  it("Methods follow what the skill is", () => {
    expect(methodFor({ kind: "skill", name: "Judgment and Decision Making" })).toBe("scenarios");
    expect(methodFor({ kind: "ability", name: "Deductive Reasoning" })).toBe("reasoning");
    expect(methodFor({ kind: "knowledge", name: "Education and Training" })).toBe("hands_on");
  });
  it("Plan weights add to 100 with a 15% structured interview", () => {
    const p = planFor(pickDayOne(els));
    expect(p.reduce((n, x) => n + x.weight, 0)).toBe(100);
    expect(p.find((x) => x.method === "interview")?.weight).toBe(15);
    expect(p.every((x) => x.weight % 5 === 0)).toBe(true);
  });
  it("Model questions citing unknown tasks or skills are dropped", () => {
    const skills = pickDayOne(els),
      tasks = pickTasks(els);
    const ok = {
      method: "reasoning",
      prompt: "Q?",
      options: ["a", "b", "c", "d"],
      answer_index: 1,
      skill_id: skills[0]!.id,
      task_id: tasks[0]!.id,
      why: "w",
    };
    expect(
      sanitizeQuestions(
        [
          ok,
          { ...ok, skill_id: "made-up" },
          { ...ok, task_id: "999999" },
          { ...ok, answer_index: 7 },
          { ...ok, method: "astrology" },
        ],
        skills,
        tasks,
      ),
    ).toHaveLength(1);
  });
  it("Hands-on prompts have no options or answer key", () => {
    const skills = pickDayOne(els),
      tasks = pickTasks(els);
    expect(
      sanitizeQuestions(
        [
          {
            method: "hands_on",
            prompt: "Do it",
            options: ["x"],
            answer_index: 0,
            skill_id: skills[0]!.id,
            task_id: tasks[0]!.id,
          },
        ],
        skills,
        tasks,
      )[0],
    ).toMatchObject({ options: [], answer_index: null });
  });
  it("Saved questions cite real benchmark elements and have correct keys", () => {
    const ids = new Set(els.map((e) => e.id));
    for (const q of savedQuestions) {
      expect(ids.has(q.skill_id)).toBe(true);
      expect(ids.has(q.task_id)).toBe(true);
    }
    expect(savedQuestions[0]!.options[savedQuestions[0]!.answer_index!]).toBe("92%");
    const named = nameQuestions(savedQuestions, els);
    expect(named[2]!.task_name).toMatch(/orientation and training/i);
  });
  it("Fallback questions work for any occupation with tasks and skills", () => {
    const q = fallbackQuestions(pickDayOne(els), pickTasks(els));
    expect(q).toHaveLength(3);
    expect(q.find((x) => x.method === "reasoning")?.options[2]).toBe("15");
  });
});

describe("Cited skills", () => {
  it("Skills measured by sample questions are added to the day-one list and plan", () => {
    const skills = pickDayOne(els);
    const shown = withCitedSkills(
      skills.map((s) => ({ ...s })),
      savedQuestions,
      els,
    );
    for (const q of savedQuestions)
      expect(shown.find((s) => s.id === q.skill_id)?.method).toBe(q.method);
    const plan = planFor(shown);
    expect(plan.reduce((n, p) => n + p.weight, 0)).toBe(100);
    expect(plan.find((p) => p.method === "scenarios")?.skills).toContain(
      "Judgment and Decision Making",
    );
    expect(plan.find((p) => p.method === "reasoning")?.weight).toBeLessThanOrEqual(25);
  });
});
