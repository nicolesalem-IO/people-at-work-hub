import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildQuickPlan, draftSample, type DraftResult } from "@/lib/quick-plan.functions";
import type { QuickPlan as Plan } from "@/lib/quick-plan";
import { STAGE_LABEL, type MethodPlan, type Status } from "@/lib/method-rules";
import { CandidateBrief } from "@/components/io/CandidateBrief";
import { Rubric } from "@/components/io/HiringPacket";

const suggestions = [
  "Learning & Development Specialist",
  "Customer Support Specialist",
  "Warehouse Shift Lead",
];
const steps = [
  "Matching the job to O*NET…",
  "Finding the most important tasks and skills…",
  "Checking how the work is done…",
  "Choosing test methods by 8 criteria…",
];

/** The 10-second demo: job title → O*NET → day-one skills → test plan → sample questions with traceability. */
export function QuickPlan() {
  const build = useServerFn(buildQuickPlan);
  const [title, setTitle] = useState(""),
    [plan, setPlan] = useState<Plan | null>(null),
    [busy, setBusy] = useState(false),
    [step, setStep] = useState(0),
    [error, setError] = useState("");
  useEffect(() => {
    if (!busy) return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1400);
    return () => clearInterval(t);
  }, [busy]);
  async function run(input: { title?: string; code?: string }) {
    setBusy(true);
    setError("");
    try {
      setPlan(await build({ data: input }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="quick-plan" aria-labelledby="quick-plan-title">
      <p className="eyebrow text-pink-ink">Try it · under a minute</p>
      <h2 id="quick-plan-title" className="quick-plan-title">
        See a test plan for any job.
      </h2>
      <p className="mt-4 max-w-2xl text-lg">
        Type a job title. We match it to O*NET, choose the parts of the hiring test that fit the job, and draft a
        detailed skills assessment, scoring guide and interview questions, all traced back to real job tasks.
      </p>
      <form
        className="quick-plan-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim().length >= 2) void run({ title });
        }}
      >
        <label className="flex-1 min-w-0">
          <span className="sr-only">Job title</span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Learning & Development Specialist"
            maxLength={80}
            className="h-14 text-lg"
          />
        </label>
        <Button type="submit" size="lg" className="h-14" disabled={busy || title.trim().length < 2}>
          {busy ? <Loader2 className="animate-spin" /> : <Sparkles />} Build a test plan
        </Button>
      </form>
      <div className="flex flex-wrap gap-2 mt-4">
        {suggestions.map((s) => (
          <Button
            key={s}
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => {
              setTitle(s);
              void run({ title: s });
            }}
          >
            {s}
          </Button>
        ))}
      </div>
      {busy && (
        <ol className="quick-plan-steps" aria-live="polite">
          {steps.map((s, n) => (
            <li key={s} data-state={n < step ? "done" : n === step ? "active" : "todo"}>
              {s}
            </li>
          ))}
        </ol>
      )}
      {error && (
        <p role="alert" className="mt-6 border-l-4 border-destructive pl-4">
          {error}
        </p>
      )}
      {plan && !busy && <Result plan={plan} onPick={(code) => void run({ code })} />}
    </section>
  );
}

