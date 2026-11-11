import { describe, expect, it } from "vitest";
import { screeningDemo, qualificationCheck } from "@/lib/hiring-stages";
import { screeningCriteriaCsv, screeningCriteriaText, resultsExportCsv, toCsv } from "@/lib/ats";
import { parseCandidateCsv } from "@/lib/pipeline-rules";

describe("ATS handoff", () => {
  it("CSV cells with commas, quotes and line breaks are escaped", () =>
    expect(toCsv([["a,b", 'say "hi"', "x\ny"]])).toBe('"a,b","say ""hi""","x\ny"'));
  it("Screening criteria list every knockout and experience question with its job-analysis source", () => {
    const csv = screeningCriteriaCsv(screeningDemo, (id) =>
      id === "103" ? "Task 103" : undefined,
    );
    const lines = csv.split("\n");
    expect(lines).toHaveLength(
      1 + screeningDemo.qualifications.length + screeningDemo.experience.length,
    );
    expect(csv).toContain("Yes | Equivalent experience");
    expect(csv).toContain("Task 103");
  });
  it("Copy text tells the ATS which answers pass each knockout", () => {
    const t = screeningCriteriaText(screeningDemo);
    expect(t).toContain("MINIMUM QUALIFICATIONS");
    expect(t).toContain("Knockout: answer must be Yes or Equivalent experience");
    expect(t).toContain("Review with HR/legal");
  });
  it("Results export keeps the ATS ID and only reports the overall score when there is one", () => {
    const csv = resultsExportCsv([
      {
        ats_id: "GH-1",
        name: "Riley",
        email: "r@example.test",
        stage: "Decision recorded",
        stage_results: {
          "0": { pass: true },
          "1": { pass: true },
          "2": { pass: true },
          "3": { pass: true },
        },
        overall: 78.83,
        decision: "Advance",
      },
      {
        name: "Avery",
        email: "a@example.test",
        stage: "Stage 1 · Invited",
        stage_results: { "0": { pass: null } },
        overall: null,
      },
    ]).split("\n");
    expect(lines(csv[1])).toEqual([
      "GH-1",
      "Riley",
      "r@example.test",
      "Decision recorded",
      "pass",
      "pass",
      "pass",
      "pass",
      "78.8",
      "Advance",
    ]);
    expect(lines(csv[2])).toEqual([
      "",
      "Avery",
      "a@example.test",
      "Stage 1 · Invited",
      "review",
      "",
      "",
      "",
      "",
      "",
    ]);
  });
  it("Candidate CSV import reads an optional ATS ID column", () => {
    const rows = parseCandidateCsv(
      "name,email,ats_id\nTaylor Kim,taylor@example.test,GH-10482\nSam Lee,sam@example.test,",
    );
    expect(rows.map((r) => r.ats_id)).toEqual(["GH-10482", ""]);
    expect(rows.every((r) => !r.error)).toBe(true);
  });
});

describe("Candidate qualification check", () => {
  it("Confirmed requirements pass without any experience rating", () =>
    expect(
      qualificationCheck(screeningDemo, { training: "yes", degree: "equivalent" }),
    ).toMatchObject({ pass: true, total: null }));
  it("An unconfirmed requirement goes to HR review instead of automatic rejection", () => {
    const r = qualificationCheck(screeningDemo, { training: "no", degree: "yes" });
    expect(r.pass).toBeNull();
    expect(r.reason).toContain("HR review");
  });
  it("Every requirement must be answered", () =>
    expect(() => qualificationCheck(screeningDemo, { training: "yes" })).toThrow());
});

function lines(row: string | undefined) {
  return (row ?? "").split(",");
}
