import { describe, expect, it } from "vitest";
import { sanitizeCitations } from "@/lib/competency.functions";

const c = (ids: string[], support: "supported" | "limited" | "conflict" = "supported") => ({ name: "X", definition: "", rationale: "", evidence_ids: ids, support });

describe("sanitizeCitations", () => {
  it("removes citations to notes that were not provided", () => {
    const r = sanitizeCitations([c(["EV-01", "EV-99"])], ["EV-01"]);
    expect(r.competencies[0]!.evidence_ids).toEqual(["EV-01"]);
    expect(r.dropped).toBe(1);
  });
  it("downgrades a competency with no valid evidence to limited", () => {
    expect(sanitizeCitations([c(["FAKE"])], ["EV-01"]).competencies[0]!.support).toBe("limited");
  });
});
