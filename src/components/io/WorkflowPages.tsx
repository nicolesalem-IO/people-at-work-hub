import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, CheckCircle2, Circle, Lock, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchOccupations } from "@/lib/onet.functions";
import { currentStep, newJob, ROLE_LABEL, STEPS, stepStates, type Job, type Member, type StepId, type Task, type TeamRole } from "@/lib/workflow";
import { useAdmin } from "./AdminProvider";
import { useWorkspace } from "./WorkspaceStore";
import { AnalysisStep, CandidatesStep, DecisionStep, DescriptionStep, PlanStep, ScoringStep, TestStep } from "./WorkflowSteps";

/* ---------- links that stay inside the demo or the product ---------- */
export function WorkLink({ children, className }: { children: ReactNode; className?: string }) {
  const { mode } = useWorkspace();
  return mode === "demo" ? (
    <Link to="/demo/work" className={className}>
      {children}
    </Link>
  ) : (
    <Link to="/work" className={className}>
      {children}
    </Link>
  );
}
export function JobsLink({ children, className }: { children: ReactNode; className?: string }) {
  const { mode } = useWorkspace();
  return mode === "demo" ? (
    <Link to="/demo/jobs" className={className}>
      {children}
    </Link>
  ) : (
    <Link to="/jobs" className={className}>
      {children}
    </Link>
  );
}
export function JobLink({ jobId, step, children, className }: { jobId: string; step?: StepId; children: ReactNode; className?: string }) {
  const { mode } = useWorkspace();
  const search = step ? { step } : {};
  return mode === "demo" ? (
    <Link to="/demo/jobs/$jobId" params={{ jobId }} search={search} className={className}>
      {children}
    </Link>
  ) : (
    <Link to="/jobs/$jobId" params={{ jobId }} search={search} className={className}>
      {children}
    </Link>
  );
}
function useGoJob() {
  const { mode } = useWorkspace();
  const navigate = useNavigate();
  return (jobId: string, step?: StepId) =>
    mode === "demo"
      ? navigate({ to: "/demo/jobs/$jobId", params: { jobId }, search: step ? { step } : {} })
      : navigate({ to: "/jobs/$jobId", params: { jobId }, search: step ? { step } : {} });
}

/* ---------- gates ---------- */
function Gate({ children }: { children: ReactNode }) {
  const ws = useWorkspace();
  if (!ws.ready) return <p className="kit-hint">Loading…</p>;
  if (ws.me) return <>{children}</>;
  if (ws.mode === "demo")
    return (
      <section className="flow-empty">
        <h1>Pick whose view to see.</h1>
        <p>Choose a person on the hiring team from “Viewing as” at the top, or start from the demo home.</p>
        <Button asChild>
          <Link to="/demo">
            Demo home <ArrowRight />
          </Link>
        </Button>
      </section>
    );
  return (
    <section className="flow-empty">
      <h1>Sign in to see your work.</h1>
      <p>Use “Sign in” at the top. New here? See how it works first.</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/demo">See the demo</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/try">Try a quick test plan</Link>
        </Button>
      </div>
    </section>
  );
}

/* ---------- My work ---------- */
export function MyWork() {
  return (
    <Gate>
      <MyWorkInner />
    </Gate>
  );
}

function TaskRow({ t }: { t: Task }) {
  const state = t.done ? "done" : t.locked ? "waiting" : "open";
  return (
    <li className={`flow-task flow-task-${state}`}>
      <span className="flow-task-icon" aria-hidden>
        {t.done ? <CheckCircle2 /> : t.locked ? <Lock /> : <Circle />}
      </span>
      <div className="flow-task-body">
        <p className="eyebrow">
          {t.jobTitle} · Step {STEPS.find((s) => s.id === t.step)!.n}: {STEPS.find((s) => s.id === t.step)!.name}
        </p>
        <strong>{t.title}</strong>
        <p className="text-sm text-muted-foreground">{t.locked && !t.done ? `Waiting: ${t.needs}` : t.detail}</p>
      </div>
      <JobLink jobId={t.jobId} step={t.step} className={`flow-task-go${state === "open" ? " is-primary" : ""}`}>
        {state === "open" ? "Start" : "View"} <ArrowRight className="size-4" />
      </JobLink>
    </li>
  );
}

