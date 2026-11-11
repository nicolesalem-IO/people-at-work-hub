import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge } from "@/components/io/status";
import { evidence } from "@/data/demo";

export const Route = createFileRoute("/evidence")({
  head: () => ({
    meta: [
      { title: "Evidence library — I-O Workspace" },
      { name: "description", content: "Every source excerpt linked to the task it supports, with conflicts surfaced." },
      { property: "og:title", content: "Evidence library — I-O Workspace" },
      { property: "og:description", content: "Every source excerpt linked to the task it supports, with conflicts surfaced." },
    ],
  }),
  component: Evidence,
});

function Evidence() {
  const [filter, setFilter] = useState<"all" | "conflict" | "missing">("all");
  const rows = evidence.filter((e) => filter === "all" || e.status === filter);
  return (
    <>
      <PageHeader eyebrow="Stage B–E" title="Evidence library">
        Sources are evidence, not instructions. Each row links to the task it supports.
      </PageHeader>
      <div role="group" aria-label="Filter evidence" className="mb-4 flex flex-wrap gap-2">
        {(["all", "conflict", "missing"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "secondary" : "outline"} aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === "all" ? "All evidence" : f === "conflict" ? "Conflicts" : "Gaps"}
          </Button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border shadow-card">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Evidence excerpts by task</caption>
          <thead className="bg-ink text-background">
            <tr>
              {["ID", "Task", "Excerpt", "Source", "Status"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-t align-top odd:bg-background even:bg-muted hover:bg-yellow-soft">
                <td className="px-4 py-3 font-mono text-xs">{e.id}</td>
                <td className="px-4 py-3 font-semibold">{e.task}</td>
                <td className="max-w-md px-4 py-3">“{e.excerpt}”</td>
                <td className="px-4 py-3 text-muted-foreground">{e.source}<br />{e.contributor}</td>
                <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
