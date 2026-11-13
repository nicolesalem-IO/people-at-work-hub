import { describe, expect, it } from "vitest";
import { packetDemo } from "@/data/packet-demo";
import { packetProblems, passRule } from "@/lib/packet";

describe("hiring packet", () => {
  it("sample packet is complete and every part traces to a job task", () => {
    expect(packetProblems(packetDemo)).toEqual([]);
  });

  it("flags a rubric line with a missing anchor", () => {
    const broken = structuredClone(packetDemo);
    broken.workSample.rubric[0]!.anchors[2] = " ";
    expect(packetProblems(broken)).toContain('Work sample: "Objectives are measurable" needs all five anchors written');
  });

  const lines = packetDemo.workSample.rubric;
  const rest = { evaluation: 3, judgment: 3, writing: 3 };
  it("passes at a 3.0 average with no low critical line", () => {
    expect(passRule(lines, { ...rest, objectives: 4, practice: 4, check: 3, evaluation: 4, writing: 4 })).toMatchObject({ average: 3.7, pass: true });
  });
  it("stops a candidate whose critical line is below 2 even at a 3.0 average", () => {
    expect(passRule(lines, { ...rest, objectives: 4, practice: 1, check: 4, evaluation: 3, judgment: 3, writing: 3 })).toMatchObject({
      average: 3,
      pass: false,
      failedCritical: ["Practice matches the problem"],
    });
  });
  it("stops a candidate below a 3.0 average", () => {
    expect(passRule(lines, { objectives: 3, practice: 2, check: 3, evaluation: 2, judgment: 3, writing: 3 })).toMatchObject({ average: 2.7, pass: false });
  });
  it("waits until every line is scored", () => {
    expect(passRule(lines, { objectives: 3 })).toEqual({ complete: false });
  });
});

import { recommendAptitude } from "@/lib/packet";
describe("aptitude recommendations", () => {
  it("recommends a test only when the job analysis supports it", () => {
    const r = recommendAptitude([
      { name: "Mathematical Reasoning", importance: 4.4, entry: true },
      { name: "Written Comprehension", importance: 4.0 },
      { name: "Programming", importance: 1.5, entry: false },
    ]);
    expect(r.find((x) => x.module === "Numerical reasoning")!.level).toBe("recommended");
    expect(r.find((x) => x.module === "Verbal reasoning")!.level).toBe("consider");
    expect(r.find((x) => x.module === "Coding")!.level).toBe("not_needed");
  });
  it("doesn't test twice what the skills assessment already measures", () => {
    const r = recommendAptitude([{ name: "Written Comprehension", importance: 4.0, entry: true }], ["Written Comprehension"]);
    expect(r.find((x) => x.module === "Verbal reasoning")!.level).toBe("not_needed");
  });
  it("needs submission instructions on every skills assessment", () => {
    const broken = structuredClone(packetDemo);
    broken.workSample.submission.fileName = "";
    expect(packetProblems(broken).join(" ")).toMatch(/exactly what to submit/);
  });
});
