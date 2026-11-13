import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Rating } from "@/lib/assessment-rules";

// One question card at a time for expert ratings. Same scale and order for every expert, so ratings stay
// comparable; the expert taps every answer themselves. AI never fills these in.
export interface GuidedElement {
  id: string;
  kind: string;
  name: string;
  description?: string;
  benchmark_importance: number | null;
}

/** The short list experts see: every O*NET task, plus skills, knowledge and abilities O*NET rates 4 or higher. */
export function guidedList(elements: GuidedElement[], alreadyRated: Set<string>) {
  return elements.filter(
    (e) =>
      alreadyRated.has(e.id) ||
      e.kind === "task" ||
      (["skill", "knowledge", "ability"].includes(e.kind) && (e.benchmark_importance ?? 0) >= 4),
  );
}

const IMPORTANCE = ["Not important", "Somewhat important", "Important", "Very important", "Extremely important"];
const FREQUENCY = ["Rarely", "Sometimes", "Often", "Very often", "Constantly"];
const KIND: Record<string, string> = { task: "Task", skill: "Skill", knowledge: "Knowledge", ability: "Ability", tool: "Tool" };

type Draft = { applies: boolean | null; importance: number; frequency: number; entry: boolean | null };

export function GuidedRatings({
  elements,
  ratings,
  sourceName,
  canEdit,
  onRate,
  onTable,
}: {
  elements: GuidedElement[];
  ratings: Rating[]; // this expert's ratings
  sourceName: string;
  canEdit: boolean;
  onRate: (id: string, change: Partial<Rating>) => void;
  onTable?: (() => void) | undefined;
}) {
  const rated = useMemo(() => new Set(ratings.map((r) => r.element_id)), [ratings]);
  const list = useMemo(() => guidedList(elements, rated), [elements, rated]);
  const [preview, setPreview] = useState<Record<string, Rating>>({}); // read-only demo answers, not saved
  const answerFor = (id: string) => ratings.find((r) => r.element_id === id) ?? preview[id];
  const firstOpen = Math.max(0, list.findIndex((e) => !answerFor(e.id)));
  const [i, setI] = useState(firstOpen);
  const e = list[Math.min(i, list.length - 1)];
  const existing = e ? answerFor(e.id) : undefined;
  const [draft, setDraft] = useState<Draft>(() => toDraft(existing));
  const [shownFor, setShownFor] = useState(e?.id);
  if (e && shownFor !== e.id) {
    setShownFor(e.id);
    setDraft(toDraft(existing));
  }
  const answered = list.filter((x) => answerFor(x.id)).length;
  const left = list.length - answered;
  const complete = draft.applies === false || (draft.applies === true && draft.importance > 0 && draft.frequency > 0 && draft.entry !== null);

  if (!e) return <p className="kit-empty">No tasks or skills to rate yet.</p>;

  function save(next: number) {
    if (!e || !complete) return;
    const change: Partial<Rating> = draft.applies
      ? { applies: true, importance: draft.importance, frequency: draft.frequency, entry: Boolean(draft.entry) }
      : { applies: false };
    if (canEdit) onRate(e.id, change);
    else
      setPreview((p) => ({
        ...p,
        [e.id]: { element_id: e.id, source_id: "preview", importance: 3, frequency: 3, entry: false, show: "test", date: new Date().toISOString(), applies: true, ...change } as Rating,
      }));
    setI(Math.min(list.length - 1, Math.max(0, next)));
  }

  return (
    <section className="guided" aria-label="Guided expert ratings">
      <div className="guided-top">
        <div>
          <p className="eyebrow">Rating as {sourceName}</p>
          <p className="guided-progress-text">
            {answered} of {list.length} answered · about {Math.max(1, Math.round((left * 20) / 60))} min left
          </p>
        </div>
        {onTable && (
          <Button variant="ghost" size="sm" onClick={onTable}>
            <Table2 /> See all as a table
          </Button>
        )}
      </div>
      <div className="guided-bar" role="progressbar" aria-valuemin={0} aria-valuemax={list.length} aria-valuenow={answered} aria-label="Ratings answered">
        <span style={{ width: `${(answered / list.length) * 100}%` }} />
      </div>
      {!canEdit && (
        <p className="setup-note">Preview: try the questions. In the demo your answers aren't saved.</p>
      )}

      <article className="guided-card">
        <p className="guided-kind">
          {KIND[e.kind] ?? e.kind} · {Math.min(i, list.length - 1) + 1} of {list.length}
        </p>
        <h2>{e.name}</h2>
        {e.description && e.description !== e.name && <p className="guided-desc">{e.description}</p>}

        <fieldset className="guided-q">
          <legend>Is this part of the job here?</legend>
          <div className="guided-choices">
            <button type="button" aria-pressed={draft.applies === true} className={draft.applies === true ? "is-on" : ""} onClick={() => setDraft({ ...draft, applies: true })}>
              Yes, it's part of the job
            </button>
            <button type="button" aria-pressed={draft.applies === false} className={draft.applies === false ? "is-on" : ""} onClick={() => setDraft({ ...draft, applies: false })}>
              Not part of this job
            </button>
          </div>
        </fieldset>

        {draft.applies && (
          <>
            <Scale legend={e.kind === "task" ? "How important is this task?" : "How important is this to doing the job well?"} labels={IMPORTANCE} value={draft.importance} onChange={(n) => setDraft({ ...draft, importance: n })} />
            <Scale legend={e.kind === "task" ? "How often is it done?" : "How often is it used?"} labels={FREQUENCY} value={draft.frequency} onChange={(n) => setDraft({ ...draft, frequency: n })} />
            <fieldset className="guided-q">
              <legend>Does a new hire need it on day one?</legend>
              <div className="guided-choices">
                <button type="button" aria-pressed={draft.entry === true} className={draft.entry === true ? "is-on" : ""} onClick={() => setDraft({ ...draft, entry: true })}>
                  Yes, from day one
                </button>
                <button type="button" aria-pressed={draft.entry === false} className={draft.entry === false ? "is-on" : ""} onClick={() => setDraft({ ...draft, entry: false })}>
                  Can be learned on the job
                </button>
              </div>
            </fieldset>
          </>
        )}

        <div className="guided-nav">
          <Button variant="ghost" disabled={i === 0} onClick={() => setI(i - 1)}>
            <ArrowLeft /> Back
          </Button>
          {left === 0 && answerFor(e.id) && i === list.length - 1 ? (
            <span className="kit-locked">
              <CheckCircle2 className="size-4" /> All done. Thank you!
            </span>
          ) : (
            <Button disabled={!complete} onClick={() => save(i + 1)}>
              {i === list.length - 1 ? "Save" : "Save and next"} <ArrowRight />
            </Button>
          )}
        </div>
        {!complete && <p className="kit-hint">Answer each question to continue.</p>}
      </article>
      {left > 0 && answered > 0 && (
        <button type="button" className="kit-link guided-jump" onClick={() => setI(list.findIndex((x) => !answerFor(x.id)))}>
          Jump to the next unanswered question
        </button>
      )}
    </section>
  );
}

function toDraft(r?: Rating): Draft {
  if (!r) return { applies: null, importance: 0, frequency: 0, entry: null };
  return r.applies ? { applies: true, importance: r.importance, frequency: r.frequency, entry: r.entry } : { applies: false, importance: 0, frequency: 0, entry: null };
}

function Scale({ legend, labels, value, onChange }: { legend: string; labels: string[]; value: number; onChange: (n: number) => void }) {
  return (
    <fieldset className="guided-q">
      <legend>{legend}</legend>
      <div className="guided-scale" role="radiogroup" aria-label={legend}>
        {labels.map((l, n) => (
          <button key={l} type="button" role="radio" aria-checked={value === n + 1} className={value === n + 1 ? "is-on" : ""} onClick={() => onChange(n + 1)}>
            <strong>{n + 1}</strong>
            <span>{l}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
