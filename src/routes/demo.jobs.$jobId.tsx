import { createFileRoute } from "@tanstack/react-router";
import { JobPage } from "@/components/io/WorkflowPages";
import { STEPS, type StepId } from "@/lib/workflow";

export const Route = createFileRoute("/demo/jobs/$jobId")({
  validateSearch: (s: Record<string, unknown>): { step?: StepId } =>
    STEPS.some((x) => x.id === s["step"]) ? { step: s["step"] as StepId } : {},
  head: () => ({
    meta: [
      { title: "Job — Thebe IO" },
      { name: "description", content: "One job's hiring workflow." },
    ],
  }),
  component: function Page() {
    const { jobId } = Route.useParams();
    const { step } = Route.useSearch();
    return <JobPage jobId={jobId} step={step} />;
  },
});
