import { describe, expect, it } from "vitest";
import { kitBenchmarks, kitSeedCalibration, kitSeedSheets } from "@/data/kit-demo";
import { packetDemo } from "@/data/packet-demo";
import { agreement, blindResult, calibrationCheck, panelResult, retainUntil, reviseSheet, type Sheet } from "@/lib/kit-rules";

const WS = packetDemo.workSample.rubric;
const sh = (raterId: string, scores: Record<string, number>, at: string): Sheet => ({
  id: raterId, candidateId: "X", step: "work_sample", raterId, scores, notes: {}, submittedAt: at, history: [],
});

describe("hiring kit rules", () => {
  it("waits for two blind raters", () => {
    expect(blindResult(WS, [sh("a", { objectives: 3, practice: 3, check: 3 }, "1")], "X")).toEqual({ status: "waiting", count: 1 });
  });
  it("averages two raters within a point", () => {
    const r = blindResult(WS, kitSeedSheets, "C-1041");
    expect(r).toMatchObject({ status: "final", average: 3.7, pass: true });
  });
  it("stops on a critical line below 2", () => {
    expect(blindResult(WS, kitSeedSheets, "C-1042")).toMatchObject({ status: "final", pass: false, failedCritical: ["Practice matches the problem"] });
  });
  it("asks for a third rater when two differ by more than a point", () => {
    expect(blindResult(WS, kitSeedSheets, "C-1043")).toEqual({ status: "needs_third", gaps: ["practice"] });
  });
  it("third rater settles the gap by averaging the two closest scores", () => {
    const sheets = [
      sh("a", { objectives: 2, practice: 2, check: 2 }, "1"),
      sh("b", { objectives: 2, practice: 4, check: 2 }, "2"),
      sh("c", { objectives: 2, practice: 3, check: 2 }, "3"),
    ];
    const r = blindResult(WS, sheets, "X");
    expect(r.status === "final" && r.lineScores["practice"]).toBe(2.5);
  });
  it("panel result averages everyone in the room", () => {
    expect(panelResult(packetDemo.teachBack.rubric, kitSeedSheets, "C-1041", "teach_back")).toMatchObject({ average: 3.7, pass: true });
  });
  it("measures rater agreement", () => {
    const a = agreement(WS, kitSeedSheets)!;
    expect(a.pairs).toBe(9);
    expect(Math.round(a.rate * 100)).toBe(89);
  });
  it("seeded raters are calibrated; a rater 2 points off is not", () => {
    for (const r of ["sam", "lena"]) expect(calibrationCheck(WS, kitBenchmarks, kitSeedCalibration[r]!).passed).toBe(true);
    const off = { ...kitSeedCalibration["sam"], B1: { objectives: 3, practice: 1, check: 1 } };
    expect(calibrationCheck(WS, kitBenchmarks, off).misses).toHaveLength(1);
  });
  it("changing a submitted sheet needs a reason and keeps the earlier version", () => {
    const s = sh("a", { objectives: 3, practice: 3, check: 3 }, "2026-11-01");
    expect(() => reviseSheet(s, { objectives: 4, practice: 3, check: 3 }, {}, "2026-11-02")).toThrow("reason");
    const r = reviseSheet(s, { objectives: 4, practice: 3, check: 3 }, {}, "2026-11-02", "Misread objective 2");
    expect(r.history).toHaveLength(1);
    expect(r.history[0]!.scores["objectives"]).toBe(3);
    expect(r.scores["objectives"]).toBe(4);
  });
  it("keeps records 3 years", () => {
    expect(retainUntil("2026-11-12T00:00:00Z")).toBe("2029-11-12");
  });
});

import { fourFifths } from "@/lib/kit-rules";
describe("four-fifths rule", () => {
  it("flags a group passing at under 80% of the highest rate", () => {
    const r = fourFifths([{ group: "A", passed: 50, total: 100 }, { group: "B", passed: 35, total: 100 }]);
    expect(r.flagged).toBe(true);
    expect(r.rows.find((x) => x.group === "B")!.ratio).toBeCloseTo(0.7);
  });
  it("doesn't flag rates within four-fifths, and warns when groups are small", () => {
    const r = fourFifths([{ group: "A", passed: 5, total: 10 }, { group: "B", passed: 4, total: 9 }]);
    expect(r.flagged).toBe(false);
    expect(r.tooSmall).toBe(true);
  });
});
