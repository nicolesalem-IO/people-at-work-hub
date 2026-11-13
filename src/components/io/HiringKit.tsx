import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Download, Lock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAdmin } from "@/components/io/AdminProvider";
import { useKit } from "@/components/io/KitStore";
import { demoPeople } from "@/data/admin-demo";
import { kitBenchmarks, kitCandidates, type KitCandidate } from "@/data/kit-demo";
import { packetDemo } from "@/data/packet-demo";
import { orgRoles, type Person } from "@/lib/admin-rules";
import { downloadText, toCsv } from "@/lib/ats";
import {
  AGREEMENT_TARGET,
  RETENTION_MONTHS,
  agreement,
  blindResult,
  calibrationCheck,
  panelResult,
  retainUntil,
  submitted,
  type Choice,
  type Sheet,
  type Step,
} from "@/lib/kit-rules";
import { SCORE_LABELS, packetProblems, type Anchors } from "@/lib/packet";

const P = packetDemo;
const WS = P.workSample.rubric;
const TB = P.teachBack.rubric;
const IV = P.interview.questions.map((q) => ({ id: q.id, name: q.measures, critical: false, anchors: q.anchors, prompt: q }));
const nameOf = (id: string) => demoPeople.find((p) => p.id === id)?.name ?? id;
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

type KitView = "rater" | "manager" | "hr" | "expert";
const KIT_LABEL: Record<KitView, string> = { rater: "Score work samples", manager: "Teach-back, interview & decision", hr: "Hiring round overview", expert: "Approve the test" };
function kitsFor(p: Person): KitView[] {
  const r = new Set(p.roles);
  const out: KitView[] = [];
  if (r.has("hr") || r.has("admin")) out.push("hr");
  if (r.has("hiring_manager") || r.has("admin")) out.push("manager");
  if (r.has("rater") || r.has("admin")) out.push("rater");
  if (r.has("sme") || r.has("analyst") || r.has("admin")) out.push("expert");
  return out;
}

/* ---------- interactive score form: click the description that matches the work ---------- */
interface FormLine {
  id: string;
  name: string;
  critical: boolean;
  anchors: Anchors;
  prompt?: { question: string; followUp: string };
}
function ScoreForm({
  lines,
  scores,
  notes,
  onScore,
  onNote,
  locked,
  showNotes = true,
}: {
  lines: FormLine[];
  scores: Record<string, number>;
  notes?: Record<string, string>;
  onScore: (id: string, n: number) => void;
  onNote?: (id: string, t: string) => void;
  locked: boolean;
  showNotes?: boolean;
}) {
  return (
    <div className="kit-form">
      {lines.map((l) => (
        <fieldset key={l.id} className="kit-line" disabled={locked}>
          <legend>
            {l.prompt ? (
              <>
                <span className="kit-q">{l.prompt.question}</span>
                <span className="kit-q-follow">If needed: {l.prompt.followUp} · Measures {l.name}</span>
              </>
            ) : (
              <>
                {l.name}
                {l.critical && <span className="packet-critical">Critical</span>}
              </>
            )}
          </legend>
          <div className="kit-anchors" role="radiogroup" aria-label={`${l.name} score`}>
            {l.anchors.map((a, i) => {
              const n = i + 1;
              const on = scores[l.id] === n;
              return (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={`kit-anchor${on ? " is-on" : ""}${n === 3 ? " is-standard" : ""}`}
                  onClick={() => onScore(l.id, n)}
                >
                  <span className="kit-anchor-n">
                    {n} <small>{SCORE_LABELS[i]}</small>
                  </span>
                  {a}
                </button>
              );
            })}
          </div>
          {showNotes && onNote && (
            <label className="kit-note">
              Evidence for this score
              <input
                value={notes?.[l.id] ?? ""}
                onChange={(e) => onNote(l.id, e.target.value)}
                placeholder="What did you see or hear that matches this level?"
              />
            </label>
          )}
        </fieldset>
      ))}
    </div>
  );
}

