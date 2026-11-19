import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, FileUp, Loader2, Printer, Sparkles, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { draftJobDescription, draftSample, jobProfile, type DraftResult, type JobProfile } from "@/lib/quick-plan.functions";
import { searchOccupations } from "@/lib/onet.functions";
import { STAGE_LABEL, type Method, type MethodKind } from "@/lib/method-rules";
import { methodKey, ratingSummary, type Job, type TeamRole } from "@/lib/workflow";
import type { Rating } from "@/lib/assessment-rules";
import { packetDemo } from "@/data/packet-demo";
import { kitCandidates } from "@/data/kit-demo";
import { useAdmin } from "./AdminProvider";
import { GuidedRatings } from "./GuidedRatings";
import { HiringPacket } from "./HiringPacket";
import { HrKit, ManagerKit, RaterKit, stage } from "./HiringKit";
import { useKit } from "./KitStore";
import { DecisionsFairness } from "./DecisionsFairness";
import { Criteria, DraftSections } from "./QuickPlan";
import { useWorkspace } from "./WorkspaceStore";

export type StepProps = { job: Job; roles: TeamRole[]; meName: string; update: (fn: (j: Job) => Job) => void; locked: boolean };

const now = () => new Date().toISOString();
const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

function Done({ children }: { children: React.ReactNode }) {
  return (
    <p className="flow-done">
      <CheckCircle2 className="size-4" /> {children}
    </p>
  );
}

