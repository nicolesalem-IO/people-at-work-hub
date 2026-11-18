import { describe, expect, it } from "vitest";
import { demoJobs } from "@/data/workflow-demo";
import { currentStep, newJob, stepStates, tasksFor } from "@/lib/workflow";

const base = () =>
  newJob({
    id: "j1",
    title: "Plumber",
    organization: "Acme",
    onet: { code: "47-2152.00", title: "Plumbers" },
    team: [
      { id: "b", name: "Bea", email: "b@x.test", roles: ["builder"] },
      { id: "e", name: "Eli", email: "e@x.test", roles: ["expert"] },
      { id: "h", name: "Hal", email: "h@x.test", roles: ["hr"] },
      { id: "r", name: "Ria", email: "r@x.test", roles: ["rater"] },
    ],
    now: "2026-11-18T00:00:00Z",
  });

describe("one workflow for every job", () => {
  it("starts at the job description with everything after it locked", () => {
    const s = stepStates(base());
    expect(currentStep(base()).id).toBe("description");
    expect(s.filter((x) => x.locked).map((x) => x.id)).toEqual(["analysis", "plan", "test", "candidates", "scoring", "decision"]);
  });
  it("skipping the description (O*NET alone) opens job analysis", () => {
    const j = base();
    j.description.skipped = true;
    expect(currentStep(j).id).toBe("analysis");
  });
  it("gives each person only their tasks, with locked ones saying what they wait for", () => {
    const j = base();
    expect(tasksFor("b", j)[0]).toMatchObject({ step: "description", locked: false, done: false });
    const expert = tasksFor("e", j);
    expect(expert[0]).toMatchObject({ title: "Rate the job", locked: true });
    expect(expert[0]!.needs).toMatch(/job description/);
    expect(tasksFor("r", j).map((t) => t.step)).toEqual(["scoring"]);
    expect(tasksFor("nobody", j)).toEqual([]);
  });
  it("the test needs both an expert and HR approval", () => {
    const j = base();
    j.description.skipped = true;
    j.analysis.confirmedBy = "Bea";
    j.plan.approvedBy = "Bea";
    j.test.expertApprovedBy = "Eli";
    expect(currentStep(j).id).toBe("test");
    j.test.hrApprovedBy = "Hal";
    expect(currentStep(j).id).toBe("candidates");
  });
  it("the demo shows two jobs at different points in the same workflow", () => {
    const [ld, plumber] = demoJobs();
    expect(currentStep(ld!, { candidates: 5, scored: 2, decided: 0 }).id).toBe("scoring");
    expect(currentStep(plumber!).id).toBe("description");
    expect(tasksFor("marcus", plumber!)[0]).toMatchObject({ title: "Rate the job", locked: true });
  });
});
