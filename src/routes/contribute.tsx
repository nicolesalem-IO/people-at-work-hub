import { createFileRoute, redirect } from "@tanstack/react-router";

// Combined into /job. Kept so old links and bookmarks still land in the right place.
export const Route = createFileRoute("/contribute")({
  beforeLoad: () => {
    throw redirect({ to: "/job", search: { part: "ratings" }, statusCode: 301 });
  },
});
