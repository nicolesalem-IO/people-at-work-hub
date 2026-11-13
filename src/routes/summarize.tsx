import { createFileRoute, redirect } from "@tanstack/react-router";

// Combined into /roles. Kept so old links and bookmarks still land in the right place.
export const Route = createFileRoute("/summarize")({
  beforeLoad: () => {
    throw redirect({ to: "/roles", statusCode: 301 });
  },
});