/* ---------- 1. Job description ---------- */
export function DescriptionStep({ job, roles, meName, update, locked }: StepProps) {
  const d = job.description;
  const can = roles.includes("builder") && !locked;
  const latest = d.versions.at(-1);
  const [viewing, setViewing] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(""),
    [note, setNote] = useState(""),
    [notes, setNotes] = useState(""),
    [busy, setBusy] = useState(false),
    [msg, setMsg] = useState("");
  const draft = useServerFn(draftJobDescription);
  const shown = viewing !== null ? d.versions[viewing] : latest;

  function save(source: Job["description"]["source"]) {
    if (!text.trim()) return setMsg("The description is empty.");
    if (!note.trim()) return setMsg("Say what changed, so the history makes sense later.");
    update((j) => ({ ...j, description: { ...j.description, versions: [...j.description.versions, { at: now(), by: meName, text: text.trim(), note: note.trim() }], source, skipped: false, approvedBy: null } }));
    setEditing(false);
    setViewing(null);
    setMsg("");
  }
  async function upload(file: File) {
    setMsg("");
    try {
      let content = "";
      if (/\.docx$/i.test(file.name)) {
        const mammoth = await import("mammoth");
        content = (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
      } else if (/\.(txt|md|text)$/i.test(file.name) || file.type.startsWith("text/")) content = await file.text();
      else return setMsg("Upload a Word (.docx) or text file. For a PDF, copy the text and paste it in.");
      setText(content.trim());
      setNote(`Uploaded ${file.name}`);
      setEditing(true);
    } catch {
      setMsg("That file couldn't be read. Try pasting the text instead.");
    }
  }
  async function ai() {
    if (!job.onet) return setMsg("Match the job to O*NET first (step 2), so the draft starts from real job tasks.");
    setBusy(true);
    setMsg("");
    try {
      const r = await draft({ data: { code: job.onet.code, title: job.title, organization: job.organization, notes, current: editing ? text : (latest?.text ?? "") } });
      setText(r.text);
      setNote(latest ? "Revised with AI, then reviewed" : "Drafted with AI from O*NET, then reviewed");
      setEditing(true);
      if (r.notice) setMsg(r.notice);
    } catch {
      setMsg("The draft couldn't be made. Try again in a minute.");
    } finally {
      setBusy(false);
    }
  }

  if (d.skipped)
    return (
      <div className="flow-card">
        <Done>Skipped. This job uses O*NET alone, plus your experts' ratings.</Done>
        {can && (
          <Button variant="outline" size="sm" onClick={() => update((j) => ({ ...j, description: { ...j.description, skipped: false } }))}>
            <Undo2 /> Add a job description after all
          </Button>
        )}
      </div>
    );

  return (
    <div className="grid gap-5">
      {!latest && !editing && (
        <div className="flow-card">
          <p className="mb-4">There's no job description yet. Choose how to start. A description is optional: it adds the employer's own duties, which experts check against O*NET.</p>
          {can ? (
            <div className="flow-options">
              <label className="flow-option">
                <FileUp />
                <strong>Upload a file</strong>
                <span>Word (.docx) or text</span>
                <input type="file" accept=".docx,.txt,.md,text/plain" className="sr-only" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
              </label>
              <button type="button" className="flow-option" onClick={() => { setText(""); setNote("Written by hand"); setEditing(true); }}>
                <strong>Paste or write it</strong>
                <span>Start from your own text</span>
              </button>
              <button type="button" className="flow-option" onClick={() => void ai()} disabled={busy}>
                <Sparkles />
                <strong>{busy ? "Drafting…" : "Draft it with AI"}</strong>
                <span>From O*NET tasks and your notes</span>
              </button>
              <button type="button" className="flow-option" onClick={() => update((j) => ({ ...j, description: { ...j.description, skipped: true } }))}>
                <strong>Skip it</strong>
                <span>Use O*NET alone</span>
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">The person building the test adds it.</p>
          )}
          {can && (
            <label className="block mt-4 text-sm">
              Notes for the AI draft (optional): shifts, licenses, tools, anything specific to your workplace
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
          )}
        </div>
      )}

      {editing && (
        <div className="flow-card">
          <h3 className="flow-h3">{latest ? `New version (${d.versions.length + 1})` : "First version"}</h3>
          <Textarea rows={16} value={text} onChange={(e) => setText(e.target.value)} aria-label="Job description" />
          <label className="block mt-3 text-sm">
            What changed?
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Added on-call weekends" />
          </label>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button onClick={() => save(note.startsWith("Uploaded") ? "uploaded" : /AI/.test(note) ? "ai" : "written")}>Save version</Button>
            <Button variant="outline" onClick={() => void ai()} disabled={busy}>
              <Sparkles /> {busy ? "Working…" : "Improve with AI"}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {shown && !editing && (
        <div className="flow-card">
          <div className="flow-card-head">
            <p className="eyebrow">
              Version {viewing !== null ? viewing + 1 : d.versions.length} of {d.versions.length} · {shown.by} · {day(shown.at)}
            </p>
            {d.approvedBy && viewing === null && <Done>Approved by {d.approvedBy}</Done>}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{shown.note}</p>
          <pre className="flow-doc">{shown.text}</pre>
          {can && viewing === null && (
            <div className="flex flex-wrap gap-3 mt-4">
              <Button variant="outline" onClick={() => { setText(shown.text); setNote(""); setEditing(true); }}>
                Revise
              </Button>
              <label className="flow-upload-btn">
                <FileUp className="size-4" /> Upload a new version
                <input type="file" accept=".docx,.txt,.md,text/plain" className="sr-only" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
              </label>
              <Button variant="outline" onClick={() => void ai()} disabled={busy}>
                <Sparkles /> {busy ? "Working…" : "Revise with AI"}
              </Button>
              {!d.approvedBy && <Button onClick={() => update((j) => ({ ...j, description: { ...j.description, approvedBy: meName } }))}>Approve this version</Button>}
            </div>
          )}
        </div>
      )}

      {d.versions.length > 1 && !editing && (
        <div className="flow-card">
          <p className="eyebrow mb-2">Version history</p>
          <ol className="flow-history">
            {d.versions.map((v, i) => (
              <li key={i}>
                <button type="button" className={viewing === i || (viewing === null && i === d.versions.length - 1) ? "is-on" : ""} onClick={() => setViewing(i === d.versions.length - 1 ? null : i)}>
                  Version {i + 1} · {v.by} · {day(v.at)}
                </button>
                <span className="text-sm text-muted-foreground"> {v.note}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {msg && <p className="kit-hint">{msg}</p>}
    </div>
  );
}

/* ---------- shared: the job's O*NET profile and plan ---------- */
function useProfile(job: Job) {
  const load = useServerFn(jobProfile);
  const [p, setP] = useState<JobProfile | null>(null),
    [error, setError] = useState("");
  const key = JSON.stringify([job.onet?.code, job.plan.answers]);
  useEffect(() => {
    if (!job.onet) return;
    let live = true;
    setError("");
    load({ data: { code: job.onet.code, answers: job.plan.answers } }).then(
      (r) => live && setP(r),
      () => live && setError("O*NET couldn't be loaded. Try again in a minute."),
    );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { profile: p, error };
}

function OnetPicker({ job, update }: { job: Job; update: StepProps["update"] }) {
  const search = useServerFn(searchOccupations);
  const [q, setQ] = useState(job.title),
    [matches, setMatches] = useState<{ code: string; title: string }[]>([]),
    [busy, setBusy] = useState(false);
  return (
    <div className="flow-card">
      <p className="eyebrow mb-2">Change the O*NET match</p>
      <div className="flex flex-wrap gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" aria-label="Search O*NET" />
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void search({ data: { keyword: q } })
              .then((r) => setMatches(r.matches.slice(0, 6)))
              .finally(() => setBusy(false));
          }}
        >
          {busy ? "Searching…" : "Search"}
        </Button>
      </div>
      <ul className="flow-matches">
        {matches.map((m) => (
          <li key={m.code}>
            <button
              type="button"
              onClick={() =>
                update((j) => ({ ...j, onet: m, analysis: { ...j.analysis, confirmedBy: null }, plan: { ...j.plan, approvedBy: null }, test: { expertApprovedBy: null, hrApprovedBy: null } }))
              }
            >
              {m.title} <small>{m.code}</small>
            </button>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground">Changing the match reopens the analysis, plan and test for review.</p>
    </div>
  );
}

/* ---------- 2. Job analysis ---------- */
const words = (s: string) => s.toLowerCase().match(/[a-z]{5,}/g) ?? [];
function inDescription(name: string, text: string) {
  const t = text.toLowerCase();
  if (!t) return false;
  if (t.includes(name.toLowerCase())) return true;
  const w = words(name);
  return w.length >= 3 && w.filter((x) => t.includes(x)).length / w.length >= 0.5;
}

export function AnalysisStep({ job, roles, meName, update, locked }: StepProps) {
  const ws = useWorkspace();
  const { profile, error } = useProfile(job);
  const [changing, setChanging] = useState(false);
  const myId = ws.memberId(job);
  const isExpert = roles.includes("expert") && Boolean(myId);
  const builder = roles.includes("builder");
  const elements = profile?.elements ?? [];
  const mine: Rating[] = (job.analysis.ratings[myId ?? ""] ?? []).map((r) => ({ element_id: r.elementId, source_id: myId ?? "", applies: r.applies, importance: r.importance, frequency: 3, entry: r.dayOne, show: "test", date: r.at }));
  const summary = useMemo(() => ratingSummary(job), [job]);
  const text = job.description.versions.at(-1)?.text ?? "";
  const experts = Object.values(job.analysis.ratings).filter((r) => r.length).length;
  const nameOf = (id: string) => elements.find((e) => e.id === id);

  return (
    <div className="grid gap-5">
      <div className="flow-card flow-card-head">
        <div>
          <p className="eyebrow">O*NET match</p>
          <p className="text-lg font-semibold">{job.onet ? `${job.onet.title} (${job.onet.code})` : "Not matched yet"}</p>
          {profile?.notice && <p className="kit-hint">{profile.notice}</p>}
        </div>
        {builder && !locked && (
          <Button variant="outline" size="sm" onClick={() => setChanging(!changing)}>
            {changing ? "Done" : job.onet ? "Change" : "Match to O*NET"}
          </Button>
        )}
      </div>
      {(changing || !job.onet) && builder && <OnetPicker job={job} update={update} />}
      {error && <p className="kit-hint">{error}</p>}

      {isExpert && job.onet && (
        <div className="flow-card">
          <h3 className="flow-h3">Your ratings</h3>
          {!profile ? (
            <p className="quick-plan-loading">
              <Loader2 className="animate-spin" /> Loading the job's tasks and skills…
            </p>
          ) : (
            <GuidedRatings
              elements={elements}
              ratings={mine}
              sourceName={meName}
              canEdit={!locked && !job.analysis.confirmedBy}
              onRate={(id, change) =>
                update((j) => {
                  const list = j.analysis.ratings[myId!] ?? [];
                  const prev = list.find((r) => r.elementId === id) ?? { elementId: id, importance: 3, dayOne: false, applies: true, at: now() };
                  const next = {
                    ...prev,
                    ...(change.importance !== undefined ? { importance: change.importance } : {}),
                    ...(change.entry !== undefined ? { dayOne: change.entry } : {}),
                    ...(change.applies !== undefined ? { applies: change.applies } : {}),
                    at: now(),
                  };
                  return { ...j, analysis: { ...j.analysis, ratings: { ...j.analysis.ratings, [myId!]: [...list.filter((r) => r.elementId !== id), next] } } };
                })
              }
            />
          )}
        </div>
      )}

      <div className="flow-card">
        <h3 className="flow-h3">Where the sources agree</h3>
        <p className="text-sm text-muted-foreground mb-3">
          {experts} expert{experts === 1 ? "" : "s"} rated so far. Each row checks three sources: O*NET's rating, your experts, and{" "}
          {text ? "your job description" : "the job description (none yet)"}.
        </p>
        {!summary.length ? (
          <p className="kit-hint">No ratings yet. Experts rate from this page or from My work.</p>
        ) : (
          <div className="packet-rubric-wrap">
            <table className="packet-table flow-table">
              <thead>
                <tr>
                  <th>Task or skill</th>
                  <th>O*NET</th>
                  <th>Experts</th>
                  <th>Day one</th>
                  <th>In job description</th>
                  <th>Sources agree</th>
                </tr>
              </thead>
              <tbody>
                {summary
                  .sort((a, b) => b.mean - a.mean)
                  .map((s) => {
                    const e = nameOf(s.elementId);
                    const onetHigh = (e?.benchmark_importance ?? 0) >= 3.5 || e?.kind === "task";
                    const expHigh = s.mean >= 3.5;
                    const jd = inDescription(e?.name ?? "", text);
                    const agree = [onetHigh, expHigh, jd].filter(Boolean).length;
                    return (
                      <tr key={s.elementId}>
                        <td>{e?.name ?? s.elementId}</td>
                        <td>{e?.kind === "task" ? "Task" : e?.benchmark_importance?.toFixed(1) ?? "–"}</td>
                        <td>
                          {s.mean.toFixed(1)}
                          {!s.agree ? " · experts differ" : ""}
                        </td>
                        <td>
                          {s.dayOne} of {s.raters}
                        </td>
                        <td>{text ? (jd ? "Yes" : "No") : "–"}</td>
                        <td>{agree === 3 ? "All 3" : `${agree} of 3`}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
        {builder && !locked && (
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {job.analysis.confirmedBy ? (
              <>
                <Done>Confirmed by {job.analysis.confirmedBy}</Done>
                <Button variant="ghost" size="sm" onClick={() => update((j) => ({ ...j, analysis: { ...j.analysis, confirmedBy: null } }))}>
                  Reopen
                </Button>
              </>
            ) : (
              <>
                <Button disabled={experts < 2} onClick={() => update((j) => ({ ...j, analysis: { ...j.analysis, confirmedBy: meName } }))}>
                  Confirm the job analysis
                </Button>
                {experts < 2 && <span className="text-sm text-muted-foreground">Needs ratings from at least 2 experts.</span>}
              </>
            )}
          </div>
        )}
        {!builder && job.analysis.confirmedBy && <Done>Confirmed by {job.analysis.confirmedBy}</Done>}
      </div>
    </div>
  );
}

/* ---------- 3. Test plan ---------- */
const ADDABLE: { kind: MethodKind; label: string }[] = [
  { kind: "practical", label: "Hands-on practical" },
  { kind: "roleplay", label: "Live simulation (role-play)" },
  { kind: "work_sample", label: "Take-home skills assessment" },
  { kind: "timed_sample", label: "Timed skills assessment" },
  { kind: "sjt", label: "Situational judgment questions" },
  { kind: "knowledge", label: "Job knowledge check" },
  { kind: "license", label: "License check" },
];

export function finalMethods(job: Job, methods: Method[]) {
  const ov = job.plan.overrides;
  const kept = methods.filter((m) => {
    const last = ov.filter((o) => o.key === methodKey(m)).at(-1);
    return last?.decision !== "drop";
  });
  const added = ov.filter((o) => o.decision === "add" && !ov.some((x) => x.key === o.key && x.decision === "drop" && x.at > o.at));
  return { kept, added };
}

export function PlanStep({ job, roles, meName, update, locked }: StepProps) {
  const { profile, error } = useProfile(job);
  const can = (roles.includes("builder") || roles.includes("expert")) && !locked && !job.plan.approvedBy;
  const canAnswer = (roles.includes("builder") || roles.includes("hr")) && !locked && !job.plan.approvedBy;
  const [reason, setReason] = useState<Record<string, string>>({}),
    [addKind, setAddKind] = useState(""),
    [addReason, setAddReason] = useState(""),
    [msg, setMsg] = useState("");
  const plan = profile?.plan;
  const a = job.plan.answers;
  const setAnswer = (k: "license" | "volume", v: string) =>
    update((j) => {
      const answers = { ...j.plan.answers };
      if (k === "license") {
        if (v === "yes") answers.license = true;
        else if (v === "no") answers.license = false;
        else delete answers.license;
      } else {
        if (v === "high" || v === "low") answers.volume = v;
        else delete answers.volume;
      }
      return { ...j, plan: { ...j.plan, answers } };
    });
  const override = (m: { kind: MethodKind; label: string }, decision: "keep" | "drop" | "add", why: string) => {
    if (!why.trim()) return setMsg("A reason is required. It goes into the hiring record.");
    setMsg("");
    update((j) => ({ ...j, plan: { ...j.plan, overrides: [...j.plan.overrides, { key: methodKey(m), label: m.label, decision, reason: why.trim(), by: meName, at: now() }] } }));
  };

  if (!job.onet) return <p className="kit-hint">Match the job to O*NET in step 2 first.</p>;
  if (error) return <p className="kit-hint">{error}</p>;
  if (!plan)
    return (
      <p className="quick-plan-loading">
        <Loader2 className="animate-spin" /> Applying the 8 criteria to this job…
      </p>
    );
  const { added } = finalMethods(job, plan.methods);
  return (
    <div className="grid gap-5">
      <div className="flow-card">
        <h3 className="flow-h3">Questions that change the plan</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Does this job need a license or certificate?
            <select className="flow-select block mt-1" disabled={!canAnswer} value={a.license === true ? "yes" : a.license === false ? "no" : ""} onChange={(e) => setAnswer("license", e.target.value)}>
              <option value="">Not sure yet</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label className="text-sm">
            Applicants per opening
            <select className="flow-select block mt-1" disabled={!canAnswer} value={a.volume ?? ""} onChange={(e) => setAnswer("volume", e.target.value)}>
              <option value="">Not sure yet</option>
              <option value="high">Many (about 50 or more)</option>
              <option value="low">Few</option>
            </select>
          </label>
        </div>
        <p className="text-sm mt-3">
          <strong>How the work is done:</strong> {plan.modeSummary.charAt(0).toLowerCase() + plan.modeSummary.slice(1)}.
        </p>
      </div>

      <div className="flow-card">
        <h3 className="flow-h3">The test plan</h3>
        <ol className="quick-plan-parts">
          {plan.methods.map((m) => {
            const k = methodKey(m);
            const history = job.plan.overrides.filter((o) => o.key === k);
            const last = history.at(-1);
            const dropped = last?.decision === "drop";
            return (
              <li key={k} className={dropped ? "flow-dropped" : ""}>
                <div className="quick-plan-part-head">
                  <span>
                    <span className="method-stage">{STAGE_LABEL[m.stage]}</span>
                    <strong>{m.label}</strong>
                  </span>
                  <span className={`kit-pill kit-pill-${dropped ? "wait" : last?.decision === "keep" ? "ok" : m.status === "consider" || m.status === "confirm" ? "wait" : "ok"}`}>
                    {dropped ? "Dropped" : last?.decision === "keep" ? "Confirmed" : m.status === "required" ? "Required" : m.status === "recommended" ? "Recommended" : m.status === "consider" ? "Consider" : "Experts confirm"}
                  </span>
                </div>
                <p className="text-sm mt-1">
                  {m.delivery} · {m.time}
                </p>
                <ul className="method-because">
                  {m.because.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                {history.map((o, i) => (
                  <p key={i} className="flow-override">
                    {o.decision === "drop" ? "Dropped" : "Kept"} by {o.by}, {day(o.at)}: {o.reason}
                  </p>
                ))}
                {can && (
                  <div className="flow-override-form">
                    <Input placeholder="Reason (required)" value={reason[k] ?? ""} onChange={(e) => setReason({ ...reason, [k]: e.target.value })} />
                    {dropped ? (
                      <Button size="sm" variant="outline" onClick={() => override(m, "keep", reason[k] ?? "")}>
                        Restore
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => override(m, "keep", reason[k] ?? "")}>
                          Confirm
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => override(m, "drop", reason[k] ?? "")}>
                          Drop
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
          {added.map((o) => (
            <li key={o.key + o.at}>
              <div className="quick-plan-part-head">
                <span>
                  <span className="method-stage">Added</span>
                  <strong>{o.label}</strong>
                </span>
                <span className="kit-pill kit-pill-ok">Added by experts</span>
              </div>
              <p className="flow-override">
                Added by {o.by}, {day(o.at)}: {o.reason}
              </p>
            </li>
          ))}
        </ol>
        {can && (
          <div className="flow-override-form mt-4">
            <select className="flow-select" value={addKind} onChange={(e) => setAddKind(e.target.value)} aria-label="Method to add">
              <option value="">Add a method…</option>
              {ADDABLE.filter((x) => !plan.methods.some((m) => m.kind === x.kind)).map((x) => (
                <option key={x.kind} value={x.kind}>
                  {x.label}
                </option>
              ))}
            </select>
            <Input placeholder="Reason (required)" value={addReason} onChange={(e) => setAddReason(e.target.value)} />
            <Button
              size="sm"
              variant="outline"
              disabled={!addKind}
              onClick={() => {
                const x = ADDABLE.find((y) => y.kind === addKind)!;
                override(x, "add", addReason);
                if (addReason.trim()) {
                  setAddKind("");
                  setAddReason("");
                }
              }}
            >
              Add
            </Button>
          </div>
        )}
        {msg && <p className="kit-hint">{msg}</p>}
      </div>

      <Criteria mp={plan} />

      <div className="flex flex-wrap items-center gap-3">
        {job.plan.approvedBy ? (
          <>
            <Done>Plan approved by {job.plan.approvedBy}</Done>
            {roles.includes("builder") && !locked && (
              <Button variant="ghost" size="sm" onClick={() => update((j) => ({ ...j, plan: { ...j.plan, approvedBy: null }, test: { expertApprovedBy: null, hrApprovedBy: null } }))}>
                Reopen
              </Button>
            )}
          </>
        ) : (
          roles.includes("builder") && !locked && <Button onClick={() => update((j) => ({ ...j, plan: { ...j.plan, approvedBy: meName } }))}>Approve the test plan</Button>
        )}
      </div>
    </div>
  );
}

/* ---------- 4. Hiring test ---------- */
export function TestStep({ job, roles, meName, update, locked }: StepProps) {
  const draft = useServerFn(draftSample);
  const [assessment, setAssessment] = useState<DraftResult | null>(null),
    [interview, setInterview] = useState<DraftResult | null>(null);
  const { profile } = useProfile(job);
  useEffect(() => {
    if (job.kit || !job.onet || locked) return;
    let live = true;
    const fail = (): DraftResult => ({ ai: false, notice: "The draft couldn't be loaded. Try again in a minute." });
    draft({ data: { code: job.onet.code, part: "assessment" } }).then((r) => live && setAssessment(r), () => live && setAssessment(fail()));
    draft({ data: { code: job.onet.code, part: "interview" } }).then((r) => live && setInterview(r), () => live && setInterview(fail()));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.onet?.code, job.kit, locked]);
  const main = profile?.plan?.methods.find((m) => m.stage === "main" && ["practical", "roleplay", "work_sample", "timed_sample"].includes(m.kind));
  const changes = job.plan.overrides.filter((o) => o.decision !== "keep");
  const t = job.test;
  return (
    <div className="grid gap-5">
      <div className="flow-card">
        <h3 className="flow-h3">Approvals</h3>
        <p className="text-sm text-muted-foreground mb-3">An expert checks the test against the real job; HR checks fairness, accommodations and instructions. Both are needed before candidates get links.</p>
        <div className="flex flex-wrap items-center gap-4">
          {t.expertApprovedBy ? (
            <Done>Expert: {t.expertApprovedBy}</Done>
          ) : roles.includes("expert") && !locked ? (
            <Button onClick={() => update((j) => ({ ...j, test: { ...j.test, expertApprovedBy: meName } }))}>Approve as job expert</Button>
          ) : (
            <span className="text-sm">Waiting for a job expert</span>
          )}
          {t.hrApprovedBy ? (
            <Done>HR: {t.hrApprovedBy}</Done>
          ) : roles.includes("hr") && !locked ? (
            <Button onClick={() => update((j) => ({ ...j, test: { ...j.test, hrApprovedBy: meName } }))}>Approve as HR</Button>
          ) : (
            <span className="text-sm">Waiting for HR</span>
          )}
        </div>
        {changes.length > 0 && (
          <div className="mt-4">
            <p className="eyebrow">Changes from the test plan</p>
            <ul className="method-because">
              {changes.map((o, i) => (
                <li key={i}>
                  {o.decision === "drop" ? "Dropped" : "Added"}: {o.label}. {o.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {job.kit ? (
        <>
          <div className="packet-toolbar">
            <p className="text-muted-foreground">The approved hiring team packet for this job.</p>
            <Button onClick={() => window.print()}>
              <Printer /> Print or save as PDF
            </Button>
          </div>
          <HiringPacket data={packetDemo} />
        </>
      ) : locked ? null : (
        <DraftSections assessment={assessment} interview={interview} mainLabel={(main?.label ?? "skills assessment").toLowerCase()} numbered={false} />
      )}
    </div>
  );
}

/* ---------- 5. Candidates ---------- */
export function CandidatesStep({ job, roles, update, locked }: StepProps) {
  const isHr = roles.includes("hr") && !locked;
  const [name, setName] = useState(""),
    [email, setEmail] = useState("");
  if (job.kit) return <KitCandidates roles={roles} />;
  return (
    <div className="grid gap-5">
      {isHr && (
        <form
          className="flow-card flow-override-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            update((j) => ({ ...j, candidates: [...j.candidates, { id: crypto.randomUUID(), name: name.trim(), email: email.trim(), addedAt: now() }] }));
            setName("");
            setEmail("");
          }}
        >
          <Input placeholder="Candidate name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit">Add candidate</Button>
        </form>
      )}
      <div className="flow-card">
        {!job.candidates.length ? (
          <p className="kit-hint">No candidates yet.</p>
        ) : (
          <table className="packet-table flow-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Added</th>
                <th>Test link</th>
              </tr>
            </thead>
            <tbody>
              {job.candidates.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                    <br />
                    <small>{c.email}</small>
                  </td>
                  <td>{day(c.addedAt)}</td>
                  <td>Sent when your database is connected</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function KitCandidates({ roles }: { roles: TeamRole[] }) {
  const kit = useKit();
  const seesNames = roles.includes("hr") || roles.includes("manager") || roles.includes("builder");
  return (
    <div className="flow-card">
      <table className="packet-table flow-table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Applied</th>
            <th>Where they are</th>
          </tr>
        </thead>
        <tbody>
          {kitCandidates.map((c) => {
            const s = stage(c, kit.sheets, kit.decisions);
            return (
              <tr key={c.id}>
                <td>
                  <strong>{seesNames ? c.name : c.id}</strong>
                  {seesNames && (
                    <>
                      <br />
                      <small>{c.id}</small>
                    </>
                  )}
                </td>
                <td>{c.appliedAt}</td>
                <td>{s.label}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!seesNames && <p className="kit-hint">Raters see candidate numbers only, so scoring stays blind.</p>}
    </div>
  );
}

/* ---------- 6. Scoring ---------- */
export function ScoringStep({ job, roles, locked }: StepProps) {
  const team = useAdmin();
  const me = team.person;
  const views = [
    ...(roles.includes("rater") ? (["rater"] as const) : []),
    ...(roles.includes("manager") ? (["manager"] as const) : []),
    ...(roles.includes("hr") ? (["hr"] as const) : []),
  ];
  const [view, setView] = useState<(typeof views)[number] | null>(null);
  const active = view && views.includes(view as never) ? view : views[0];
  if (!job.kit || locked)
    return (
      <div className="flow-card">
        <p>Scoring opens when candidates submit their tests. Raters practice on sample answers first, then score blind against the written guide.</p>
      </div>
    );
  if (!me || !active)
    return (
      <div className="flow-card">
        <p>Scoring is done by the raters, the hiring manager and HR. Switch to one of them with “Viewing as” to see their part.</p>
      </div>
    );
  const label = { rater: "Score as a rater", manager: "Live exercise and interview", hr: "Round overview" } as const;
  return (
    <div className="grid gap-4">
      {views.length > 1 && (
        <div className="kit-tabs" role="tablist">
          {views.map((v) => (
            <button key={v} role="tab" aria-selected={active === v} className={active === v ? "is-on" : ""} onClick={() => setView(v)}>
              {label[v]}
            </button>
          ))}
        </div>
      )}
      {active === "rater" && <RaterKit key={me.id} me={me} />}
      {active === "manager" && <ManagerKit key={me.id} me={me} />}
      {active === "hr" && <HrKit />}
    </div>
  );
}

/* ---------- 7. Decision & fairness ---------- */
export function DecisionStep({ job, locked }: StepProps) {
  if (!job.kit || locked)
    return (
      <div className="flow-card">
        <p>Once candidates are scored, the hiring manager records each decision with a reason, and HR checks pass rates across groups.</p>
      </div>
    );
  return <DecisionsFairness />;
}
