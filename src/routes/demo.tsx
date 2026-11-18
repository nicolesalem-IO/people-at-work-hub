import { createFileRoute } from "@tanstack/react-router";
import { DemoStart } from "@/components/io/DemoStart";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo — Thebe IO" },
      { name: "description", content: "See a fictional hire from every seat: builder, HR, rater, hiring manager and job expert." },
      { property: "og:title", content: "Demo — Thebe IO" },
    ],
  }),
  component: DemoStart,
});
