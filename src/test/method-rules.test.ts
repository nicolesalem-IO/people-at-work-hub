import { describe, expect, it } from "vitest";
import { chooseMethods, mainFormat, type Signal } from "@/lib/method-rules";
import { planFor } from "@/lib/quick-plan";
import { benchmark } from "@/data/assessment-demo";
import type { OnetElement } from "@/lib/onet-api";

const s = (pairs: [string, number][]): Signal[] => pairs.map(([name, importance]) => ({ name, importance }));

// Profiles shaped like real O*NET ratings for each occupation.
const plumber = s([
  ["Repairing", 4.1], ["Installation", 4.0], ["Troubleshooting", 3.9], ["Equipment Maintenance", 3.6],
  ["Building and Construction", 4.3], ["Mechanical", 4.0], ["Public Safety and Security", 3.6], ["Manual Dexterity", 3.6],
  ["Customer and Personal Service", 3.5], ["Critical Thinking", 3.6], ["Active Listening", 3.4], ["Mathematics", 3.4],
  ["Handling and Moving Objects", 4.2], ["Repairing and Maintaining Mechanical Equipment", 4.3],
  ["Wear Common Protective or Safety Equipment such as Safety Shoes, Glasses, Gloves, Hearing Protection, Hard Hats, or Life Jackets", 4.4],
]);
const csr = s([
  ["Customer and Personal Service", 4.7], ["Active Listening", 4.0], ["Service Orientation", 4.0], ["Speaking", 3.9],
  ["Oral Expression", 4.1], ["Reading Comprehension", 3.7], ["Writing", 3.3], ["Critical Thinking", 3.4],
  ["English Language", 3.9], ["Mathematics", 2.9], ["Performing for or Working Directly with the Public", 4.3],
]);
const analyst = s([
  ["Mathematics", 4.5], ["Critical Thinking", 4.2], ["Deductive Reasoning", 4.2], ["Programming", 3.9],
  ["Analyzing Data or Information", 4.6], ["Computers and Electronics", 4.2], ["Reading Comprehension", 4.0],
  ["Writing", 3.6], ["Speaking", 3.6], ["Active Listening", 3.6],
]);

describe("method rules: the main test fits how the work is done", () => {
  it("a plumber gets an on-site practical, a license check and a safety check, not a take-home", () => {
    const p = chooseMethods({ code: "47-2152.00", signals: plumber, jobZone: 3 });
    expect(p.mode).toBe("hands_on");
    expect(mainFormat(p)).toBe("on_site");
    const kinds = p.methods.map((m) => m.kind);
    expect(kinds).toContain("practical");
    expect(kinds).not.toContain("work_sample");
    expect(p.methods.find((m) => m.kind === "license")).toMatchObject({ status: "required" });
    expect(p.methods.some((m) => m.label === "Safety and local code check")).toBe(true);
    expect(p.criteria[2]!.result).toMatch(/on site/);
  });
  it("an unlisted skilled trade asks experts whether a license is needed", () => {
    const p = chooseMethods({ code: "49-3023.00", signals: plumber, jobZone: 3 });
    expect(p.methods.find((m) => m.kind === "license")).toMatchObject({ status: "confirm" });
    expect(p.questions.some((q) => /license/.test(q))).toBe(true);
  });
  it("customer service gets a role-play, not a take-home", () => {
    const p = chooseMethods({ code: "43-4051.00", signals: csr, jobZone: 2 });
    expect(p.mode).toBe("people");
    expect(mainFormat(p)).toBe("live");
    expect(p.methods.some((m) => m.stage === "screen")).toBe(true); // entry level: consider a screen
  });
  it("a data analyst gets a take-home with a walk-through, plus a numerical test to consider", () => {
    const p = chooseMethods({ code: "15-2051.00", signals: analyst, jobZone: 4 });
    expect(mainFormat(p)).toBe("take_home");
    expect(p.methods.find((m) => m.kind === "work_sample")!.because.join(" ")).toMatch(/walk/);
    expect(p.methods.find((m) => m.label === "Numerical reasoning test")).toMatchObject({ status: "consider" });
  });
  it("lower-level written work gets a short timed test instead of a long take-home", () => {
    expect(mainFormat(chooseMethods({ code: "43-9061.00", signals: analyst, jobZone: 2 }))).toBe("timed");
  });
  it("expert answers change the plan: high volume adds a screen; no license removes the check", () => {
    const p = chooseMethods({ code: "47-2152.00", signals: plumber, jobZone: 3, answers: { volume: "high", license: false } });
    expect(p.methods.find((m) => m.stage === "screen")).toMatchObject({ status: "recommended" });
    expect(p.methods.some((m) => m.kind === "license" && m.status === "required")).toBe(false);
  });
  it("every method gives at least one reason", () => {
    for (const sig of [plumber, csr, analyst])
      for (const m of chooseMethods({ code: "00-0000.00", signals: sig, jobZone: 3 }).methods) expect(m.because.length).toBeGreaterThan(0);
  });
  it("the saved L&D benchmark still gets the written take-home, with a live exercise for finalists", () => {
    const p = planFor(benchmark.occupation, benchmark.elements as OnetElement[], [], 4);
    expect(mainFormat(p)).toBe("take_home");
    expect(p.methods.some((m) => m.kind === "roleplay" && m.stage === "finalists")).toBe(true);
  });
});
