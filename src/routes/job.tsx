import { createFileRoute, Link } from "@tanstack/react-router";
import { AssessmentAnalysis } from "@/components/io/AssessmentAnalysis";

const parts = [
  { id: "define", label: "1. The role" },
  { id: "profile", label: "2. O*NET job profile" },
  { id: "ratings", label: "3. Expert ratings" },
] as const;
type Part = (typeof parts)[number]["id"];

export const Route = createFileRoute("/job")({
  validateSearch: (s: Record<string, unknown>): { part: Part } => ({
    part: parts.some((p) => p.id === s["part"]) ? (s["part"] as Part) : "define",
  }),
  head: () => ({
    meta: [
      { title: "Job analysis — Thebe IO" },
      { name: "description", content: "Define the role, start from O*NET, and have your experts rate what's needed on day one." },
    ],
  }),
  component: JobAnalysis,
});

function JobAnalysis() {
  const { part } = Route.useSearch();
  return (
    <>
      <nav className="kit-tabs" aria-label="Job analysis steps">
        {parts.map((p) => (
          <Link key={p.id} to="/job" search={{ part: p.id }} className={part === p.id ? "is-on" : ""} aria-current={part === p.id ? "page" : undefined}>
            {p.label}
          </Link>
        ))}
      </nav>
      {part === "define" && <AssessmentAnalysis key="define" view="define" />}
      {part === "profile" && <AssessmentAnalysis key="profile" view="benchmark" evidence />}
      {part === "ratings" && <AssessmentAnalysis key="ratings" />}
    </>
  );
}
