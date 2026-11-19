import type { PacketData } from "@/lib/packet";

// The skills assessment exactly as the candidate sees it: what to do, what to turn in, how and by when.
const LABELS = {
  file: { turnIn: "Turn in", length: "Length", how: "How to submit", a: "File", b: "Name it", c: "Send it" },
  timed: { turnIn: "Answers", length: "Sitting", how: "How to take it", a: "Answers", b: "Files", c: "Start" },
  inPerson: { turnIn: "Turn in", length: "Scoring", how: "On the day", a: "Format", b: "Bring", c: "Where" },
  live: { turnIn: "Turn in", length: "Scoring", how: "On the day", a: "Format", b: "Your notes", c: "Where" },
};

export function CandidateBrief({ ws, compact = false }: { ws: PacketData["workSample"]; compact?: boolean }) {
  const L = ws.format === "on_site" ? LABELS.inPerson : ws.format === "live" ? LABELS.live : ws.format === "timed" ? LABELS.timed : LABELS.file;
  return (
    <div className={`brief${compact ? " brief-compact" : ""}`}>
      <p className="packet-brief-label">What the candidate sees</p>
      <h3 className="brief-title">{ws.title}</h3>
      <dl className="brief-facts">
        <div>
          <dt>Time</dt>
          <dd>{ws.time}</dd>
        </div>
        <div>
          <dt>Due</dt>
          <dd>{ws.window}</dd>
        </div>
        <div>
          <dt>{L.turnIn}</dt>
          <dd>{ws.submission.format}</dd>
        </div>
        <div>
          <dt>{L.length}</dt>
          <dd>{ws.submission.maxLength}</dd>
        </div>
      </dl>
      <h4>Before you start</h4>
      <ul className="brief-rules">
        {ws.instructions.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <h4>Scenario</h4>
      <p className="brief-scenario">{ws.scenario}</p>
      {ws.parts.map((pt) => (
        <section key={pt.title} className="brief-part">
          <h4>{pt.title}</h4>
          {pt.intro && <p className="brief-intro">{pt.intro}</p>}
          <ol>
            {pt.items.map((it) => (
              <li key={it.label}>
                <strong>{it.label}.</strong> {it.detail}
                {it.examples && <span className="brief-eg"> ({it.examples})</span>}
              </li>
            ))}
          </ol>
        </section>
      ))}
      <div className="brief-submit">
        <h4>{L.how}</h4>
        <ul>
          <li>
            <strong>{L.a}:</strong> {ws.format === "take_home" ? `${ws.submission.format}, ${ws.submission.maxLength.charAt(0).toLowerCase() + ws.submission.maxLength.slice(1)}` : ws.submission.format}
          </li>
          <li>
            <strong>{L.b}:</strong> {ws.submission.fileName}
          </li>
          <li>
            <strong>{L.c}:</strong> {ws.submission.how}
          </li>
        </ul>
      </div>
    </div>
  );
}
