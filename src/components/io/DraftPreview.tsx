import { Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { benchmark } from "@/data/assessment-demo";
import type { Item, Method } from "@/lib/assessment-rules";

const name = (id: string) => benchmark.elements.find((e) => e.id === id)?.name ?? id;

/** Read-only AI draft preview for the demo (or an approved, read-only battery). Nothing is saved. */
export function DraftPreview({
  state,
  onClose,
}: {
  state: { method: Method; busy: boolean; items: Item[]; notice: string };
  onClose: () => void;
}) {
  return (
    <section className="draft-preview" aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-pink-ink">
            <Sparkles className="inline size-4" /> AI draft preview · not saved
          </p>
          <p className="mt-2 max-w-3xl text-sm">
            Original drafts linked to this role's day-one skills and tasks. In a real role they're
            saved as drafts, and job experts must approve every item before a candidate sees it.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close AI draft preview">
          <X />
        </Button>
      </div>
      {state.busy && (
        <p className="mt-5 flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Drafting with Claude… this takes about 20
          seconds.
        </p>
      )}
      {!state.busy && state.notice && (
        <p role="status" className="mt-5 border-l-4 border-brand-yellow pl-4">
          {state.notice}
        </p>
      )}
      <div className="mt-5 grid gap-4">
        {state.items.map((i) => (
          <article key={i.id} className="draft-preview-item">
            <p className="eyebrow">
              {i.section} · {i.minutes} min · Draft
            </p>
            <h3 className="mt-2 text-xl font-bold">{i.title}</h3>
            {i.materials && (
              <p className="mt-3 whitespace-pre-line text-sm bg-muted/60 p-3">{i.materials}</p>
            )}
            <p className="mt-3 whitespace-pre-line">{i.stem}</p>
            {i.options.length > 0 && (
              <ol className="mt-3 list-[upper-alpha] pl-5 text-sm space-y-1">
                {i.options.map((o, n) => (
                  <li
                    key={n}
                    className={i.method !== "sjt" && n === i.correct ? "font-semibold" : ""}
                  >
                    {o}
                    {i.method === "sjt"
                      ? ` · expert rating ${i.key[n]}/5`
                      : n === i.correct
                        ? " ✓"
                        : ""}
                  </li>
                ))}
              </ol>
            )}
            {i.rubric.map((r) => (
              <div key={r.dimension} className="mt-3 text-sm">
                <p className="font-semibold">Rubric · {r.dimension}</p>
                <ol className="mt-1 space-y-1">
                  {r.levels.map((l, n) => (
                    <li key={n}>
                      <span className="font-semibold">{n + 1}</span> · {l}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
            {i.explanation && <p className="mt-3 text-sm text-muted-foreground">{i.explanation}</p>}
            <div className="quick-plan-trace mt-4">
              <p>
                <strong>Measures:</strong> {i.ksao_ids.map(name).join(" · ")}
              </p>
              <p>
                <strong>From job task:</strong> {i.task_ids.map(name).join(" · ")}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
