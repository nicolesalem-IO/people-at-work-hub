import { createFileRoute } from "@tanstack/react-router";
import { HiringKit } from "@/components/io/HiringKit";
import { KitProvider } from "@/components/io/KitStore";

export const Route = createFileRoute("/kit")({
  head: () => ({
    meta: [
      { title: "Hiring kit — Thebe IO" },
      { name: "description", content: "Each person on the hiring team gets the part of the test they run, with scores and notes saved." },
    ],
  }),
  component: () => (
    <KitProvider>
      <HiringKit />
    </KitProvider>
  ),
});
