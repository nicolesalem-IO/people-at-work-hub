import { createFileRoute, redirect } from "@tanstack/react-router";

// Combined into /job. Kept so old links and bookmarks still land in the right place.
export const Route = createFileRoute("/benchmark")({
  beforeLoad: () => {
    throw redirect({ to: "/job", search: { part: "profile" }, statusCode: 301 });
  },
});
