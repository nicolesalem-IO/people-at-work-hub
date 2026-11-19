import { createFileRoute, redirect } from "@tanstack/react-router";

// Moved: every job now follows one workflow under /jobs.
export const Route = createFileRoute("/test")({
  beforeLoad: () => {
    throw redirect({ to: "/jobs", statusCode: 301 });
  },
});
