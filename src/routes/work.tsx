import { createFileRoute } from "@tanstack/react-router";
import { MyWork } from "@/components/io/WorkflowPages";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "My work — Thebe IO" },
      { name: "description", content: "Your tasks on each job, in order." },
    ],
  }),
  component: MyWork,
});
