import { createServerFn } from "@tanstack/react-start";
import { assessmentDemo, benchmark } from "@/data/assessment-demo";
import { eligibleKsaos, methods, type Item, type Method } from "./assessment-rules";
import { contextFor, draftPrompt, draftSchema, toDraftItems } from "./item-draft";

// Public demo preview: drafts for the fictional demo role only (context is built on the server from
// saved demo data, never from visitor input). Cached per method, with an hourly AI budget.
const cache = new Map<string, { at: number; items: Item[] }>();
const HOUR = 60 * 60 * 1000;
let budget = { start: Date.now(), used: 0 };
function allow() {
  if (Date.now() - budget.start > HOUR) budget = { start: Date.now(), used: 0 };
  if (budget.used >= 20) return false;
  budget.used++;
  return true;
}

export const previewDraftItems = createServerFn({ method: "POST" })
  .inputValidator((d: { method?: string }) => {
    const method = String(d?.method ?? "");
    if (!(method in methods)) throw new Error("Choose an assessment method.");
    return { method: method as Method };
  })
  .handler(async ({ data }): Promise<{ items: Item[]; notice: string }> => {
    const hit = cache.get(data.method);
    if (hit && Date.now() - hit.at < 24 * HOUR) return { items: hit.items, notice: "" };
    if (!allow())
      return { items: [], notice: "The AI demo is busy right now. Please try again later." };
    const a = assessmentDemo;
    const ctx = contextFor(
      a,
      data.method,
      benchmark.elements,
      eligibleKsaos(a, (id) => benchmark.elements.find((e) => e.id === id)?.kind ?? ""),
    );
    const { system, user } = draftPrompt(ctx);
    const { claudeJson, claudeErrorMessage, CLAUDE_SMART } = await import("./claude.server");
    try {
      const raw = await claudeJson({
        model: CLAUDE_SMART,
        system,
        user,
        name: "draft_items",
        schema: draftSchema as unknown as Record<string, unknown>,
        maxTokens: 6000,
        timeoutMs: 60000,
      });
      let n = 0;
      const items = toDraftItems(raw, ctx, () => `preview-${data.method}-${++n}`);
      if (!items.length)
        return {
          items: [],
          notice:
            "The AI draft couldn't be linked to this role's skills and tasks. Please try again.",
        };
      cache.set(data.method, { at: Date.now(), items });
      return { items, notice: "" };
    } catch (e) {
      console.error("previewDraftItems failed", e);
      return { items: [], notice: claudeErrorMessage(e) };
    }
  });
