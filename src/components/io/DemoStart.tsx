import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useAdmin } from "./AdminProvider";

/** Where the demo starts: pick whose view to see. Everything here is fictional. */
const VIEWS = [
  { id: "nicole", who: "Nicole · I-O psychologist", title: "Build the hiring test", text: "Add the job description, match O*NET, run expert ratings, and approve the test plan." },
  { id: "priya", who: "Priya · Job expert", title: "Rate the job and approve the test", text: "Answer one question at a time about what the job needs on day one, then check the test." },
  { id: "maya", who: "Maya · HR", title: "Run the hire", text: "Add candidates, settle rater disagreements, and check pass rates for fairness." },
  { id: "lena", who: "Lena · Rater", title: "Score candidates", text: "Practice on sample answers first, then score anonymous work against written standards." },
  { id: "daniel", who: "Daniel · Hiring manager", title: "Interview and decide", text: "Run the live exercise and interview, then record each decision with a reason." },
] as const;

export function DemoStart() {
  const team = useAdmin();
  const navigate = useNavigate();
  return (
    <section className="demo-start">
      <header className="demo-start-hero">
        <p className="eyebrow text-pink-ink">Demo · fictional company, fictional candidates</p>
        <h1>
          See a hire from every seat<span className="title-period">.</span>
        </h1>
        <p>
          Northwind Health, a made-up hospital, is hiring two jobs: a Learning &amp; Development Specialist (being scored now) and a
          Registered Nurse (just starting). These are the same screens as the real product. Pick a person to see their work. You can switch
          people any time from the bar at the top, and nothing here leaves this browser.
        </p>
      </header>
      <div className="demo-start-grid">
        {VIEWS.map((v, n) => (
          <button
            key={v.id}
            type="button"
            className="demo-start-card"
            onClick={() => {
              team.setDemoId(v.id);
              void navigate({ to: "/demo/work" });
            }}
          >
            <span className="demo-start-number">{String(n + 1).padStart(2, "0")}</span>
            <span className="eyebrow">{v.who}</span>
            <strong>{v.title}</strong>
            <span className="demo-start-text">{v.text}</span>
            <span className="demo-start-go">
              Open <ArrowRight size={16} />
            </span>
          </button>
        ))}
      </div>
      <p className="demo-start-foot">
        Ready to use it for a real job? <Link to="/onboarding">Build a hiring test</Link> or{" "}
        <Link to="/try">try a quick test plan</Link> for any job title.
      </p>
    </section>
  );
}
