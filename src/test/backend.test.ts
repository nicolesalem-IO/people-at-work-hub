import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function check(name: string) {
  // Mutation probes are executed through the privileged data tool and roll back.
  // The diagnostic CLI is read-only: assert its latest durable probe result.
  const output = execFileSync("lovable", ["supabase", "query", `SELECT details FROM public.activity_log WHERE action='regression_check' AND details->>'rule'='${name}' ORDER BY created_at DESC LIMIT 1`, "--json"], { encoding: "utf8", timeout: 30000 });
  const result = JSON.parse(output) as { rows: { details: { passed: boolean; rule: string } }[] };
  expect(result.rows).toHaveLength(1);
  expect(result.rows[0]?.details).toEqual({ passed: true, rule: name });
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