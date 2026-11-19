import { createFileRoute } from "@tanstack/react-router";
import { JobsList } from "@/components/io/WorkflowPages";

export const Route = createFileRoute("/jobs/")({
  head: () => ({
    meta: [
      { title: "Jobs — Thebe IO" },
      { name: "description", content: "Every job you're hiring for and where it is in the workflow." },
    ],
  }),
  component: JobsList,
});
