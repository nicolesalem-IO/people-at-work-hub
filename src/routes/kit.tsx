import { createFileRoute, redirect } from "@tanstack/react-router";

// Moved: every job now follows one workflow under /work.
export const Route = createFileRoute("/kit")({
  beforeLoad: () => {
    throw redirect({ to: "/work", statusCode: 301 });
  },
});
