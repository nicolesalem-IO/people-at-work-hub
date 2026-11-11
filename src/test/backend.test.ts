import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function check(name: string) {
  const output = execFileSync("lovable", ["supabase", "query", `SELECT public.test_workspace_rule('${name}') AS passed`, "--json"], { encoding: "utf8", timeout: 30000 });
  expect(output).toMatch(/"passed"\s*:\s*true/);
}

describe.sequential("Live database workflow rules", () => {
  it("requires an approved analysis before creating a hiring package", () => check("approved_analysis"));
  it("allows only hr_reviewer to approve an analysis", () => check("reviewer_analysis"));
  it("allows only hr_reviewer to approve a hiring package", () => check("reviewer_package"));
  it("allows only hr_reviewer to approve a material", () => check("reviewer_material"));
  it("allows only hr_reviewer to decide approval requests", () => check("reviewer_decision"));
  it("blocks submission when a material points to an open conflict", () => check("open_conflict"));
  it("prevents updates to approved analysis versions", () => check("immutable_analysis"));
  it("prevents updates to approved materials", () => check("immutable_material"));
  it("restricts importance to integers from 1 to 5", () => check("importance"));
  it("enables RLS and signed-in reads on all 15 tables without anonymous grants", () => check("rls"));
});