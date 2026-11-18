import { createFileRoute, redirect } from "@tanstack/react-router";

// Combined into /job. Kept so old links and bookmarks still land in the right place.
export const Route = createFileRoute("/evidence")({
  beforeLoad: () => {
    throw redirect({ to: "/jobs", statusCode: 301 });
  },
});
