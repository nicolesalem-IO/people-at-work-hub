import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { benchmark } from "@/data/assessment-demo";
import {
  ONET_BASE,
  DETAIL_REPORTS,
  attribution,
  isOnetCode,
  mergeElements,
  parseDetails,
  parseSearch,
  type OnetElement,
  type OnetMatch,
} from "./onet-api";

// Server-only. The O*NET key is read from the ONET_API_KEY secret (Netlify → Environment variables) and never sent to browsers.
const cache = new Map<string, { at: number; value: unknown }>();
const TTL = 24 * 60 * 60 * 1000;
async function onetGet(path: string): Promise<unknown> {
  const key = process.env["ONET_API_KEY"];
  if (!key) throw new Error("missing-key");
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < TTL) return hit.value;
  const res = await fetch(`${ONET_BASE}${path}`, {
    headers: { "X-API-Key": key, Accept: "application/json" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`onet-${res.status}`);
  const value = await res.json();
  if (cache.size > 500) cache.clear();
  cache.set(path, { at: Date.now(), value });
  return value;
}
const notice = (e: unknown) =>
  String((e as Error)?.message) === "missing-key"
    ? "Live O*NET is not configured yet (add the ONET_API_KEY secret). Using the saved benchmark."
    : "The O*NET service could not be reached. Using the saved benchmark.";

export async function searchOnet(keyword: string): Promise<OnetMatch[]> {
  return parseSearch(
    await onetGet(`/online/search?keyword=${encodeURIComponent(keyword)}&start=1&end=10`),
  );
}

export async function fetchOccupation(code: string) {
  if (!isOnetCode(code)) throw new Error("Invalid O*NET-SOC code.");
  const today = new Date().toISOString().slice(0, 10);
  const [title, ...reports] = await Promise.all([
    searchOnet(code)
      .then((m) => m.find((x) => x.code === code)?.title ?? "")
      .catch(() => ""),
    ...DETAIL_REPORTS.map((r) =>
      onetGet(`/online/occupations/${code}/details/${r.path}`)
        .then((j) => parseDetails(r.kind, j, today))
        .catch(() => [] as OnetElement[]),
    ),
  ]);
  return { code, title, elements: reports.flat(), retrieved: today };
}

/** Public, read-only occupation search (public CC BY data; results cached on the server). */
export const searchOccupations = createServerFn({ method: "GET" })
  .inputValidator((d: { keyword: string }) => {
    const keyword = String(d?.keyword ?? "")
      .trim()
      .slice(0, 80);
    if (keyword.length < 2) throw new Error("Type at least 2 characters.");
    return { keyword };
  })
  .handler(async ({ data }): Promise<{ live: boolean; matches: OnetMatch[]; notice: string }> => {
    try {
      return { live: true, matches: await searchOnet(data.keyword), notice: "" };
    } catch (e) {
      const q = data.keyword.toLowerCase();
      const saved = ["train", "learning", "development", "l&d", "instruct", "13-1151"].some((w) =>
        q.includes(w),
      )
        ? [{ code: benchmark.occupation, title: benchmark.title }]
        : [];
      return { live: false, matches: saved, notice: notice(e) };
    }
  });

/** Analyst view: refresh the role's saved benchmark with live O*NET wording and importance. */
export const loadLiveBenchmark = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d?: { code?: string }) => ({
    code: isOnetCode(d?.code ?? "") ? String(d?.code) : benchmark.occupation,
  }))
  .handler(async ({ data, context }) => {
    const { data: allowed } = await context.supabase.rpc("org_can", { cap: "analysis" });
    if (!allowed) throw new Error("Analyst access required.");
    try {
      const occ = await fetchOccupation(data.code);
      if (!occ.elements.length)
        return {
          available: false as const,
          notice:
            "O*NET returned no details for this occupation. The saved benchmark has not been relabeled as live.",
        };
      const elements =
        data.code === benchmark.occupation
          ? mergeElements(benchmark.elements as OnetElement[], occ.elements)
          : occ.elements;
      return {
        available: true as const,
        benchmark: {
          ...benchmark,
          occupation: occ.code,
          title: occ.title || benchmark.title,
          elements,
          retrieved: occ.retrieved,
          release: "live",
          license: attribution(),
          url: `https://www.onetonline.org/link/summary/${occ.code}`,
        },
      };
    } catch (e) {
      return { available: false as const, notice: notice(e) };
    }
  });
