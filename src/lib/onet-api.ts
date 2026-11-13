/** Pure helpers for O*NET Web Services v2 (https://api-v2.onetcenter.org). Network calls live in
 *  onet.functions.ts so the API key never reaches the browser. Detail reports are parsed tolerantly
 *  because field names differ between report types. */

export const ONET_BASE = "https://api-v2.onetcenter.org";
export type ElementKind = "task" | "knowledge" | "skill" | "ability" | "tool";
export type OnetElement = {
  id: string;
  kind: ElementKind;
  name: string;
  description: string;
  benchmark_importance: number | null;
  source_date: string;
};
export type OnetMatch = { code: string; title: string };

export const DETAIL_REPORTS: { kind: ElementKind; path: string }[] = [
  { kind: "task", path: "tasks" },
  { kind: "knowledge", path: "knowledge" },
  { kind: "skill", path: "skills" },
  { kind: "ability", path: "abilities" },
  { kind: "tool", path: "technology_skills" },
];

export const isOnetCode = (s: string) => /^\d{2}-\d{4}\.\d{2}$/.test(s.trim());

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown) =>
  typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "";

/** Finds the list of records in a report, whatever key it sits under (task, element, category, row…). */
export function recordList(json: unknown, depth = 0): Obj[] {
  if (Array.isArray(json)) return json.filter(isObj);
  if (!isObj(json) || depth > 2) return [];
  for (const [k, v] of Object.entries(json)) {
    if (["link", "links", "tags"].includes(k)) continue;
    if (Array.isArray(v) && v.some(isObj)) return v.filter(isObj);
  }
  for (const v of Object.values(json)) {
    const found = recordList(v, depth + 1);
    if (found.length) return found;
  }
  return [];
}

/** Importance on O*NET's 1–5 scale. Accepts a plain number, {value}, or a 0–100 score. */
export function importanceOf(r: Obj): number | null {
  const raw = r["importance"] ?? r["importance_score"] ?? r["score"] ?? r["value"];
  const n =
    typeof raw === "number"
      ? raw
      : isObj(raw)
        ? Number(raw["value"] ?? raw["score"])
        : typeof raw === "string"
          ? Number(raw)
          : NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  const fiveScale = n > 5 ? 1 + (n / 100) * 4 : n;
  return Math.round(fiveScale * 100) / 100;
}

export function parseSearch(json: unknown): OnetMatch[] {
  const list =
    isObj(json) && Array.isArray(json["occupation"])
      ? (json["occupation"] as unknown[]).filter(isObj)
      : recordList(json);
  return list
    .map((o) => ({ code: str(o["code"]), title: str(o["title"]) }))
    .filter((o) => isOnetCode(o.code) && o.title)
    .slice(0, 10);
}

export function parseDetails(kind: ElementKind, json: unknown, today: string): OnetElement[] {
  if (kind === "tool") {
    // Technology skills come as categories with example products; each example becomes one item.
    return recordList(json)
      .flatMap((cat) => {
        const catName = str(cat["title"] ?? cat["name"]);
        const ex = cat["example"] ?? cat["examples"];
        const examples = Array.isArray(ex) ? ex : [];
        const named = examples
          .map((e) => (isObj(e) ? str(e["title"] ?? e["name"]) : str(e)))
          .filter(Boolean);
        return (named.length ? named : [catName]).filter(Boolean).map((name) => ({
          id: `tech:${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          kind,
          name,
          description: catName && catName !== name ? catName : name,
          benchmark_importance: null,
          source_date: today,
        }));
      })
      .slice(0, 40);
  }
  return recordList(json)
    .map((r) => {
      const name = str(r["title"] ?? r["name"] ?? r["statement"] ?? r["element_name"]);
      const id = str(r["id"] ?? r["element_id"] ?? r["task_id"] ?? r["code"]) || name;
      return {
        id,
        kind,
        name,
        description: str(r["description"]) || name,
        benchmark_importance: importanceOf(r),
        source_date: today,
      };
    })
    .filter((e) => e.id && e.name);
}

export function attribution(release?: string) {
  return `O*NET ${release ? release + " " : ""}Database via O*NET Web Services, National Center for O*NET Development. CC BY 4.0. Local SME ratings and test content are fictional adaptations, not O*NET endorsements.`;
}

/** Updates saved elements with live wording and importance, keeps saved elements the API didn't
 *  return (existing expert ratings point at them), and appends new live elements. */
export function mergeElements<T extends OnetElement>(
  saved: T[],
  live: OnetElement[],
): OnetElement[] {
  const byId = new Map(live.map((e) => [e.id, e]));
  const merged = saved.map((s) => {
    const l = byId.get(s.id);
    return l
      ? {
          ...s,
          name: l.name,
          description: l.description || s.description,
          benchmark_importance: l.benchmark_importance ?? s.benchmark_importance,
          source_date: l.source_date,
        }
      : s;
  });
  const known = new Set(saved.map((s) => s.id));
  return [...merged, ...live.filter((e) => !known.has(e.id))];
}
