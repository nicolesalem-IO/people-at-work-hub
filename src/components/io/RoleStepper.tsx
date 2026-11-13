import { Link, useLocation } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useAssessment } from "./AssessmentProvider";
import { analysisGaps } from "@/lib/assessment-rules";

// The whole flow in six screens. Old pages redirect into these.
export function RoleStepper() {
  const { battery: a } = useAssessment();
  const path = useLocation({ select: (l) => l.pathname });
  const analysisReady = analysisGaps(a).length === 0;
  const steps = [
    { to: "/roles", name: "Role", done: Boolean(a.title), active: ["/roles", "/onboarding"] },
    { to: "/job", name: "Job analysis", done: analysisReady, active: ["/job", "/sme-welcome"] },
    { to: "/test", name: "Hiring test", done: a.status === "approved", active: ["/test"] },
    { to: "/results", name: "Candidates", done: false, active: ["/results"] },
    { to: "/kit", name: "Scoring", done: false, active: ["/kit"] },
    { to: "/validity", name: "Decisions & fairness", done: false, active: ["/validity"] },
  ] as const;
  return (
    <nav className="role-stepper" aria-label="Hiring steps">
      {steps.map((s, n) => {
        const here = (s.active as readonly string[]).includes(path);
        return (
          <Link key={s.to} to={s.to} className={`role-step ${here ? "is-current" : ""}`} aria-current={here ? "step" : undefined}>
            <span className="step-number">{s.done && !here ? <Check size={15} /> : n + 1}</span>
            <span>{s.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
