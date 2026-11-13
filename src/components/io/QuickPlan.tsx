import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildQuickPlan } from "@/lib/quick-plan.functions";
import { methodLabels, type QuickPlan as Plan } from "@/lib/quick-plan";

const suggestions = [
  "Learning & Development Specialist",
  "Customer Support Specialist",
  "Warehouse Shift Lead",
];
const steps = [
  "Matching the job to O*NET…",
  "Picking skills needed on day one…",
  "Drafting the test plan…",
  "Writing sample questions…",
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
      <p className="eyebrow text-pink-ink">Try it · about 10 seconds</p>
      <h2 id="quick-plan-title" className="quick-plan-title">
        See a test plan for any job.
      </h2>
      <p className="mt-4 max-w-2xl text-lg">
        Type a job title. We match it to O*NET, pick the skills needed on day one and draft a test
        plan with sample questions, each one traced back to a real job task.
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
  if (!plan.skills.length)
    return (
      <div className="mt-8">
        <p role="status" className="border-l-4 border-brand-yellow pl-4">
          {plan.notice}
        </p>
        {plan.alternatives.length > 0 && <Alternatives plan={plan} onPick={onPick} />}
      </div>
    );
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
        <a
          className="text-sm underline"
          href={`https://www.onetonline.org/link/summary/${plan.occupation.code}`}
          target="_blank"
          rel="noreferrer"
        >
          View on O*NET ↗
        </a>
      </div>
      {plan.alternatives.length > 0 && <Alternatives plan={plan} onPick={onPick} />}
      <div className="quick-plan-grid">
        <div>
          <p className="eyebrow text-pink-ink">01 · Skills needed on day one</p>
          <ul className="mt-4 space-y-3">
            {plan.skills.map((s) => (
              <li key={s.id} className="quick-plan-skill">
                <span>{s.name}</span>
                <span className="text-sm text-muted-foreground">
                  {s.importance !== null ? `Importance ${s.importance.toFixed(1)}/5 · ` : ""}
                  {methodLabels[s.method]}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-pink-ink">02 · Draft test plan</p>
          <ul className="mt-4 space-y-4">
            {plan.plan.map((p) => (
              <li key={p.method}>
                <div className="flex justify-between font-semibold">
                  <span>{p.label}</span>
                  <span>{p.weight}%</span>
                </div>
                <div className="quick-plan-bar">
                  <span style={{ width: `${p.weight}%` }} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">{p.skills.join(" · ")}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="eyebrow text-pink-ink mt-10">
        03 · Sample questions {plan.ai ? "· drafted by AI" : "· examples"}
      </p>
      <div className="quick-plan-questions">
        {plan.questions.map((q, n) => (
          <article key={n} className="quick-plan-question">
            <p className="eyebrow">{methodLabels[q.method]}</p>
            <p className="mt-3 font-semibold leading-snug">{q.prompt}</p>
            {q.options.length > 0 && (
              <ol className="mt-3 space-y-1 text-sm list-[upper-alpha] pl-5">
                {q.options.map((o, i) => (
                  <li key={i} className={i === q.answer_index ? "font-semibold" : ""}>
                    {o}
                    {i === q.answer_index ? " ✓" : ""}
                  </li>
                ))}
              </ol>
            )}
            <div className="quick-plan-trace">
              <p>
                <strong>Measures:</strong> {q.skill_name}
              </p>
              <p>
                <strong>From job task:</strong> {q.task_name}
              </p>
            </div>
          </article>
        ))}
      </div>
      <div className="quick-plan-footer">
        <p className="text-sm max-w-xl">
          This is a draft. Job experts confirm every skill and approve every question before
          anything reaches a candidate, and people make the hiring decision.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/onboarding">
              Build this for real <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link
              to="/roles"
              onClick={() => {
                try {
                  localStorage.setItem("io-demo-entered", "yes");
                } catch {
                  /* storage unavailable */
                }
              }}
            >
              Explore the full demo
            </Link>
          </Button>
        </div>
      </div>
    </div>
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
