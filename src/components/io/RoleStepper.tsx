import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { useAssessment } from "./AssessmentProvider";
import { analysisGaps } from "@/lib/assessment-rules";
import type { Assessment } from "@/lib/assessment-rules";

// One role, five steps, in order. A step unlocks when the one before it is done.
export const ROLE_PATHS = ["/job", "/test", "/results", "/kit", "/validity"] as const;

export function roleSteps(a: Assessment) {
  const analysisDone = analysisGaps(a).length === 0;
  const testApproved = a.status === "approved";
  return [
    { to: "/job", name: "Job analysis", done: analysisDone, locked: false, needs: "" },
    { to: "/test", name: "Hiring test", done: testApproved, locked: !analysisDone, needs: "Finish the job analysis first." },
    { to: "/results", name: "Candidates", done: false, locked: !testApproved, needs: "HR approves the hiring test first." },
    { to: "/kit", name: "Scoring", done: false, locked: !testApproved, needs: "HR approves the hiring test first." },
    { to: "/validity", name: "Decisions & fairness", done: false, locked: !testApproved, needs: "HR approves the hiring test first." },
  ] as const;
}

/** Where "Continue" on a role card should go: the first step that isn't done. */
export function nextStepFor(a: Assessment) {
  return roleSteps(a).find((s) => !s.done && !s.locked)?.to ?? "/job";
}

export function RoleStepper() {
  const { battery: a } = useAssessment();
  const path = useLocation({ select: (l) => l.pathname });
  const steps = roleSteps(a);
  return (
    <div className="role-bar">
      <div className="role-bar-head">
        <Link to="/roles" className="role-bar-back">
          <ArrowLeft className="size-4" /> All roles
        </Link>
        <p>
          <strong>{a.title || "Untitled role"}</strong>
          {a.organization && <span> · {a.organization}</span>}
          {a.fictional && <span> · fictional example</span>}
        </p>
      </div>
      <nav className="role-stepper" aria-label="Steps for this role">
        {steps.map((s, n) => {
          const here = path === s.to;
          const inner = (
            <>
              <span className="step-number">{s.locked ? <Lock size={13} /> : s.done && !here ? <Check size={15} /> : n + 1}</span>
              <span>{s.name}</span>
            </>
          );
          return s.locked ? (
            <span key={s.to} className="role-step is-locked" title={s.needs} aria-disabled="true">
              {inner}
            </span>
          ) : (
            <Link key={s.to} to={s.to} className={`role-step ${here ? "is-current" : ""}`} aria-current={here ? "step" : undefined}>
              {inner}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/** Bottom of each step: what's next, or what has to happen first. */
export function NextStep() {
  const { battery: a } = useAssessment();
  const path = useLocation({ select: (l) => l.pathname });
  const steps = roleSteps(a);
  const i = steps.findIndex((s) => s.to === path);
  if (i < 0) return null;
  const here = steps[i]!;
  const next = steps[i + 1];
  return (
    <aside className="next-step" aria-label="Next step">
      {here.locked ? (
        <p>
          <Lock className="size-4" /> {here.needs}
        </p>
      ) : next ? (
        <>
          <p>
            {here.done ? <Check className="size-4" /> : null}
            {here.done ? `${here.name} is done.` : `When ${here.name.toLowerCase()} is done, move on.`}
          </p>
          {next.locked ? (
            <span className="next-step-locked">
              <Lock className="size-4" /> Next: {next.name}. {next.needs}
            </span>
          ) : (
            <Link to={next.to} className="next-step-link">
              Next: {next.name} <ArrowRight className="size-4" />
            </Link>
          )}
        </>
      ) : (
        <p>Last step. Decisions are recorded in each finalist's record, and HR can export everything.</p>
      )}
    </aside>
  );
}
