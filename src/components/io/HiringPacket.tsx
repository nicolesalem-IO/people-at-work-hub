import { CandidateBrief } from "@/components/io/CandidateBrief";
import { CRITICAL_FLOOR, PASS_AVERAGE, SCORE_LABELS, type PacketData, type RubricLine } from "@/lib/packet";

const fmtDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

function SectionHead({ n, kicker, title, children }: { n: number; kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="packet-section-head">
      <span className="packet-section-number" aria-hidden="true">
        {String(n).padStart(2, "0")}
      </span>
      <div>
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
        {children && <p className="packet-lead">{children}</p>}
      </div>
    </header>
  );
}

function Rubric({ lines, caption }: { lines: RubricLine[]; caption: string }) {
  return (
    <div className="packet-rubric-wrap">
      <table className="packet-rubric">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Rubric line</th>
            {SCORE_LABELS.map((label, i) => (
              <th scope="col" key={label} className={i === 2 ? "packet-standard" : undefined}>
                <span className="packet-score">{i + 1}</span>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.id}>
              <th scope="row">
                {l.name}
                {l.critical && <span className="packet-critical">Critical</span>}
                {l.part && <span className="packet-part">{l.part}</span>}
              </th>
              {l.anchors.map((a, i) => (
                <td key={i} className={i === 2 ? "packet-standard" : undefined}>
                  {a}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScoreSheet({ title, rows, note }: { title: string; rows: { id: string; name: string; critical?: boolean }[]; note: string }) {
  return (
    <div className="packet-sheet">
      <div className="packet-sheet-head">
        <h4>{title}</h4>
        <div className="packet-fields">
          <span>Candidate ID ________</span>
          <span>Rater ________</span>
          <span>Date ________</span>
        </div>
      </div>
      <table>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <th scope="row">
                {r.name}
                {r.critical && <span className="packet-critical">Critical</span>}
              </th>
              <td className="packet-boxes" aria-label="Circle one score from 1 to 5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={s === 3 ? "packet-box packet-box-standard" : "packet-box"}>
                    {s}
                  </span>
                ))}
              </td>
              <td className="packet-note-line">Evidence: </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="packet-small">{note}</p>
    </div>
  );
}

export function HiringPacket({ data: p }: { data: PacketData }) {
  const ws = p.workSample;
  const tb = p.teachBack;
  const iv = p.interview;
  const passText = `Average ${PASS_AVERAGE.toFixed(1)} or higher, and no critical line below ${CRITICAL_FLOOR}`;
  const contents = [
    "Why this test",
    "The skills assessment",
    "Before you rate",
    "Teach-back guide",
    "Interview guide",
    "Decision record",
  ];

  return (
    <article className="packet" aria-label={`Hiring team packet: ${p.role}`}>
      {/* Cover */}
      <section className="packet-cover packet-page">
        <div className="packet-cover-top">
          <p className="eyebrow">Hiring team packet{p.fictional ? " · fictional sample" : ""}</p>
          <p className="packet-confidential">Confidential · hiring team only</p>
        </div>
        <h1>{p.role}</h1>
        <p className="packet-cover-meta">
          {p.organization} · O*NET {p.onetCode} · {fmtDate(p.date)}
        </p>
        <dl className="packet-glance">
          <div>
            <dt>Skills assessment</dt>
            <dd>{ws.format === "take_home" ? "Take-home" : "Timed"}</dd>
            <p>{ws.time}, due within {ws.window.replace(" from your invitation", "")}</p>
          </div>
          <div>
            <dt>Teach-back</dt>
            <dd>{tb.minutes} min</dd>
            <p>Candidates who pass the skills assessment</p>
          </div>
          <div>
            <dt>Interview</dt>
            <dd>{iv.minutes} min</dd>
            <p>Right after the teach-back</p>
          </div>
          <div className="packet-glance-rule">
            <dt>Pass rule</dt>
            <dd>{PASS_AVERAGE.toFixed(1)}+</dd>
            <p>No critical line below {CRITICAL_FLOOR}. A person makes every final decision.</p>
          </div>
        </dl>
        <ol className="packet-contents">
          {contents.map((c, i) => (
            <li key={c}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {c}
            </li>
          ))}
        </ol>
      </section>

      {/* 1. Why this test */}
      <section className="packet-page">
        <SectionHead n={1} kicker="The logic chain" title="Why this test">
          Every part of this packet traces back to a job task and a skill experts said is needed on day one. If a step
          isn't in this table, it isn't in the test.
        </SectionHead>
        <ol className="packet-chain" aria-label="Logic chain">
          {["Job task", "Day-one skill", "Assessment", "Scoring line", "Two blind scores", "Decision"].map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <table className="packet-table">
          <thead>
            <tr>
              <th scope="col">Job task (O*NET)</th>
              <th scope="col">Day-one skill</th>
              <th scope="col">Tested in</th>
              <th scope="col">Scored on</th>
            </tr>
          </thead>
          <tbody>
            {p.chain.map((c) => (
              <tr key={c.testedIn + c.task}>
                <td>{c.task}</td>
                <td>{c.skill}</td>
                <td>
                  <strong>{c.testedIn}</strong>
                </td>
                <td>{c.lines}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="packet-callout">
          <h4>Not tested, and why</h4>
          <ul>
            {p.notTested.map((n) => (
              <li key={n.skill}>
                <strong>{n.skill}.</strong> {n.reason}
              </li>
            ))}
          </ul>
        </div>
        {p.aptitude.length > 0 && (
          <>
            <h3 className="packet-subhead">Aptitude tests</h3>
            <p className="packet-small">
              Aptitude tests, such as numerical, verbal, logical or coding tests, are added when the job analysis shows the ability is
              important and needed on day one, and the skills assessment doesn't already measure it.
            </p>
            <table className="packet-table">
              <thead>
                <tr>
                  <th scope="col">Test</th>
                  <th scope="col">Decision</th>
                  <th scope="col">Why</th>
                </tr>
              </thead>
              <tbody>
                {p.aptitude.map((m) => (
                  <tr key={m.name}>
                    <td>
                      <strong>{m.name}</strong>
                      {m.decision === "included" && m.items ? (
                        <>
                          <br />
                          <small>
                            {m.items} questions · {m.minutes} min
                          </small>
                        </>
                      ) : null}
                    </td>
                    <td>{m.decision === "included" ? "Included" : "Not included"}</td>
                    <td>{m.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      {/* 2. Skills assessment */}
      <section className="packet-page">
        <SectionHead n={2} kicker={`${ws.format === "take_home" ? "Take-home" : "Timed"} · ${ws.time.toLowerCase()}`} title="The skills assessment">
          Tests <strong>{ws.skill}</strong>, from the job tasks “{ws.task.toLowerCase()}”. Every numbered item below has a scoring
          line, so candidates know exactly what's being judged.
        </SectionHead>
        <CandidateBrief ws={ws} />
        <Rubric lines={ws.rubric} caption="Score each line from 1 to 5. Read the 3 column first: it's the day-one standard." />
        <ScoreSheet
          title="Skills assessment score sheet"
          rows={ws.rubric}
          note={`Score alone, before seeing the other rater's sheet. Pass: ${passText.toLowerCase()}.`}
        />
      </section>

      {/* 3. Before you rate */}
      <section className="packet-page">
        <SectionHead n={3} kicker="For every rater" title="Before you rate">
          The rubric uses behaviorally anchored rating scales: you match the work to a written description, not a gut
          number. These five steps keep scores consistent across raters.
        </SectionHead>
        <ol className="packet-steps">
          <li>
            <h4>Calibrate first</h4>
            <p>
              Score the three benchmark responses (weak, day-one, strong). You're ready when every line lands within 1
              point of the expert score.
            </p>
          </li>
          <li>
            <h4>Score blind</h4>
            <p>You'll see a candidate ID, never a name. Don't search for or discuss the candidate before scoring.</p>
          </li>
          <li>
            <h4>Score alone</h4>
            <p>Both raters finish their sheets before comparing. Write the evidence for each score in a few words.</p>
          </li>
          <li>
            <h4>Settle gaps by rule</h4>
            <p>
              Within 1 point: average the two scores. More than 1 point apart: a third calibrated rater scores it, and
              the two closest scores are averaged.
            </p>
          </li>
          <li>
            <h4>Watch agreement</h4>
            <p>If fewer than 80% of paired scores land within 1 point, recalibrate before scoring more candidates.</p>
          </li>
        </ol>
      </section>

      {/* 4. Teach-back */}
      <section className="packet-page">
        <SectionHead n={4} kicker={`${tb.minutes} minutes · finalists, live or video`} title="Teach-back guide">
          Tests <strong>{tb.skill}</strong>, from the job task “{tb.task.toLowerCase()}”.
        </SectionHead>
        <div className="packet-runsheet">
          <div>
            <span>Before</span>
            <p>{tb.setup} Both of you have the candidate's work sample in front of you.</p>
          </div>
          <div>
            <span>{tb.teachMinutes} min</span>
            <p>The candidate teaches. Stay in role and don't help.</p>
          </div>
          <div>
            <span>About halfway</span>
            <p>
              The rater reads, word for word: <strong>{tb.confusedLine}</strong>
            </p>
          </div>
          <div>
            <span>After</span>
            <p>Thank the candidate, move into the interview, then score the teach-back alone.</p>
          </div>
        </div>
        <Rubric lines={tb.rubric} caption="Teach-back rubric" />
        <ScoreSheet title="Teach-back score sheet" rows={tb.rubric} note={`Same pass rule: ${passText.toLowerCase()}.`} />
      </section>

      {/* 5. Interview */}
      <section className="packet-page">
        <SectionHead n={5} kicker={`${iv.minutes} minutes · right after the teach-back`} title="Interview guide">
          Same {iv.questions.length} questions, same order, for every finalist. About{" "}
          {Math.round(iv.minutes / iv.questions.length)} minutes each. Rate each answer alone before you compare notes.
        </SectionHead>
        <blockquote className="packet-script">
          <span>Open with</span>
          {iv.opening}
        </blockquote>
        <div className="packet-questions">
          {iv.questions.map((q) => (
            <div className="packet-question" key={q.id}>
              <div className="packet-question-head">
                <span className="packet-question-number">{q.id}</span>
                <div>
                  <p className="packet-question-text">{q.question}</p>
                  <p className="packet-small">
                    If needed: {q.followUp} · Measures <strong>{q.measures}</strong>
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
        <div className="packet-callout packet-callout-warn">
          <h4>Don't ask about</h4>
          <p>{iv.dontAsk}</p>
        </div>
        <ScoreSheet
          title="Interview score sheet"
          rows={iv.questions.map((q) => ({ id: q.id, name: `${q.id}. ${q.measures}` }))}
          note="No cutoff: the interview gives the hiring manager evidence the work sample can't show."
        />
      </section>

      {/* 6. Decision */}
      <section className="packet-page">
        <SectionHead n={6} kicker="Hiring manager" title="Decision record">
          Scores stay on the 1 to 5 scale, where 3 means meets the day-one standard. The rule screens; a person
          decides.
        </SectionHead>
        <table className="packet-table packet-decision">
          <thead>
            <tr>
              <th scope="col">Step</th>
              <th scope="col">Rule</th>
              <th scope="col">Average</th>
              <th scope="col">Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Qualification check</td>
              <td>A "No" goes to HR review, never an automatic rejection</td>
              <td className="packet-blank">n/a</td>
              <td className="packet-blank">☐ Met ☐ HR review</td>
            </tr>
            <tr>
              <td>Work sample</td>
              <td>{passText}</td>
              <td className="packet-blank" />
              <td className="packet-blank">☐ Pass ☐ Stop</td>
            </tr>
            <tr>
              <td>Teach-back</td>
              <td>{passText}</td>
              <td className="packet-blank" />
              <td className="packet-blank">☐ Pass ☐ Stop</td>
            </tr>
            <tr>
              <td>Interview</td>
              <td>Written anchors, no cutoff</td>
              <td className="packet-blank" />
              <td className="packet-blank">For the manager's judgment</td>
            </tr>
          </tbody>
        </table>
        <div className="packet-signoff">
          <p>
            <strong>Decision:</strong> ☐ Advance &nbsp; ☐ Decline &nbsp; ☐ Hold
          </p>
          <p className="packet-write">Reason, tied to the evidence above:</p>
          <div className="packet-write-lines" aria-hidden="true">
            <span />
            <span />
          </div>
          <div className="packet-fields">
            <span>Hiring manager ____________________</span>
            <span>Date ________</span>
          </div>
        </div>
        <p className="packet-small">
          After each hiring round, the fairness check compares pass rates across optional self-reported groups (the
          four-fifths rule). A flag sends the exercise and anchors back to the experts; it never changes anyone's
          score.
        </p>
      </section>
    </article>
  );
}
