import { createFileRoute, redirect } from "@tanstack/react-router";

// Combined into /test. Kept so old links and bookmarks still land in the right place.
export const Route = createFileRoute("/review")({
  beforeLoad: () => {
    throw redirect({ to: "/test", search: { part: "approval" }, statusCode: 301 });
  },
});