function Result({ plan, onPick }: { plan: Plan; onPick: (code: string) => void }) {
  const draft = useServerFn(draftSample);
  const [assessment, setAssessment] = useState<DraftResult | null>(null),
    [interview, setInterview] = useState<DraftResult | null>(null);
  useEffect(() => {
    if (!plan.occupation.code || !plan.skills.length) return;
    let live = true;
    setAssessment(null);
    setInterview(null);
    const fail = (): DraftResult => ({ ai: false, notice: "The draft couldn't be loaded. Try again in a minute." });
    draft({ data: { code: plan.occupation.code, part: "assessment" } }).then((r) => live && setAssessment(r), () => live && setAssessment(fail()));
    draft({ data: { code: plan.occupation.code, part: "interview" } }).then((r) => live && setInterview(r), () => live && setInterview(fail()));
    return () => {
      live = false;
    };
  }, [plan.occupation.code]);
  if (!plan.skills.length)
    return (
      <div className="mt-8">
        <p role="status" className="border-l-4 border-brand-yellow pl-4">
          {plan.notice}
        </p>
        {plan.alternatives.length > 0 && <Alternatives plan={plan} onPick={onPick} />}
      </div>
    );
  const main = plan.plan?.methods.find((m) => m.stage === "main" && ["practical", "roleplay", "work_sample", "timed_sample"].includes(m.kind));
  const mainLabel = (main?.label ?? "skills assessment").toLowerCase();
  return (
    <div className="quick-plan-result" aria-live="polite">
      {plan.notice && (
        <p role="status" className="border-l-4 border-brand-yellow pl-4 mb-6">
          {plan.notice}
        </p>
      )}
      <div className="quick-plan-match">
        <div>
          <p className="eyebrow">
            {plan.live ? "Live O*NET match" : "Saved O*NET benchmark"} · {plan.occupation.code}
          </p>
          <h3 className="text-3xl mt-2">{plan.occupation.title}</h3>
        </div>
        <a className="text-sm underline" href={`https://www.onetonline.org/link/summary/${plan.occupation.code}`} target="_blank" rel="noreferrer">
          View on O*NET ↗
        </a>
      </div>
      {plan.alternatives.length > 0 && <Alternatives plan={plan} onPick={onPick} />}
      <div className="quick-plan-grid">
        <div>
          <p className="eyebrow text-pink-ink">01 · Most important skills (O*NET)</p>
          <ul className="mt-4 space-y-3">
            {plan.skills.map((s) => (
              <li key={s.id} className="quick-plan-skill">
                <span>{s.name}</span>
                <span className="text-sm text-muted-foreground">{s.importance !== null ? `Importance ${s.importance.toFixed(1)}/5` : ""}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground mt-3">Your experts confirm which are needed on day one.</p>
        </div>
        {plan.plan && <MethodList mp={plan.plan} />}
      </div>
      {plan.plan && <Criteria mp={plan.plan} />}

      <DraftSections assessment={assessment} interview={interview} mainLabel={mainLabel} />

      <div className="quick-plan-footer">
        <p className="text-sm max-w-xl">
          This is a draft. Experts confirm the skills and approve every exercise and scoring guide before anything reaches a candidate,
          and people make every hiring decision.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/onboarding">
              Build this for real <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/demo">See the full demo</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/** The drafted main test (as candidates see it, with its scoring guide) and the interview and aptitude samples. */
export function DraftSections({ assessment, interview, mainLabel, numbered = true }: { assessment: DraftResult | null; interview: DraftResult | null; mainLabel: string; numbered?: boolean }) {
  const n3 = numbered ? "03 · " : "",
    n4 = numbered ? "04 · " : "";
  return (
    <>
      <p className="eyebrow text-pink-ink mt-12">
        {n3}Draft {mainLabel} {assessment?.ai ? "· drafted by AI" : ""}
      </p>
      {!assessment ? (
        <p className="quick-plan-loading">
          <Loader2 className="animate-spin" /> Drafting the {mainLabel} and its scoring guide…
        </p>
      ) : assessment.assessment ? (
        <>
          {assessment.notice && <p className="kit-hint">{assessment.notice}</p>}
          <div className="mt-4">
            <CandidateBrief ws={assessment.assessment} />
          </div>
          <Rubric lines={assessment.assessment.rubric} caption="Scoring guide. 3 is what you'd accept from a new hire on day one." />
        </>
      ) : (
        <p className="kit-hint">{assessment.notice}</p>
      )}

      <p className="eyebrow text-pink-ink mt-12">{n4}Interview{interview?.aptitude?.length ? " and aptitude" : ""} samples {interview?.ai ? "· drafted by AI" : ""}</p>
      {!interview ? (
        <p className="quick-plan-loading">
          <Loader2 className="animate-spin" /> Drafting interview questions…
        </p>
      ) : (
        <>
          {interview.notice && <p className="kit-hint">{interview.notice}</p>}
          {interview.aptitude && interview.aptitude.length > 0 && (
            <div className="quick-plan-questions">
              {interview.aptitude.map((q, n) => (
                <article key={n} className="quick-plan-question">
                  <p className="eyebrow">{q.module}</p>
                  <p className="mt-3 font-semibold leading-snug">{q.prompt}</p>
                  <ol className="mt-3 space-y-1 text-sm list-[upper-alpha] pl-5">
                    {q.options.map((o, i) => (
                      <li key={i} className={i === q.answer_index ? "font-semibold" : ""}>
                        {o}
                        {i === q.answer_index ? " ✓" : ""}
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          )}
          <div className="packet-questions">
            {(interview.interview ?? []).map((q, n) => (
              <div className="packet-question" key={n}>
                <div className="packet-question-head">
                  <span className="packet-question-number">{n + 1}</span>
                  <div>
                    <p className="packet-question-text">{q.question}</p>
                    <p className="packet-small">
                      {q.followUp ? `If needed: ${q.followUp} · ` : ""}Measures <strong>{q.measures}</strong>
                    </p>
                  </div>
                </div>
                <ol className="packet-anchor-row">
                  {q.anchors.map((a, i) => (
                    <li key={i} className={i === 2 ? "packet-standard" : undefined}>
                      <span className="packet-score">{i + 1}</span>
                      {a}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </>
      )}

    </>
  );
}

const STATUS: Record<Status, { label: string; tone: string }> = {
  required: { label: "Required", tone: "ok" },
  recommended: { label: "Recommended", tone: "ok" },
  consider: { label: "Consider", tone: "wait" },
  confirm: { label: "Experts confirm", tone: "wait" },
};

export function MethodList({ mp }: { mp: MethodPlan }) {
  return (
    <div>
      <p className="eyebrow text-pink-ink">02 · The hiring test for this job</p>
      <p className="text-sm mt-3">
        <strong>How the work is done:</strong> {mp.modeSummary.charAt(0).toLowerCase() + mp.modeSummary.slice(1)}.
      </p>
      <ol className="quick-plan-parts">
        {mp.methods.map((m) => (
          <li key={m.label}>
            <div className="quick-plan-part-head">
              <span>
                <span className="method-stage">{STAGE_LABEL[m.stage]}</span>
                <strong>{m.label}</strong>
              </span>
              <span className={`kit-pill kit-pill-${STATUS[m.status].tone}`}>{STATUS[m.status].label}</span>
            </div>
            <p className="text-sm mt-1">
              {m.delivery} · {m.time}
            </p>
            <ul className="method-because">
              {m.because.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Criteria({ mp }: { mp: MethodPlan }) {
  return (
    <details className="method-criteria">
      <summary>How we chose: the 8 criteria</summary>
      <table>
        <thead>
          <tr>
            <th>Criterion</th>
            <th>Result for this job</th>
            <th>Based on</th>
          </tr>
        </thead>
        <tbody>
          {mp.criteria.map((c) => (
            <tr key={c.n}>
              <td>
                {c.n}. {c.name}
              </td>
              <td>{c.result}</td>
              <td className="text-muted-foreground">{c.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {mp.questions.length > 0 && (
        <>
          <p className="eyebrow mt-6">Questions for your experts</p>
          <ul className="method-questions">
            {mp.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </>
      )}
      <p className="text-sm text-muted-foreground mt-4">
        Experts confirm or change each choice. Any change needs a written reason, which goes into the hiring record.
      </p>
    </details>
  );
}

function Alternatives({ plan, onPick }: { plan: Plan; onPick: (code: string) => void }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted-foreground">Not quite? Try:</span>
      {plan.alternatives.map((m) => (
        <Button
          key={m.code}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPick(m.code)}
        >
          {m.title}
        </Button>
      ))}
    </div>
  );
}
