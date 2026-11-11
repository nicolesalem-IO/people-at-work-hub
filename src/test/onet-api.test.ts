import { describe, expect, it } from "vitest";
import {
  parseSearch,
  parseDetails,
  importanceOf,
  mergeElements,
  isOnetCode,
  type OnetElement,
} from "@/lib/onet-api";

const day = "2026-11-11";
describe("O*NET API parsing", () => {
  it("Search keeps valid occupation codes and titles in rank order", () =>
    expect(
      parseSearch({
        start: 1,
        end: 2,
        total: 2,
        occupation: [
          { href: "x", code: "13-1151.00", title: "Training and Development Specialists" },
          { code: "bad", title: "Nope" },
        ],
      }),
    ).toEqual([{ code: "13-1151.00", title: "Training and Development Specialists" }]));
  it("Importance accepts 1–5 values, {value} objects and 0–100 scores", () => {
    expect(importanceOf({ importance: 4.2 })).toBe(4.2);
    expect(importanceOf({ score: { scale: "Importance", value: 75 } })).toBe(4);
    expect(importanceOf({ name: "x" })).toBeNull();
  });
  it("Tasks read the statement as the name", () =>
    expect(
      parseDetails(
        "task",
        { task: [{ id: 103, statement: "Assess training needs.", score: { value: 90 } }] },
        day,
      )[0],
    ).toMatchObject({
      id: "103",
      kind: "task",
      name: "Assess training needs.",
      benchmark_importance: 4.6,
    }));
  it("Knowledge/skills/abilities read id, name, description and importance", () =>
    expect(
      parseDetails(
        "knowledge",
        {
          element: [
            {
              id: "2.C.6",
              name: "Education and Training",
              description: "Knowledge of principles…",
              importance: 4.3,
            },
          ],
        },
        day,
      )[0],
    ).toMatchObject({ id: "2.C.6", name: "Education and Training", benchmark_importance: 4.3 }));
  it("Technology categories are flattened into named examples", () => {
    const els = parseDetails(
      "tool",
      {
        category: [
          {
            code: 43232306,
            title: "Presentation software",
            example: [
              { name: "Microsoft PowerPoint", hot_technology: true },
              { title: "Mentimeter" },
            ],
          },
        ],
      },
      day,
    );
    expect(els.map((e) => e.name)).toEqual(["Microsoft PowerPoint", "Mentimeter"]);
    expect(els[0]?.description).toBe("Presentation software");
  });
  it("Unknown shapes produce nothing instead of crashing", () => {
    expect(parseDetails("skill", null, day)).toEqual([]);
    expect(parseDetails("skill", { message: "error" }, day)).toEqual([]);
  });
  it("Merging keeps saved elements that have expert ratings and adds new live ones", () => {
    const saved: OnetElement[] = [
      {
        id: "103",
        kind: "task",
        name: "Old",
        description: "Old",
        benchmark_importance: null,
        source_date: "08/2022",
      },
      {
        id: "98",
        kind: "task",
        name: "Kept",
        description: "Kept",
        benchmark_importance: null,
        source_date: "08/2022",
      },
    ];
    const m = mergeElements(saved, [
      {
        id: "103",
        kind: "task",
        name: "New",
        description: "New",
        benchmark_importance: 4.5,
        source_date: day,
      },
      {
        id: "777",
        kind: "task",
        name: "Added",
        description: "Added",
        benchmark_importance: 3,
        source_date: day,
      },
    ]);
    expect(m.map((e) => [e.id, e.name])).toEqual([
      ["103", "New"],
      ["98", "Kept"],
      ["777", "Added"],
    ]);
  });
  it("Codes must look like O*NET-SOC codes", () => {
    expect(isOnetCode("13-1151.00")).toBe(true);
    expect(isOnetCode("../admin")).toBe(false);
  });
});