function MyWorkInner() {
  const ws = useWorkspace();
  const tasks = ws.myTasks();
  const open = tasks.filter((t) => !t.done && !t.locked),
    waiting = tasks.filter((t) => !t.done && t.locked),
    done = tasks.filter((t) => t.done);
  const [showDone, setShowDone] = useState(false);
  return (
    <section className="flow">
      <header className="flow-hero">
        <p className="eyebrow text-pink-ink">My work{ws.mode === "demo" ? " · demo" : ""}</p>
        <h1>
          {ws.me!.name.split(" ")[0]}'s work<span className="title-period">.</span>
        </h1>
        <p>Your tasks on every job, in the order they happen. Each one opens the step where you do it.</p>
      </header>
      {!tasks.length && (
        <div className="flow-empty-inline">
          <p>You don't have any tasks yet.</p>
          <JobsLink className="underline font-semibold">See all jobs</JobsLink>
        </div>
      )}
      {open.length > 0 && (
        <>
          <h2 className="flow-h2">Your turn</h2>
          <ul className="flow-tasks">
            {open.map((t) => (
              <TaskRow key={t.jobId + t.title} t={t} />
            ))}
          </ul>
        </>
      )}
      {waiting.length > 0 && (
        <>
          <h2 className="flow-h2">Coming up</h2>
          <ul className="flow-tasks">
            {waiting.map((t) => (
              <TaskRow key={t.jobId + t.title} t={t} />
            ))}
          </ul>
        </>
      )}
      {done.length > 0 && (
        <>
          <button type="button" className="flow-h2 flow-toggle" onClick={() => setShowDone(!showDone)}>
            Done ({done.length}) {showDone ? "▾" : "▸"}
          </button>
          {showDone && (
            <ul className="flow-tasks">
              {done.map((t) => (
                <TaskRow key={t.jobId + t.title} t={t} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

/* ---------- Jobs ---------- */
export function JobsList() {
  return (
    <Gate>
      <JobsInner />
    </Gate>
  );
}

function canCreateJobs(roles: string[]) {
  return roles.some((r) => r === "admin" || r === "analyst" || r === "hr");
}

function JobsInner() {
  const ws = useWorkspace();
  const team = useAdmin();
  const [adding, setAdding] = useState(false);
  const mayCreate = canCreateJobs(team.person?.roles ?? []);
  return (
    <section className="flow">
      <header className="flow-hero flow-hero-row">
        <div>
          <p className="eyebrow text-pink-ink">Jobs{ws.mode === "demo" ? " · demo" : ""}</p>
          <h1>
            Jobs<span className="title-period">.</span>
          </h1>
          <p>Every job follows the same seven steps, from job description to decision.</p>
        </div>
        {mayCreate && !adding && (
          <Button size="lg" onClick={() => setAdding(true)}>
            <Plus /> New job
          </Button>
        )}
      </header>
      {adding && <NewJob onClose={() => setAdding(false)} />}
      {!ws.jobs.length && !adding && (
        <div className="flow-empty-inline">
          <p>No jobs yet.{mayCreate ? " Start one with “New job”." : " An admin or HR adds jobs and invites the team."}</p>
        </div>
      )}
      <div className="flow-jobs">
        {ws.jobs.map((j) => {
          const states = stepStates(j, ws.kitProgress(j));
          const done = states.filter((s) => s.done).length;
          const now = STEPS.find((s) => s.id === currentStep(j, ws.kitProgress(j)).id)!;
          const mine = j.team.find((m) => m.id === ws.memberId(j));
          return (
            <article key={j.id} className="flow-job">
              <p className="eyebrow">
                {j.organization}
                {j.onet ? ` · O*NET ${j.onet.code}` : ""}
                {j.fictional ? " · fictional" : ""}
              </p>
              <h3>{j.title}</h3>
              <ol className="flow-mini-steps" aria-label={`${done} of 7 steps done`}>
                {states.map((s) => (
                  <li key={s.id} className={s.done ? "is-done" : s.id === now.id ? "is-now" : ""} title={STEPS.find((x) => x.id === s.id)!.name} />
                ))}
              </ol>
              <p className="text-sm">
                <strong>Now:</strong> Step {now.n}, {now.name.toLowerCase()} · {done} of 7 done
              </p>
              <p className="text-sm text-muted-foreground">{mine ? `You: ${mine.roles.map((r) => ROLE_LABEL[r]).join(", ")}` : "You're not on this job's team"}</p>
              <JobLink jobId={j.id} className="flow-job-open">
                Open job <ArrowRight className="size-4" />
              </JobLink>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function NewJob({ onClose }: { onClose: () => void }) {
  const ws = useWorkspace();
  const go = useGoJob();
  const search = useServerFn(searchOccupations);
  const [title, setTitle] = useState(""),
    [org, setOrg] = useState(""),
    [matches, setMatches] = useState<{ code: string; title: string }[]>([]),
    [onet, setOnet] = useState<{ code: string; title: string } | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function find() {
    if (title.trim().length < 2) return setError("Type a job title first.");
    setBusy(true);
    setError("");
    try {
      const r = await search({ data: { keyword: title } });
      setMatches(r.matches.slice(0, 5));
      setOnet(r.matches[0] ?? null);
      if (!r.matches.length) setError(r.notice || "No O*NET match. Try a more common title.");
    } catch {
      setError("O*NET search failed. Try again.");
    } finally {
      setBusy(false);
    }
  }
  function create() {
    if (!title.trim() || !org.trim()) return setError("Add a job title and organization.");
    const me = ws.me!;
    const id = crypto.randomUUID();
    ws.createJob(
      newJob({ id, title: title.trim(), organization: org.trim(), onet, team: [{ id: me.id, name: me.name, email: me.email, roles: ["builder", "hr"] }], now: new Date().toISOString(), fictional: ws.mode === "demo" }),
    );
    onClose();
    void go(id, "description");
  }
  return (
    <form
      className="flow-card flow-new"
      onSubmit={(e) => {
        e.preventDefault();
        create();
      }}
    >
      <h2 className="flow-h2">New job</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          Job title
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Patient Access Representative" required />
        </label>
        <label>
          Organization
          <Input value={org} onChange={(e) => setOrg(e.target.value)} required />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <Button type="button" variant="outline" onClick={() => void find()} disabled={busy}>
          {busy ? "Searching O*NET…" : "Match to O*NET"}
        </Button>
        {matches.length > 0 && (
          <select aria-label="O*NET occupation" className="flow-select" value={onet?.code ?? ""} onChange={(e) => setOnet(matches.find((m) => m.code === e.target.value) ?? null)}>
            {matches.map((m) => (
              <option key={m.code} value={m.code}>
                {m.title} ({m.code})
              </option>
            ))}
          </select>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-2">You can change the O*NET match later in job analysis. You'll add the team on the job page.</p>
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      <div className="flex gap-3 mt-5">
        <Button type="submit">
          Create job <ArrowRight />
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/* ---------- One job ---------- */
export function JobPage({ jobId, step }: { jobId: string; step?: StepId | undefined }) {
  return (
    <Gate>
      <JobInner jobId={jobId} step={step} />
    </Gate>
  );
}

function JobInner({ jobId, step }: { jobId: string; step?: StepId | undefined }) {
  const ws = useWorkspace();
  const job = ws.job(jobId);
  if (!job)
    return (
      <section className="flow-empty">
        <h1>Job not found.</h1>
        <JobsLink className="underline">Back to jobs</JobsLink>
      </section>
    );
  const kit = ws.kitProgress(job);
  const states = stepStates(job, kit);
  const active = step ?? currentStep(job, kit).id;
  const info = STEPS.find((s) => s.id === active)!;
  const state = states.find((s) => s.id === active)!;
  const me = job.team.find((m) => m.id === ws.memberId(job));
  const roles: TeamRole[] = me?.roles ?? [];
  const update = (fn: (j: Job) => Job) => ws.updateJob(job.id, fn);
  const props = { job, roles, meName: ws.me!.name, update, locked: state.locked };
  return (
    <section className="flow">
      <header className="flow-job-head">
        <div>
          <JobsLink className="flow-back">← All jobs</JobsLink>
          <p className="eyebrow mt-3">
            {job.organization}
            {job.onet ? ` · O*NET ${job.onet.code} ${job.onet.title}` : " · no O*NET match yet"}
            {job.fictional ? " · fictional" : ""}
          </p>
          <h1>{job.title}</h1>
        </div>
        <p className="text-sm">{me ? `Your part: ${me.roles.map((r) => ROLE_LABEL[r]).join(", ")}` : "You're viewing this job; you're not on its team."}</p>
      </header>
      <nav className="flow-stepper" aria-label="Workflow steps">
        {STEPS.map((s) => {
          const st = states.find((x) => x.id === s.id)!;
          return (
            <JobLink key={s.id} jobId={job.id} step={s.id} className={`flow-step${s.id === active ? " is-active" : ""}${st.done ? " is-done" : ""}${st.locked ? " is-locked" : ""}`}>
              <span className="flow-step-n">{st.done ? <CheckCircle2 className="size-4" /> : st.locked ? <Lock className="size-3.5" /> : s.n}</span>
              <span>{s.name}</span>
            </JobLink>
          );
        })}
      </nav>
      <div className="flow-layout">
        <div className="flow-main">
          <div className="flow-step-head">
            <p className="eyebrow text-pink-ink">
              Step {info.n} of 7{state.done ? " · done" : ""}
            </p>
            <h2>{info.name}</h2>
            <p>{info.what}</p>
            <p className="text-sm text-muted-foreground">Done by: {info.owner.map((r) => ROLE_LABEL[r]).join(", ")}</p>
            {state.locked && <p className="flow-locked">Not open yet. {state.needs} You can look, but nothing can be changed here until then.</p>}
          </div>
          {active === "description" && <DescriptionStep {...props} />}
          {active === "analysis" && <AnalysisStep {...props} />}
          {active === "plan" && <PlanStep {...props} />}
          {active === "test" && <TestStep {...props} />}
          {active === "candidates" && <CandidatesStep {...props} />}
          {active === "scoring" && <ScoringStep {...props} />}
          {active === "decision" && <DecisionStep {...props} />}
        </div>
        <TeamPanel job={job} canEdit={roles.includes("builder")} update={update} />
      </div>
      {ws.mode === "demo" && (
        <p className="kit-footnote">
          Demo data is fictional and saved in this browser.{" "}
          <button type="button" className="underline" onClick={ws.reset}>
            <RotateCcw className="inline size-3" /> Reset the demo
          </button>
        </p>
      )}
    </section>
  );
}

const ALL_ROLES: TeamRole[] = ["builder", "hr", "expert", "rater", "manager"];

function TeamPanel({ job, canEdit, update }: { job: Job; canEdit: boolean; update: (fn: (j: Job) => Job) => void }) {
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [roles, setRoles] = useState<TeamRole[]>(["expert"]),
    [open, setOpen] = useState(false);
  const experts = job.team.filter((m) => m.roles.includes("expert")).length,
    raters = job.team.filter((m) => m.roles.includes("rater")).length;
  return (
    <aside className="flow-team">
      <p className="eyebrow">Hiring team</p>
      <ul>
        {job.team.map((m) => (
          <li key={m.id}>
            <span>
              <strong>{m.name}</strong>
              <small>{m.roles.map((r) => ROLE_LABEL[r]).join(", ")}</small>
            </span>
            {canEdit && job.team.length > 1 && (
              <button type="button" aria-label={`Remove ${m.name}`} onClick={() => update((j) => ({ ...j, team: j.team.filter((x) => x.id !== m.id) }))}>
                <Trash2 className="size-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
      {(experts < 2 || raters < 2) && (
        <p className="text-sm text-muted-foreground">
          {experts < 2 ? `Add ${2 - experts} more job expert${experts === 1 ? "" : "s"}. ` : ""}
          {raters < 2 ? `Add ${2 - raters} more rater${raters === 1 ? "" : "s"} for blind scoring.` : ""}
        </p>
      )}
      {canEdit &&
        (open ? (
          <form
            className="grid gap-2 mt-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim() || !roles.length) return;
              const m: Member = { id: crypto.randomUUID(), name: name.trim(), email: email.trim(), roles };
              update((j) => ({ ...j, team: [...j.team, m] }));
              setName("");
              setEmail("");
              setOpen(false);
            }}
          >
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="flow-roles">
              {ALL_ROLES.map((r) => (
                <label key={r}>
                  <input type="checkbox" checked={roles.includes(r)} onChange={(e) => setRoles(e.target.checked ? [...roles, r] : roles.filter((x) => x !== r))} /> {ROLE_LABEL[r]}
                </label>
              ))}
            </div>
            <Button type="submit" size="sm">
              Add to team
            </Button>
          </form>
        ) : (
          <Button size="sm" variant="outline" className="mt-3" onClick={() => setOpen(true)}>
            <Plus /> Add a person
          </Button>
        ))}
    </aside>
  );
}
