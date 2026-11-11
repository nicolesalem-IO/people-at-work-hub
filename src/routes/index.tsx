import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge } from "@/components/io/status";
import { role, stages } from "@/data/demo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project dashboard — I-O Workspace" },
      { name: "description", content: "Track role-analysis stages, evidence coverage and next actions." },
      { property: "og:title", content: "Project dashboard — I-O Workspace" },
      { property: "og:description", content: "Track role-analysis stages, evidence coverage and next actions." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <>
      <PageHeader
        eyebrow={role.org}
        title={role.title}
        actions={
          <Button asChild><Link to="/evidence">Resolve conflict <ArrowRight /></Link></Button>
        }
      >
        {role.locations} · Approver: {role.approver}
      </PageHeader>

      <section aria-labelledby="next" className="mb-10 rounded-lg border-l-4 border-brand-pink bg-pink-soft p-5">
        <h2 id="next" className="text-lg font-bold">Next action</h2>
        <p className="mt-1">Manager and incumbents disagree on refund authority. Review the evidence and record a resolution — the manager's version is not selected automatically.</p>
      </section>

      <h2 className="mb-4 text-xl font-bold">Workflow stages</h2>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stages.map((s) => (
          <li key={s.key} className="rounded-lg border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <span className="font-display text-sm font-bold text-muted-foreground">Stage {s.key}</span>
              <StatusBadge status={s.status} />
            </div>
            <h3 className="mt-2 text-lg font-bold">{s.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.next}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex items-center gap-3 rounded-lg border p-5 text-sm">
        <Users className="size-5" aria-hidden="true" />
        <p>4 contributors (3 incumbents, 1 manager). Small group: responses are not anonymous to the analyst.</p>
      </div>
    </>
  );
}
