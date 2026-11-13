import { createFileRoute } from "@tanstack/react-router";
import { DecisionsFairness } from "@/components/io/DecisionsFairness";
import { KitProvider } from "@/components/io/KitStore";

export const Route = createFileRoute("/validity")({
  head: () => ({
    meta: [
      { title: "Decisions & fairness — Thebe IO" },
      { name: "description", content: "Decisions with reasons, pass rates at each step, and a fairness check across optional groups." },
    ],
  }),
  component: () => (
    <KitProvider>
      <DecisionsFairness />
    </KitProvider>
  ),
});
