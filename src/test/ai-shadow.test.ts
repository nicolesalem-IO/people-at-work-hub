import { describe, expect, it } from "vitest";
import { shadowReport, type ShadowPair } from "@/lib/ai-shadow";
import { guidedList } from "@/components/io/GuidedRatings";

const make = (n: number, f: (i: number) => Partial<ShadowPair>): ShadowPair[] =>
  Array.from({ length: n }, (_, i) => ({ item: `i${i}`, role: `r${i % 3}`, human: 3, ai: 3, aiRerun: 3, ...f(i) }));

describe("AI shadow ratings", () => {
  it("isn't trusted until it has enough comparisons across roles", () => {
    const r = shadowReport(make(20, () => ({ role: "one" })));
    expect(r.trusted).toBe(false);
    expect(r.reasons.join(" ")).toMatch(/100 comparisons/);
    expect(r.reasons.join(" ")).toMatch(/3 different roles/);
  });
  it("is trusted when it agrees, is consistent and holds for every group", () => {
    const r = shadowReport(make(120, (i) => ({ ai: i % 5 === 0 ? 4 : 3 })), 0.85);
    expect(r).toMatchObject({ trusted: true, reasons: [] });
  });
  it("isn't trusted when it agrees less often than people agree with each other", () => {
    const r = shadowReport(make(120, (i) => ({ ai: i % 6 === 0 ? 5 : 3 })), 0.95);
    expect(r.trusted).toBe(false);
  });
  it("isn't trusted when reruns disagree", () => {
    const r = shadowReport(make(120, (i) => ({ aiRerun: i % 4 === 0 ? 5 : 3 })));
    expect(r.reasons.join(" ")).toMatch(/same score on a rerun/);
  });
  it("isn't trusted when agreement drops for one group", () => {
    const r = shadowReport(make(120, (i) => ({ group: i % 2 ? "A" : "B", ai: i % 2 === 0 && i % 4 === 0 ? 5 : 3 })));
    expect(r.reasons.join(" ")).toMatch(/one group/);
  });
});

describe("guided expert list", () => {
  it("keeps every task and only strongly rated skills, plus anything already rated", () => {
    const els = [
      { id: "t1", kind: "task", name: "Teach", benchmark_importance: null },
      { id: "s1", kind: "skill", name: "Speaking", benchmark_importance: 4.4 },
      { id: "s2", kind: "skill", name: "Mathematics", benchmark_importance: 2.4 },
      { id: "x1", kind: "tool", name: "Projector", benchmark_importance: null },
      { id: "s3", kind: "skill", name: "Writing", benchmark_importance: 3.9 },
    ];
    expect(guidedList(els, new Set(["s3"])).map((e) => e.id)).toEqual(["t1", "s1", "s3"]);
  });
});
