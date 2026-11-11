import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge, type Status } from "@/components/io/status";
import { evidence, role } from "@/data/demo";
import { summarizeCompetencies, type NoteInput, type SummaryResult } from "@/lib/competency.functions";

export const Route = createFileRoute("/summarize")({
  head: () => ({
    meta: [
      { title: "Competency summary — I-O Workspace" },
      { name: "description", content: "Turn job-analysis notes into evidence-linked competency drafts." },
      { property: "og:title", content: "Competency summary — I-O Workspace" },
      { property: "og:description", content: "Turn job-analysis notes into evidence-linked competency drafts." },
    ],
  }),
  component: Summarize,
});

const field = "w-full rounded-md border border-input bg-background px-3 py-2.5 text-base placeholder:text-muted-foreground focus-visible:border-ink";
const supportMap: Record<string, { status: Status; label: string }> = {
  supported: { status: "approved", label: "Supported by 2+ sources" },
  limited: { status: "missing", label: "Limited evidence" },
  conflict: { status: "conflict", label: "Sources disagree" },
};

function Summarize() {
  const run = useServerFn(summarizeCompetencies);
  const [notes, setNotes] = useState<NoteInput[]>(
    evidence.filter((e) => e.contributor !== "—").map((e) => ({ id: e.id, contributor: `${e.contributor} · ${e.source}`, text: e.excerpt })),
  );
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const byId = Object.fromEntries(notes.map((n) => [n.id, n]));

  const update = (i: number, k: keyof NoteInput, v: string) => setNotes((ns) => ns.map((n, j) => (j === i ? { ...n, [k]: v } : n)));
  const add = () => setNotes((ns) => [...ns, { id: `N-${String(ns.length + 1).padStart(2, "0")}`, contributor: "", text: "" }]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      setResult(await run({ data: { role: role.title, notes: notes.filter((n) => n.text.trim()) } }));
    } catch (err) {
      setResult({ ok: false, error: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Stage D–E · AI-assisted" title="Competency summary">
        Add job-analysis notes. The AI drafts competencies, and each one cites the notes it's based on. Every result is a draft for your review.
      </PageHeader>

      <div className="grid gap-10 lg:grid-cols-2">
        <form onSubmit={submit} className="space-y-4" aria-label="Job-analysis notes">
          <h2 className="text-xl">Notes ({notes.length})</h2>
          {notes.map((n, i) => (
            <fieldset key={i} className="space-y-2 rounded-lg border p-4">
              <legend className="sr-only">Note {n.id}</legend>
              <div className="flex gap-2">
                <label className="sr-only" htmlFor={`id-${i}`}>Note ID</label>
                <input id={`id-${i}`} value={n.id} onChange={(e) => update(i, "id", e.target.value)} className={`${field} w-24 font-mono text-sm`} />
                <label className="sr-only" htmlFor={`who-${i}`}>Source or contributor</label>
                <input id={`who-${i}`} value={n.contributor} onChange={(e) => update(i, "contributor", e.target.value)} placeholder="Source / contributor" className={field} />
                <Button type="button" variant="ghost" size="icon" aria-label={`Remove note ${n.id}`} onClick={() => setNotes((ns) => ns.filter((_, j) => j !== i))}><Trash2 /></Button>
              </div>
              <label className="sr-only" htmlFor={`text-${i}`}>Note text</label>
              <textarea id={`text-${i}`} rows={2} value={n.text} onChange={(e) => update(i, "text", e.target.value)} placeholder="What was observed or said" className={field} />
            </fieldset>
          ))}
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={add}><Plus /> Add note</Button>
            <Button type="submit" disabled={loading || !notes.some((n) => n.text.trim())}>
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />} {loading ? "Drafting…" : "Draft competencies"}
            </Button>
          </div>
        </form>

        <section aria-live="polite" aria-labelledby="results" className="space-y-4">
          <h2 id="results" className="text-xl">Draft summary</h2>
          {!result && !loading && <p className="rounded-lg border border-dashed p-6 text-muted-foreground">Results show up here. No summary has been generated yet.</p>}
          {loading && <p className="flex items-center gap-2 rounded-lg border p-6"><Loader2 className="size-4 animate-spin" aria-hidden="true" /> Reading the notes and linking evidence…</p>}
          {result && !result.ok && <p role="alert" className="rounded-lg border border-destructive p-4 font-semibold text-destructive">{result.error}</p>}
          {result?.ok && (
            <>
              <StatusBadge status="draft" />
              {result.droppedCitations > 0 && <p className="text-sm text-muted-foreground">{result.droppedCitations} citation(s) to unknown notes were removed.</p>}
              {result.competencies.map((c) => {
                const s = supportMap[c.support] ?? supportMap.limited;
                return (
                  <article key={c.name} className="rounded-lg border bg-card p-5 shadow-card">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-lg">{c.name}</h3>
                      <StatusBadge status={s.status} label={s.label} />
                    </div>
                    <p className="mt-1">{c.definition}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{c.rationale}</p>
                    <p className="eyebrow mt-4">Evidence</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {c.evidence_ids.length === 0 && <li className="text-muted-foreground">No valid evidence cited.</li>}
                      {c.evidence_ids.map((id) => (
                        <li key={id}><span className="font-mono font-bold">{id}</span> — “{byId[id]?.text}” <span className="text-muted-foreground">({byId[id]?.contributor})</span></li>
                      ))}
                    </ul>
                  </article>
                );
              })}
              {[["Conflicts to resolve", result.conflicts, "border-brand-pink bg-pink-soft"], ["Evidence gaps", result.gaps, "border-input bg-muted"]].map(([t, items, cls]) =>
                (items as string[]).length ? (
                  <div key={t as string} className={`rounded-lg border-l-4 p-4 ${cls}`}>
                    <h3 className="text-base">{t as string}</h3>
                    <ul className="mt-1 list-disc pl-5 text-sm">{(items as string[]).map((x) => <li key={x}>{x}</li>)}</ul>
                  </div>
                ) : null,
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
