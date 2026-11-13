import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssessmentReview } from "@/components/io/AssessmentReview";
import { HiringPacket } from "@/components/io/HiringPacket";
import { packetDemo } from "@/data/packet-demo";

const parts = [
  { id: "packet", label: "1. The test (hiring team packet)" },
  { id: "approval", label: "2. HR approval" },
] as const;
type Part = (typeof parts)[number]["id"];

export const Route = createFileRoute("/test")({
  validateSearch: (s: Record<string, unknown>): { part: Part } => ({
    part: parts.some((p) => p.id === s["part"]) ? (s["part"] as Part) : "packet",
  }),
  head: () => ({
    meta: [
      { title: "Hiring test — I-O Workspace" },
      { name: "description", content: "One work sample, a teach-back and a structured interview, each with written scoring guides." },
    ],
  }),
  component: HiringTest,
});

function HiringTest() {
  const { part } = Route.useSearch();
  return (
    <>
      <nav className="kit-tabs packet-toolbar-tabs" aria-label="Hiring test steps">
        {parts.map((p) => (
          <Link key={p.id} to="/test" search={{ part: p.id }} className={part === p.id ? "is-on" : ""} aria-current={part === p.id ? "page" : undefined}>
            {p.label}
          </Link>
        ))}
      </nav>
      {part === "packet" && (
        <>
          <div className="packet-toolbar">
            <p className="text-muted-foreground">
              Sample packet for a fictional role. Experts approve every exercise and scoring guide before use.
            </p>
            <Button onClick={() => window.print()}>
              <Printer /> Print or save as PDF
            </Button>
          </div>
          <HiringPacket data={packetDemo} />
        </>
      )}
      {part === "approval" && <AssessmentReview />}
    </>
  );
}
