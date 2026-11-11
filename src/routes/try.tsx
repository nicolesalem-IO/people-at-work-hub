import { createFileRoute } from "@tanstack/react-router";
import { QuickPlan } from "@/components/io/QuickPlan";

export const Route = createFileRoute("/try")({
  head: () => ({
    meta: [
      { title: "See a test plan for any job — People at Work" },
      {
        name: "description",
        content:
          "Type a job title and get O*NET-based day-one skills, a draft test plan and sample questions traced to real job tasks.",
      },
      { property: "og:title", content: "See a test plan for any job — People at Work" },
      {
        property: "og:description",
        content:
          "Type a job title and get O*NET-based day-one skills, a draft test plan and sample questions traced to real job tasks.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QuickPlan,
});
