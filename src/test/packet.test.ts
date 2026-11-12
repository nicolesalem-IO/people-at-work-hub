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
  it("passes at a 3.0 average with no low critical line", () => {
    expect(passRule(lines, { objectives: 4, practice: 4, check: 3 })).toMatchObject({ average: 3.7, pass: true });
  });
  it("stops a candidate whose critical line is below 2 even at a 3.0 average", () => {
    expect(passRule(lines, { objectives: 4, practice: 1, check: 4 })).toMatchObject({
      average: 3,
      pass: false,
      failedCritical: ["Practice matches the problem"],
    });
  });
  it("stops a candidate below a 3.0 average", () => {
    expect(passRule(lines, { objectives: 3, practice: 2, check: 3 })).toMatchObject({ average: 2.7, pass: false });
  });
  it("waits until every line is scored", () => {
    expect(passRule(lines, { objectives: 3 })).toEqual({ complete: false });
  });
});