/* ---------- one person's sheet for one candidate and step: draft, submit, locked revisions ---------- */
function SheetEditor({ candidateId, step, raterId, lines }: { candidateId: string; step: Step; raterId: string; lines: FormLine[] }) {
  const kit = useKit();
  const existing = kit.sheets.find((s) => s.candidateId === candidateId && s.step === step && s.raterId === raterId);
  const base: Sheet = existing ?? { id: `${candidateId}-${step}-${raterId}`, candidateId, step, raterId, scores: {}, notes: {}, submittedAt: null, history: [] };
  const [scores, setScores] = useState(base.scores);
  const [notes, setNotes] = useState(base.notes);
  const [editing, setEditing] = useState(false);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const locked = Boolean(base.submittedAt) && !editing;
  const complete = lines.every((l) => scores[l.id]);
  return (
    <div className="kit-sheet">
      <ScoreForm
        lines={lines}
        scores={scores}
        notes={notes}
        locked={locked}
        onScore={(id, n) => setScores((s) => ({ ...s, [id]: n }))}
        onNote={(id, t) => setNotes((s) => ({ ...s, [id]: t }))}
      />
      {base.submittedAt && !editing && (
        <p className="kit-locked">
          <Lock className="size-4" /> Submitted {fmt(base.submittedAt)} and locked.
          <button type="button" className="kit-link" onClick={() => setEditing(true)}>
            Change a submitted score
          </button>
        </p>
      )}
      {editing && (
        <label className="kit-note">
          Reason for the change (kept in the record)
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
        </label>
      )}
      {!locked && (
        <div className="kit-actions">
          {!base.submittedAt && (
            <Button variant="outline" onClick={() => { kit.saveSheet({ ...base, scores, notes }, false); setMsg("Draft saved."); }}>
              Save draft
            </Button>
          )}
          <Button
            disabled={!complete || (editing && !reason.trim())}
            onClick={() => {
              if (editing) {
                kit.reviseSheet(base, scores, notes, reason);
                setEditing(false);
                setReason("");
                setMsg("Change saved. The earlier version stays in the record.");
              } else {
                kit.saveSheet({ ...base, scores, notes }, true);
                setMsg("Submitted.");
              }
            }}
          >
            {editing ? "Save change" : "Submit scores"} <ArrowRight />
          </Button>
          {!complete && <span className="kit-hint">Score every line to submit.</span>}
        </div>
      )}
      {base.history.length > 0 && (
        <details className="kit-history">
          <summary>{base.history.length} earlier version{base.history.length > 1 ? "s" : ""}</summary>
          <ul>
            {base.history.map((h, i) => (
              <li key={i}>
                {fmt(h.at)}: {lines.map((l) => `${l.name} ${h.scores[l.id]}`).join(", ")}. Changed because: {h.reason}
              </li>
            ))}
          </ul>
        </details>
      )}
      {msg && <p role="status" className="kit-hint">{msg}</p>}
    </div>
  );
}

/* ---------- status helpers ---------- */
export function stage(c: KitCandidate, sheets: Sheet[], decisions: ReturnType<typeof useKit>["decisions"]) {
  if (c.qualification === "hr_review") return { ws: null, tb: null, iv: null, decision: undefined, label: "HR review: qualification", tone: "warn" as const };
  const ws = blindResult(WS, sheets, c.id);
  const tb = ws.status === "final" && ws.pass ? panelResult(TB, sheets, c.id, "teach_back") : null;
  const iv = tb?.pass ? panelResult(IV, sheets, c.id, "interview") : null;
  const decision = decisions.find((d) => d.candidateId === c.id);
  let label = "Work sample: waiting for raters", tone: "warn" | "ok" | "stop" | "wait" = "wait";
  if (ws.status === "needs_third") { label = "Third rater needed"; tone = "warn"; }
  else if (ws.status === "final" && !ws.pass) { label = ws.failedCritical.length ? "Stopped: critical line below 2" : "Stopped: average below 3.0"; tone = "stop"; }
  else if (ws.status === "final" && !tb) { label = "Finalist: teach-back next"; tone = "ok"; }
  else if (tb && !tb.pass) { label = "Stopped at teach-back"; tone = "stop"; }
  else if (tb && !iv) { label = "Finalist: interview next"; tone = "ok"; }
  else if (iv && !decision) { label = "Ready for decision"; tone = "ok"; }
  if (decision) { label = `Decision: ${decision.choice}`; tone = decision.choice === "advance" ? "ok" : "wait"; }
  return { ws, tb, iv, decision, label, tone };
}
const Pill = ({ tone, children }: { tone: string; children: React.ReactNode }) => <span className={`kit-pill kit-pill-${tone}`}>{children}</span>;

