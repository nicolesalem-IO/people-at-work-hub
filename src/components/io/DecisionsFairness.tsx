import { Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/components/io/AdminProvider";
import { useKit } from "@/components/io/KitStore";
import { stage } from "@/components/io/HiringKit";
import { demoPeople } from "@/data/admin-demo";
import { kitCandidates } from "@/data/kit-demo";
import { packetDemo } from "@/data/packet-demo";
import { AGREEMENT_TARGET, MIN_GROUP_SIZE, agreement, fourFifths } from "@/lib/kit-rules";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const nameOf = (id: string) => demoPeople.find((p) => p.id === id)?.name ?? id;
const pct = (n: number) => `${Math.round(n * 100)}%`;

export function DecisionsFairness() {
  const kit = useKit();
  const team = useAdmin();
  const canSeeGroups = !team.person || team.person.roles.some((r) => r === "admin" || r === "hr" || r === "analyst");
  const rows = kitCandidates.map((c) => ({ c, s: stage(c, kit.sheets, kit.decisions) }));

  // How many people got through each step.
  const funnel = [
    { step: "Applied", n: rows.length },
    { step: "Met the qualifications", n: rows.filter((r) => r.c.qualification === "met").length },
    { step: "Passed the work sample", n: rows.filter((r) => r.s.ws?.status === "final" && r.s.ws.pass).length },
    { step: "Passed the teach-back", n: rows.filter((r) => r.s.tb?.pass).length },
    { step: "Advanced by the hiring manager", n: rows.filter((r) => r.s.decision?.choice === "advance").length },
  ];

  // Fairness: work sample pass rates by optional self-reported group, among everyone who was scored.
  const scored = rows.filter((r) => r.s.ws?.status === "final" && r.c.group);
  const groups = [...new Set(scored.map((r) => r.c.group!))].map((g) => {
    const inGroup = scored.filter((r) => r.c.group === g);
    return { group: g, total: inGroup.length, passed: inGroup.filter((r) => r.s.ws?.status === "final" && r.s.ws.pass).length };
  });
  const fair = fourFifths(groups);
  const agree = agreement(packetDemo.workSample.rubric, kit.sheets);

  return (
    <div className="decisions">
      <header className="kit-intro">
        <h1 className="decisions-title">Decisions &amp; fairness</h1>
        <p>
          Three questions for the end of a hiring round: who was decided and why, how many people got through each step, and whether
          the test treated every group fairly.
        </p>
      </header>

      {/* 1. Decisions */}
      <section className="decisions-section">
        <h2>1. Decisions and reasons</h2>
        <p className="kit-hint">The hiring manager records every decision with a reason, in My tasks. A person decides; the scores inform.</p>
        <div className="packet-rubric-wrap">
          <table className="packet-table kit-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Scores</th>
                <th>Decision</th>
                <th>Reason</th>
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
                  <td>
                    {s.ws?.status === "final" ? `Work sample ${s.ws.average.toFixed(1)}` : "Work sample: not final"}
                    {s.tb && ` · Teach-back ${s.tb.average.toFixed(1)}`}
                    {s.iv && ` · Interview ${s.iv.average.toFixed(1)}`}
                  </td>
                  <td>
                    {s.decision ? (
                      <span className="kit-pill kit-pill-ok">{s.decision.choice[0]!.toUpperCase() + s.decision.choice.slice(1)}</span>
                    ) : s.tone === "stop" ? (
                      <span className="kit-pill kit-pill-stop">Stopped by the pass rule</span>
                    ) : (
                      <span className="kit-pill kit-pill-wait">
                        <Clock className="inline size-3" /> {s.label}
                      </span>
                    )}
                  </td>
                  <td>
                    {s.decision ? (
                      <>
                        “{s.decision.reason}”
                        <br />
                        <small>
                          {nameOf(s.decision.by)} · {fmt(s.decision.at)}
                        </small>
                      </>
                    ) : s.tone === "stop" ? (
                      <small>{s.label.replace("Stopped: ", "").replace(/^./, (x) => x.toUpperCase())}. HR can review.</small>
                    ) : (
                      <small>—</small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Funnel */}
      <section className="decisions-section">
        <h2>2. How many got through each step</h2>
        <ol className="decisions-funnel">
          {funnel.map((f) => (
            <li key={f.step}>
              <span className="decisions-funnel-bar" style={{ width: `${Math.max(6, (f.n / funnel[0]!.n) * 100)}%` }} />
              <strong>{f.n}</strong> {f.step}
            </li>
          ))}
        </ol>
      </section>

      {/* 3. Fairness */}
      <section className="decisions-section">
        <h2>3. Fairness check</h2>
        <p className="kit-hint">
          Compares work sample pass rates across groups candidates chose to report (optional, never shown to raters or hiring managers).
          If any group passes at less than 80% of the rate of the highest group, the exercise and scoring guide go back to the experts
          for review. This is the four-fifths rule. It never changes anyone's score.
        </p>
        {!canSeeGroups ? (
          <p className="kit-locked">
            <Lock className="size-4" /> Only HR and analysts can see group results.
          </p>
        ) : (
          <>
            <div className="packet-rubric-wrap">
              <table className="packet-table kit-table">
                <thead>
                  <tr>
                    <th>Group (fictional)</th>
                    <th>Scored</th>
                    <th>Passed</th>
                    <th>Pass rate</th>
                    <th>Compared with highest</th>
                  </tr>
                </thead>
                <tbody>
                  {fair.rows.map((g) => (
                    <tr key={g.group}>
                      <td>{g.group}</td>
                      <td>{g.total}</td>
                      <td>{g.passed}</td>
                      <td>{pct(g.rate)}</td>
                      <td>
                        {pct(g.ratio)} {g.flagged && !fair.tooSmall ? <span className="kit-pill kit-pill-warn">Under 80%</span> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {fair.tooSmall ? (
              <p className="packet-callout">
                <strong>Too few candidates to judge.</strong> With fewer than {MIN_GROUP_SIZE} people in a group, a single candidate swings the
                rate a lot, so treat this as a preview of how the check works. It becomes meaningful as more hiring rounds add up.
              </p>
            ) : fair.flagged ? (
              <p className="packet-callout packet-callout-warn">
                <AlertTriangle className="inline size-4" /> One group passes at under 80% of the highest rate. Send the exercise and scoring
                guide to the experts for review before the next round.
              </p>
            ) : (
              <p className="kit-locked">
                <CheckCircle2 className="size-4" /> Every group passes at 80% or more of the highest rate.
              </p>
            )}
          </>
        )}
      </section>

      {/* 4. Scoring quality */}
      <section className="decisions-section">
        <h2>4. Were the raters consistent?</h2>
        <p className="kit-hint">
          {agree
            ? `${pct(agree.rate)} of paired scores landed within one point (target ${pct(AGREEMENT_TARGET)}). ${agree.onTarget ? "The scoring guide is working." : "Recalibrate raters before the next round."}`
            : "Agreement appears once two raters have scored the same response."}
        </p>
      </section>

      {/* 5. Records and next */}
      <section className="decisions-section">
        <h2>5. Records</h2>
        <p className="kit-hint">
          Every score, note, change and decision is kept for 3 years. HR can export everything from the hiring round overview.
        </p>
        <Button asChild variant="outline">
          <Link to="/kit">Open the hiring round overview</Link>
        </Button>
        <p className="kit-hint decisions-later">
          Coming later: about 90 days after someone starts, their manager rates their job performance on the same day-one skills. Over
          time that shows whether work sample scores predict success on the job.
        </p>
      </section>
    </div>
  );
}
