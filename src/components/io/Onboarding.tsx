import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAssessment } from "./AssessmentProvider";
import { TeamOnboarding } from "./TeamOnboarding";
import {
  initialSetup,
  onboardingSchema,
  setupProblem,
  benchmarkMatches,
  isBuilder,
  type Setup,
} from "@/lib/onboarding-rules";
import { saveAssessment } from "@/lib/assessment.functions";
import { loadSetup, saveSetup } from "@/lib/onboarding.functions";
import { assessmentDemo } from "@/data/assessment-demo";
export function Onboarding() {
  const c = useAssessment(),
    navigate = useNavigate(),
    read = useServerFn(loadSetup),
    store = useServerFn(saveSetup),
    create = useServerFn(saveAssessment),
    [s, setS] = useState<Setup>(initialSetup),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    void (async () => {
      try {
        const saved = c.signedIn
          ? await read()
          : JSON.parse(localStorage.getItem("io-setup-draft") ?? "null");
        if (saved) {
          const parsed = onboardingSchema.parse(saved);
          if (parsed.completed) {
            await navigate({ to: "/roles", replace: true });
            return;
          }
          setS(parsed);
        }
      } catch {
        setError("Saved setup is unavailable. You can start again.");
      }
      setReady(true);
    })();
  }, [c.signedIn]);
  useEffect(() => {
    if (ready) heading.current?.focus();
  }, [s.step, ready]);
  async function persist(next: Setup) {
    setBusy(true);
    setError("");
    try {
      if (c.signedIn) await store({ data: next });
      else localStorage.setItem("io-setup-draft", JSON.stringify(next));
      setS(next);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Setup could not be saved.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function advance() {
    const problem = setupProblem(s);
    if (problem) {
      setError(problem);
      return;
    }
    // Hiring managers, experts and raters don't build anything: their work arrives in My tasks.
    if (s.step === 1 && !isBuilder(s.persona)) {
      if (!(await persist({ ...s, completed: true }))) return;
      await navigate({ to: "/kit" });
      return;
    }
    if (s.step < 5) {
      await persist({ ...s, step: s.step + 1 });
      return;
    }
    if (c.signedIn) {
      if (!c.editor) {
        setError("Setup is saved. Ask your Admin for I-O analyst access to create this role.");
        return;
      }
      const battery = {
        ...assessmentDemo,
        selection: undefined,
        id: crypto.randomUUID(),
        title: s.title,
        organization: s.organization,
        purpose: ["selection"],
        occupation: s.occupation,
        fictional: false,
        version: 1,
        status: "draft" as const,
        analysis_status: "draft" as const,
        sources: s.smes.map((p, n) => ({ id: "source-" + n, name: p.name, type: p.type })),
        ratings: [],
        mappings: [],
        incidents: [],
        items: [],
        conflicts: [],
        angoff: [],
        history: [],
        weight_overrides: {},
      };
      const id = await create({ data: battery });
      await c.refresh();
      if (!id) return;
      if (!(await persist({ ...s, completed: true }))) return;
    } else {
      if (!(await persist({ ...s, completed: true }))) return;
      localStorage.setItem("io-demo-entered", "yes");
    }
    await navigate({ to: "/job", search: { part: "define" } });
  }
  const titles = [
      "What's your part in hiring?",
      "What are you hiring for?",
      "Match it to O*NET",
      "Who's on the hiring team?",
      "Here's the path",
    ],
    helpers = [
      "Building a hiring test, or helping with one? We'll show you only what you need.",
      "Start with the job, not a generic test.",
      "O*NET is the U.S. Department of Labor's database of what each job involves. It's the starting point your experts will adjust.",
      "Experts rate what the job needs (about 15 minutes each). The hiring manager and raters run and score the test.",
      "Five steps, in order. Each one unlocks the next.",
    ];
  return (
    <section className="setup-page">
      <div className="flex justify-between items-center gap-4">
        <p>Step {s.step} of 5</p>
        <Button
          variant="link"
          disabled={busy}
          onClick={async () => {
            if (await persist(s)) await navigate({ to: "/roles" });
          }}
        >
          Skip for now <ArrowRight />
        </Button>
      </div>
      <progress className="setup-progress" value={s.step} max={5} aria-label="Setup progress" />
      <p className="eyebrow text-pink-ink mt-10">Your workspace / Selection</p>
      <h1 tabIndex={-1} ref={heading} className="setup-title">
        {titles[s.step - 1]}
      </h1>
      <p className="text-xl mt-5 mb-8">{helpers[s.step - 1]}</p>
      {!ready ? (
        <p>Opening your saved setup…</p>
      ) : (
        <>
          {s.step === 1 && (
            <div className="setup-choices" role="group" aria-label="Your practitioner role">
              {(
                [
                  ["hr", "HR or people team · I'm building the test"],
                  ["practitioner", "Assessment or I-O specialist · I'm building the test"],
                  ["manager", "Hiring manager · I'll interview finalists and decide"],
                  ["sme", "I know the job well · I'll rate what it needs"],
                  ["rater", "Rater · I'll score candidates' work"],
                ] as const
              ).map(([id, label]) => (
                <Button
                  key={id}
                  variant="outline"
                  aria-pressed={s.persona === id}
                  className="setup-choice"
                  onClick={() => setS({ ...s, persona: id })}
                >
                  {label}
                  {s.persona === id && <CheckCircle2 />}
                </Button>
              ))}
              {s.persona && !isBuilder(s.persona) && (
                <p className="setup-note">
                  You don't need to set anything up. When someone assigns you a task, it appears under My tasks, with
                  everything you need for that step.
                </p>
              )}
            </div>
          )}
          {s.step === 2 && (
            <div className="grid gap-5 max-w-2xl">
              <label>
                Job title
                <Input
                  autoComplete="organization-title"
                  value={s.title}
                  onChange={(e) => setS({ ...s, title: e.target.value })}
                />
              </label>
              <label>
                Organization name
                <Input
                  autoComplete="organization"
                  value={s.organization}
                  onChange={(e) => setS({ ...s, organization: e.target.value })}
                />
              </label>
              <label>
                Number of openings
                <Input
                  type="number"
                  min={1}
                  max={10000}
                  value={s.openings}
                  onChange={(e) => setS({ ...s, openings: Number(e.target.value) })}
                />
              </label>
              <p className="text-sm">Purpose: Selection</p>
            </div>
          )}
          {s.step === 3 && (
            <>
              <label>
                Search job title
                <Input value={s.title} onChange={(e) => setS({ ...s, title: e.target.value })} />
              </label>
              <p className="text-sm text-muted-foreground my-5">
                Saved O*NET occupation matches · Live field extraction is not available.
              </p>
              <div className="setup-matches">
                {benchmarkMatches(s.title).map((m) => (
                  <article className="border p-6" key={m.code}>
                    <p className="eyebrow">{m.code}</p>
                    <h2 className="text-2xl mt-4">{m.title}</h2>
                    <p className="mt-4">{m.description}</p>
                    <Button
                      variant={s.occupation === m.code ? "default" : "outline"}
                      className="mt-6"
                      onClick={() => setS({ ...s, occupation: m.code })}
                    >
                      {s.occupation === m.code ? "Selected" : "Use this"} <ArrowRight />
                    </Button>
                  </article>
                ))}
              </div>
              <Button
                variant="link"
                className="mt-5"
                onClick={() => setS({ ...s, occupation: "" })}
              >
                None of these fit
              </Button>
            </>
          )}
          {s.step === 4 && (
            <>
              <div className="grid gap-5">
                {s.smes.map((p, n) => (
                  <fieldset className="setup-sme" key={n}>
                    <legend className="font-bold">Expert {n + 1}</legend>
                    <label>
                      Name
                      <Input
                        value={p.name}
                        onChange={(e) =>
                          setS({
                            ...s,
                            smes: s.smes.map((x, i) =>
                              i === n ? { ...x, name: e.target.value } : x,
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      Email
                      <Input
                        type="email"
                        value={p.email}
                        onChange={(e) =>
                          setS({
                            ...s,
                            smes: s.smes.map((x, i) =>
                              i === n ? { ...x, email: e.target.value } : x,
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      Knows the job as
                      <select
                        className="block border bg-background p-2 w-full"
                        value={p.type}
                        onChange={(e) =>
                          setS({
                            ...s,
                            smes: s.smes.map((x, i) =>
                              i === n
                                ? { ...x, type: e.target.value as "incumbent" | "supervisor" }
                                : x,
                            ),
                          })
                        }
                      >
                        <option value="incumbent">Does the job now</option>
                        <option value="supervisor">Supervises the job</option>
                      </select>
                    </label>
                  </fieldset>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 mt-5">
                <Button
                  variant="outline"
                  onClick={() =>
                    setS({ ...s, smes: [...s.smes, { name: "", email: "", type: "incumbent" }] })
                  }
                >
                  <Plus /> Add an expert
                </Button>
                <Button
                  variant="outline"
                  disabled={c.signedIn}
                  onClick={() =>
                    setS({
                      ...s,
                      smes: [
                        { name: "Priya Shah", email: "priya@example.test", type: "incumbent" },
                        { name: "Daniel Okafor", email: "daniel@example.test", type: "supervisor" },
                      ],
                    })
                  }
                >
                  Use demo experts
                </Button>
              </div>
              <h2 className="setup-subhead">Hiring manager and raters</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Optional now. Raters score the work sample without seeing names, so they shouldn't be the hiring
                manager. Two raters per candidate is the standard.
              </p>
              <div className="grid gap-5">
                {s.team.map((p, n) => (
                  <fieldset className="setup-sme" key={n}>
                    <legend className="font-bold">
                      {p.role === "hiring_manager" ? "Hiring manager" : `Rater ${s.team.slice(0, n).filter((x) => x.role === "rater").length + 1}`}
                    </legend>
                    <label>
                      Name
                      <Input
                        value={p.name}
                        onChange={(e) => setS({ ...s, team: s.team.map((x, i) => (i === n ? { ...x, name: e.target.value } : x)) })}
                      />
                    </label>
                    <label>
                      Email
                      <Input
                        type="email"
                        value={p.email}
                        onChange={(e) => setS({ ...s, team: s.team.map((x, i) => (i === n ? { ...x, email: e.target.value } : x)) })}
                      />
                    </label>
                  </fieldset>
                ))}
              </div>
              <p className="mt-4 text-sm">
                These contacts are saved with setup. Your Admin sends the invitations and gives each person access to their
                part only.
              </p>
              <TeamOnboarding />
            </>
          )}
          {s.step === 5 && (
            <div className="setup-complete">
              <h2 className="text-3xl">{s.title || "Your next role"}</h2>
              <p className="mt-3">
                {s.organization} · {s.openings} {s.openings === 1 ? "opening" : "openings"} · Selection
              </p>
              <ol className="setup-path">
                {[
                  ["Job analysis", "Confirm the O*NET profile; your experts rate what's needed on day one."],
                  ["Hiring test", "One work sample, a teach-back and an interview, with written scoring guides. Experts and HR approve it."],
                  ["Candidates", "Import candidates from your hiring system and send each one a private link."],
                  ["Scoring", "Raters practice, then score blind. The hiring manager runs the teach-back and interview."],
                  ["Decisions & fairness", "The manager records each decision with a reason; HR checks pass rates."],
                ].map(([t, d], i) => (
                  <li key={t}>
                    <span>{i + 1}</span>
                    <div>
                      <strong>{t}</strong>
                      <p>{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {!c.signedIn && (
                <p className="mt-6">
                  Your setup stays in this browser. The next screen uses the fictional Northwind
                  Health workspace; sign in to create a saved role.
                </p>
              )}
            </div>
          )}
          {error && (
            <p role="alert" className="text-destructive mt-6">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-4 mt-8">
            <Button
              disabled={busy}
              size="lg"
              onClick={() =>
                void advance().catch((e) => {
                  setBusy(false);
                  setError(
                    e instanceof Error
                      ? e.message
                      : "Your role could not be created. Setup remains saved.",
                  );
                })
              }
            >
              {s.step === 5 ? "Start job analysis" : s.step === 1 && s.persona && !isBuilder(s.persona) ? "Go to my tasks" : "Continue"} <ArrowRight />
            </Button>
            {s.step > 1 && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => void persist({ ...s, step: s.step - 1 })}
              >
                Back
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
