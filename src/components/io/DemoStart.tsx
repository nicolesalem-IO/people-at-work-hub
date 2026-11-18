import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useAdmin } from "./AdminProvider";
import { enterDemo } from "@/lib/demo-mode";

/** Where the demo starts: pick whose view to see. Everything here is fictional. */
const VIEWS = [
  {
    id: "nicole",
    who: "Nicole · I-O psychologist",
    title: "Build the hiring test",
    text: "Start from O*NET, get expert ratings, and turn them into a skills assessment, scoring guide and interview.",
    to: "/roles",
  },
  {
    id: "maya",
    who: "Maya · HR",
    title: "Run the hire",
    text: "Track every candidate, settle rater disagreements, and check pass rates for fairness.",
    to: "/kit",
  },
  {
    id: "lena",
    who: "Lena · Rater",
    title: "Score candidates",
    text: "Practice on sample answers first, then score anonymous work against written standards.",
    to: "/kit",
  },
  {
    id: "daniel",
    who: "Daniel · Hiring manager",
    title: "Interview and decide",
    text: "Run the structured interview, see the combined scores, and record the decision with a reason.",
    to: "/kit",
  },
  {
    id: "priya",
    who: "Priya · Job expert",
    title: "Rate the job",
    text: "Answer one question at a time about what the job needs on day one.",
    to: "/kit",
  },
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
          A made-up company is hiring a Learning &amp; Development Specialist. Pick a person to see what they do. You can
          switch people any time from the bar at the top, and nothing you do here is saved beyond this browser.
        </p>
      </header>
      <div className="demo-start-grid">
        {VIEWS.map((v, n) => (
          <button
            key={v.id}
            type="button"
            className="demo-start-card"
            onClick={() => {
              enterDemo();
              team.setDemoId(v.id);
              void navigate({ to: v.to });
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