/* ---------- Rater kit ---------- */
function RaterKit({ me }: { me: Person }) {
  const kit = useKit();
  const [open, setOpen] = useState<string | null>(null);
  const [cal, setCal] = useState<Record<string, Record<string, number>>>(kit.calibration[me.id] ?? {});
  const check = calibrationCheck(WS, kitBenchmarks, kit.calibration[me.id] ?? {});
  const [checked, setChecked] = useState(false);

  if (!check.passed) {
    const draft = calibrationCheck(WS, kitBenchmarks, cal);
    return (
      <section>
        <KitIntro step="Step 1 of 2" title="Calibrate before you score">
          Score these three benchmark responses. Experts have already scored them. You're ready when every line lands within 1 point of
          theirs.
        </KitIntro>
        {kitBenchmarks.map((b) => (
          <article key={b.id} className="kit-card">
            <h3>{b.label}</h3>
            <p className="kit-response">{b.response}</p>
            <ScoreForm
              lines={WS}
              scores={cal[b.id] ?? {}}
              locked={false}
              showNotes={false}
              onScore={(id, n) => setCal((c) => ({ ...c, [b.id]: { ...c[b.id], [id]: n } }))}
            />
            {checked && draft.complete && (
              <ul className="kit-feedback">
                {WS.map((l) => {
                  const miss = draft.misses.find((m) => m.benchmark === b.id && m.line === l.id);
                  return (
                    <li key={l.id} className={miss ? "is-miss" : "is-hit"}>
                      {l.name}: you gave {cal[b.id]?.[l.id]}, experts gave {b.expert[l.id as keyof typeof b.expert]}
                      {miss ? " — reread the anchors for this line" : " ✓"}
                    </li>
                  );
                })}
              </ul>
            )}
          </article>
        ))}
        <div className="kit-actions">
          <Button
            disabled={!draft.complete}
            onClick={() => {
              setChecked(true);
              if (draft.passed) kit.saveCalibration(me.id, cal);
            }}
          >
            Check my scores <ArrowRight />
          </Button>
          {checked && draft.complete && !draft.passed && (
            <span className="kit-hint">{draft.misses.length} line(s) more than 1 point off. Adjust and check again.</span>
          )}
        </div>
      </section>
    );
  }

  const pool = kitCandidates.filter((c) => c.qualification === "met");
  const mine = (id: string) => kit.sheets.find((s) => s.candidateId === id && s.step === "work_sample" && s.raterId === me.id);
  const queue = pool.filter((c) => {
    if (mine(c.id)?.submittedAt) return false;
    const r = blindResult(WS, kit.sheets, c.id);
    return r.status === "needs_third" || (r.status === "waiting" && r.count < 2);
  });
  const done = pool.filter((c) => mine(c.id)?.submittedAt);
  const current = pool.find((c) => c.id === open);

  if (current)
    return (
      <section>
        <button type="button" className="kit-back" onClick={() => setOpen(null)}>
          <ArrowLeft className="size-4" /> Back to your queue
        </button>
        <KitIntro step={`Candidate ${current.id}`} title="Score the work sample">
          You see an ID, never a name. Score alone; you won't see the other rater's scores. Read the 3 column first: it's the day-one
          standard.
        </KitIntro>
        <article className="kit-card">
          <h3>Candidate's response</h3>
          <p className="kit-brief-mini">Task: {P.workSample.instructions}</p>
          <p className="kit-response">{current.response}</p>
        </article>
        <SheetEditor key={current.id} candidateId={current.id} step="work_sample" raterId={me.id} lines={WS} />
      </section>
    );

  return (
    <section>
      <KitIntro step="Step 2 of 2 · Calibrated" title="Your scoring queue">
        Blind scoring for {P.role}. Two raters score every response; a third steps in when they're more than a point apart.
      </KitIntro>
      <div className="kit-list">
        {queue.length === 0 && <p className="kit-empty">Nothing waiting for you. New responses appear here as candidates submit.</p>}
        {queue.map((c) => {
          const r = blindResult(WS, kit.sheets, c.id);
          return (
            <button key={c.id} type="button" className="kit-row" onClick={() => setOpen(c.id)}>
              <strong>{c.id}</strong>
              <span>
                {r.status === "needs_third"
                  ? `Third rater needed on: ${r.gaps.map((g) => WS.find((l) => l.id === g)?.name).join(", ")}`
                  : mine(c.id)
                    ? "Draft saved"
                    : r.status === "waiting" && r.count === 1
                      ? "Second rating"
                      : "First rating"}
              </span>
              <ArrowRight className="size-4" />
            </button>
          );
        })}
      </div>
      {done.length > 0 && (
        <>
          <h3 className="kit-subhead">You've scored</h3>
          <div className="kit-list">
            {done.map((c) => {
              const r = blindResult(WS, kit.sheets, c.id);
              return (
                <button key={c.id} type="button" className="kit-row" onClick={() => setOpen(c.id)}>
                  <strong>{c.id}</strong>
                  <span>
                    {r.status === "final"
                      ? `Final average ${r.average.toFixed(1)} · ${r.pass ? "Pass" : "Stop"}`
                      : r.status === "needs_third"
                        ? "Waiting for a third rater"
                        : "Waiting for the other rater"}
                  </span>
                  <ArrowRight className="size-4" />
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

/* ---------- Hiring manager kit ---------- */
function ManagerKit({ me }: { me: Person }) {
  const kit = useKit();
  const [open, setOpen] = useState<string | null>(null);
  const [tab, setTab] = useState<"teach_back" | "interview" | "decision">("teach_back");
  const [choice, setChoice] = useState<Choice | "">("");
  const [reason, setReason] = useState("");
  const rows = kitCandidates.map((c) => ({ c, s: stage(c, kit.sheets, kit.decisions) }));
  const finalists = rows.filter((r) => r.s.ws?.status === "final" && r.s.ws.pass);
  const current = finalists.find((r) => r.c.id === open);

  if (current) {
    const { c, s } = current;
    const ws = s.ws?.status === "final" ? s.ws : null;
    return (
      <section>
        <button type="button" className="kit-back" onClick={() => setOpen(null)}>
          <ArrowLeft className="size-4" /> Back to finalists
        </button>
        <KitIntro step={`${c.id} · finalist`} title={c.name}>
          Work sample {ws?.average.toFixed(1)} (two blind raters). Teach-back {s.tb ? s.tb.average.toFixed(1) : "not scored"} · Interview{" "}
          {s.iv ? s.iv.average.toFixed(1) : "not scored"}.
        </KitIntro>
        <div className="kit-tabs" role="tablist">
          {(["teach_back", "interview", "decision"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "is-on" : ""} onClick={() => setTab(t)}>
              {t === "teach_back" ? "1. Teach-back" : t === "interview" ? "2. Interview" : "3. Decision"}
            </button>
          ))}
        </div>
        {tab === "teach_back" && (
          <>
            <div className="kit-card kit-cue">
              <p>
                <strong>{P.teachBack.teachMinutes} minutes.</strong> {P.teachBack.setup} About halfway, the second interviewer reads:{" "}
                <em>{P.teachBack.confusedLine}</em>
              </p>
            </div>
            <SheetEditor key={`${c.id}-tb`} candidateId={c.id} step="teach_back" raterId={me.id} lines={TB} />
          </>
        )}
        {tab === "interview" &&
          (s.tb?.pass ? (
            <>
              <blockquote className="packet-script">
                <span>Open with</span>
                {P.interview.opening}
              </blockquote>
              <SheetEditor key={`${c.id}-iv`} candidateId={c.id} step="interview" raterId={me.id} lines={IV} />
              <p className="kit-hint">Don't ask about: {P.interview.dontAsk}</p>
            </>
          ) : (
            <p className="kit-empty">The interview opens once the teach-back is scored at 3.0 or higher with no critical line below 2.</p>
          ))}
        {tab === "decision" && (
          <div className="kit-card">
            <table className="packet-table">
              <tbody>
                <tr><td>Work sample</td><td>{ws?.average.toFixed(1)} · Pass</td></tr>
                <tr><td>Teach-back</td><td>{s.tb ? `${s.tb.average.toFixed(1)} · ${s.tb.pass ? "Pass" : "Stop"}` : "Not scored"}</td></tr>
                <tr><td>Interview</td><td>{s.iv ? `${s.iv.average.toFixed(1)} (no cutoff)` : "Not scored"}</td></tr>
              </tbody>
            </table>
            {s.decision ? (
              <p className="kit-locked">
                <Lock className="size-4" /> {nameOf(s.decision.by)} chose <strong>{s.decision.choice}</strong> on {fmt(s.decision.at)}: “{s.decision.reason}”
              </p>
            ) : (
              <>
                <div className="kit-choices" role="radiogroup" aria-label="Decision">
                  {(["advance", "hold", "decline"] as const).map((x) => (
                    <button key={x} type="button" role="radio" aria-checked={choice === x} className={choice === x ? "is-on" : ""} onClick={() => setChoice(x)}>
                      {x[0]!.toUpperCase() + x.slice(1)}
                    </button>
                  ))}
                </div>
                <label className="kit-note">
                  Reason, tied to the scores and evidence (required)
                  <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
                </label>
                <div className="kit-actions">
                  <Button
                    disabled={!choice || reason.trim().length < 20 || !s.iv}
                    onClick={() => kit.decide({ candidateId: c.id, choice: choice as Choice, reason: reason.trim(), by: me.id, at: new Date().toISOString() })}
                  >
                    Record decision <ArrowRight />
                  </Button>
                  {!s.iv && <span className="kit-hint">Score the interview first.</span>}
                  {s.iv && reason.trim().length < 20 && <span className="kit-hint">Write at least a sentence.</span>}
                </div>
              </>
            )}
          </div>
        )}
      </section>
    );
  }

  return (
    <section>
      <KitIntro step={`${P.role} · ${P.organization}`} title="Your finalists">
        Candidates appear here after two blind raters pass their work sample. You score the teach-back and interview, then record the decision.
      </KitIntro>
      <div className="kit-list">
        {finalists.length === 0 && <p className="kit-empty">No finalists yet.</p>}
        {finalists.map(({ c, s }) => (
          <button key={c.id} type="button" className="kit-row" onClick={() => { setOpen(c.id); setTab(s.tb ? (s.tb.pass ? (s.iv ? "decision" : "interview") : "teach_back") : "teach_back"); setChoice(""); setReason(""); }}>
            <strong>{c.name}</strong>
            <span>{c.id}</span>
            <Pill tone={s.tone}>{s.label}</Pill>
            <ArrowRight className="size-4" />
          </button>
        ))}
      </div>
      <p className="kit-hint">
        {rows.filter((r) => r.s.tone === "stop").length} stopped and {rows.filter((r) => r.s.ws && r.s.ws.status !== "final").length} still being
        scored. HR reviews anyone stopped by a critical line.
      </p>
    </section>
  );
}

/* ---------- HR kit ---------- */
function HrKit() {
  const kit = useKit();
  const rows = kitCandidates.map((c) => ({ c, s: stage(c, kit.sheets, kit.decisions) }));
  const agree = agreement(WS, kit.sheets);
  const flags = rows.filter((r) => r.s.tone === "warn" || (r.s.ws?.status === "final" && r.s.ws.failedCritical.length > 0));
  const exportRecords = () => {
    const sheetRows = kit.sheets.flatMap((s) => {
      const c = kitCandidates.find((x) => x.id === s.candidateId);
      const lines = s.step === "work_sample" ? WS : s.step === "teach_back" ? TB : IV;
      const versions = [...s.history.map((h) => ({ ...h, current: false })), { at: s.submittedAt ?? "", reason: "", scores: s.scores, notes: s.notes, current: true }];
      return versions.flatMap((v) =>
        lines.map((l) => [s.candidateId, c?.name ?? "", s.step, nameOf(s.raterId), l.name, v.scores[l.id] ?? "", v.notes[l.id] ?? "", v.at, v.current ? "current" : `replaced: ${v.reason}`]),
      );
    });
    const decisionRows = kit.decisions.map((d) => [d.candidateId, kitCandidates.find((x) => x.id === d.candidateId)?.name ?? "", "decision", nameOf(d.by), d.choice, "", d.reason, d.at, "current"]);
    downloadText(
      `hiring-records-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv([["candidate_id", "candidate_name", "step", "by", "rubric_line_or_decision", "score", "evidence_or_reason", "recorded_at", "version"], ...sheetRows, ...decisionRows]),
    );
  };
  return (
    <section>
      <KitIntro step={`${P.role} · ${P.organization}`} title="Hiring round overview">
        Everyone in the round, every step, and anything that needs a person to look at it.
      </KitIntro>
      <div className="kit-stats">
        <div>
          <span>Candidates</span>
          <strong>{rows.length}</strong>
        </div>
        <div>
          <span>Need attention</span>
          <strong className={flags.length ? "is-warn" : ""}>{flags.length}</strong>
        </div>
        <div>
          <span>Rater agreement</span>
          <strong className={agree && !agree.onTarget ? "is-warn" : ""}>{agree ? `${Math.round(agree.rate * 100)}%` : "–"}</strong>
          <small>Target {Math.round(AGREEMENT_TARGET * 100)}% within 1 point{agree && !agree.onTarget ? " · recalibrate raters" : ""}</small>
        </div>
        <div>
          <span>Records kept</span>
          <strong>{RETENTION_MONTHS / 12} years</strong>
        </div>
      </div>
      {flags.length > 0 && (
        <div className="packet-callout packet-callout-warn">
          <h4>Needs attention</h4>
          <ul>
            {flags.map(({ c, s }) => (
              <li key={c.id}>
                <strong>{c.name}</strong> ({c.id}): {s.label}
                {c.qualificationNote ? `. ${c.qualificationNote}` : ""}
                {s.ws?.status === "final" && s.ws.failedCritical.length ? ` on ${s.ws.failedCritical.join(", ")}. Review before closing.` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="packet-rubric-wrap">
        <table className="packet-table kit-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Work sample</th>
              <th>Teach-back</th>
              <th>Interview</th>
              <th>Status</th>
              <th>Keep records until</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ c, s }) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.name}</strong>
                  <br />
                  <small>{c.id}</small>
                </td>
                <td>{s.ws ? (s.ws.status === "final" ? s.ws.average.toFixed(1) : s.ws.status === "needs_third" ? "Gap > 1" : `${s.ws.count} of 2`) : "–"}</td>
                <td>{s.tb ? s.tb.average.toFixed(1) : "–"}</td>
                <td>{s.iv ? s.iv.average.toFixed(1) : "–"}</td>
                <td>
                  <Pill tone={s.tone}>{s.label}</Pill>
                </td>
                <td>{fmt(retainUntil(s.decision?.at ?? c.appliedAt))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="kit-actions">
        <Button variant="outline" onClick={exportRecords}>
          <Download /> Export all records (CSV)
        </Button>
      </div>
      <p className="kit-hint">
        Hiring records, including every score, note, change and decision, are kept for {RETENTION_MONTHS / 12} years from the decision (or from
        the application if there's no decision). If your company stops using the app, export the records first and store them securely.
      </p>
    </section>
  );
}

/* ---------- Expert kit ---------- */
function ExpertKit({ me }: { me: Person }) {
  const kit = useKit();
  const problems = packetProblems(P);
  return (
    <section>
      <KitIntro step={`${P.role} · ${P.organization}`} title="Approve the test">
        You never see candidates. Your job is to confirm the exercise reflects the real work and that every rating level describes it fairly.
      </KitIntro>
      <ol className="kit-checklist">
        <li>The work sample is a task new hires really do in their first months.</li>
        <li>The 3 column describes what you'd accept from a new hire on day one.</li>
        <li>Critical lines are ones the job can't do without.</li>
        <li>Nothing in the materials needs knowledge only insiders would have.</li>
      </ol>
      <div className="kit-actions">
        <Button asChild variant="outline">
          <Link to="/test" search={{ part: "packet" }}>Read the full packet <ArrowRight /></Link>
        </Button>
        {kit.approvedBy ? (
          <span className="kit-locked">
            <CheckCircle2 className="size-4" /> Approved by {kit.approvedBy}
          </span>
        ) : (
          <Button disabled={problems.length > 0} onClick={() => kit.approve(me.name)}>
            Approve the packet <ArrowRight />
          </Button>
        )}
      </div>
      {problems.length > 0 && (
        <ul className="kit-feedback">
          {problems.map((p) => (
            <li key={p} className="is-miss">
              <AlertTriangle className="size-4" /> {p}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function KitIntro({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <header className="kit-intro">
      <p className="eyebrow">{step}</p>
      <h2>{title}</h2>
      <p>{children}</p>
    </header>
  );
}

/* ---------- page ---------- */
export function HiringKit() {
  const team = useAdmin();
  const kit = useKit();
  const me = team.person;
  const kits = me ? kitsFor(me) : [];
  const [view, setView] = useState<KitView | null>(null);
  const active = view && kits.includes(view) ? view : kits[0];

  if (!me)
    return (
      <section className="kit">
        <header className="kit-hero">
          <p className="eyebrow">My tasks · fictional demo</p>
          <h1>Who are you?</h1>
          <p>Everyone on the hiring team gets only their part: raters score, the hiring manager interviews and decides, experts approve, HR oversees. Pick someone to see their tasks.</p>
        </header>
        {team.demo ? (
          <div className="kit-people">
            {demoPeople.map((p) => (
              <button key={p.id} type="button" onClick={() => team.setDemoId(p.id)}>
                <strong>{p.name}</strong>
                <span>{p.roles.map((r) => orgRoles[r]).join(" + ")}</span>
                <small>{kitsFor(p).map((k) => KIT_LABEL[k]).join(" · ")}</small>
              </button>
            ))}
          </div>
        ) : (
          <p className="kit-empty">Your organization hasn't given you a role yet. Ask an admin.</p>
        )}
      </section>
    );

  return (
    <section className="kit">
      <header className="kit-hero">
        <div>
          <p className="eyebrow">
            My tasks · {P.role}
            {team.demo ? " · fictional demo" : ""}
          </p>
          <h1>{me.name.split(" ")[0]}'s tasks</h1>
        </div>
        {team.demo && (
          <div className="kit-hero-actions">
            <Button variant="ghost" size="sm" onClick={() => team.setDemoId("")}>
              Switch person
            </Button>
            <Button variant="ghost" size="sm" onClick={kit.reset}>
              <RotateCcw /> Reset demo
            </Button>
          </div>
        )}
      </header>
      {kits.length > 1 && (
        <div className="kit-tabs kit-tabs-main" role="tablist" aria-label="Your kits">
          {kits.map((k) => (
            <button key={k} role="tab" aria-selected={active === k} className={active === k ? "is-on" : ""} onClick={() => setView(k)}>
              {KIT_LABEL[k]}
            </button>
          ))}
        </div>
      )}
      {active === "rater" && <RaterKit key={me.id} me={me} />}
      {active === "manager" && <ManagerKit key={me.id} me={me} />}
      {active === "hr" && <HrKit />}
      {active === "expert" && <ExpertKit me={me} />}
      {team.demo && <p className="kit-footnote">Demo records are saved in this browser only. Signed-in records will be saved to your organization's database.</p>}
    </section>
  );
}
