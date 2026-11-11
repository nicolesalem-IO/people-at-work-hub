import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge } from "@/components/io/status";

export const Route = createFileRoute("/package")({
  head: () => ({
    meta: [
      { title: "Hiring package editor — I-O Workspace" },
      { name: "description", content: "Draft job posting, work sample and interview guide, linked to approved evidence." },
      { property: "og:title", content: "Hiring package editor — I-O Workspace" },
      { property: "og:description", content: "Draft job posting, work sample and interview guide, linked to approved evidence." },
    ],
  }),
  component: PackageEditor,
});

function PackageEditor() {
  return (
    <>
      <PageHeader eyebrow="Stage G" title="Hiring package" actions={<><Button variant="outline">Version history</Button><Button disabled><Lock /> Submit for HR approval</Button></>}>
        Generation unlocks once a role-analysis version is approved.
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <article className="rounded-lg border bg-card p-6 shadow-card md:p-10">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <StatusBadge status="draft" />
            <StatusBadge status="conflict" label="1 requirement blocked" />
          </div>
          <label htmlFor="doc" className="eyebrow">Job posting — v0.1 draft</label>
          <div id="doc" contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true"
            className="prose mt-3 max-w-[68ch] space-y-4 rounded-md p-2 text-base leading-7 focus-visible:bg-muted">
            <h2 className="text-2xl font-bold">Customer Support Specialist</h2>
            <p>Help customers across chat and email, triage inbound tickets across three queues, and escalate complex cases.</p>
            <p className="rounded-md border-l-4 border-brand-pink bg-pink-soft p-3">
              <strong>Blocked:</strong> refund authority wording is pending conflict resolution (EV-01 to EV-04).
            </p>
          </div>
        </article>
        <aside aria-label="Traceability" className="space-y-3 text-sm">
          <h2 className="text-lg font-bold">Sources for this draft</h2>
          {["EV-05 Triage inbound tickets", "EV-04 SOP-14 Refund policy"].map((s) => (
            <div key={s} className="rounded-md border p-3">{s}</div>
          ))}
          <StatusBadge status="unconfigured" label="Job evaluation: configuration required" />
        </aside>
      </div>
    </>
  );
}
