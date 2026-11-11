import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/io/status";

export const Route = createFileRoute("/contribute")({
  head: () => ({
    meta: [
      { title: "Contributor form — I-O Workspace" },
      { name: "description", content: "A simple, independent form for employees and managers to describe their role." },
      { property: "og:title", content: "Contributor form — I-O Workspace" },
      { property: "og:description", content: "A simple, independent form for employees and managers to describe their role." },
    ],
  }),
  component: Contribute,
});

const field = "mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-base placeholder:text-muted-foreground focus-visible:border-ink";

function Contribute() {
  const [sent, setSent] = useState(false);
  return (
    <div className="max-w-2xl">
      <PageHeader eyebrow="Customer Support Specialist" title="Describe your work">
        Your answers are submitted independently. The analyst and approver can see raw responses.
      </PageHeader>
      {sent ? (
        <p role="status" className="flex items-center gap-2 rounded-lg border border-success/30 bg-success-soft p-4 font-semibold text-success">
          <CheckCircle2 className="size-5" aria-hidden="true" /> Submitted — thank you. (Demo only, not saved.)
        </p>
      ) : (
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <div>
            <label htmlFor="tasks" className="font-bold">What tasks take most of your time? <span className="text-pink-ink">(required)</span></label>
            <p id="tasks-hint" className="text-sm text-muted-foreground">One task per line, starting with a verb.</p>
            <textarea id="tasks" required aria-describedby="tasks-hint" rows={5} className={field} placeholder="Triage inbound chat tickets" />
          </div>
          <div>
            <label htmlFor="auth" className="font-bold">What decisions can you make without approval?</label>
            <textarea id="auth" rows={3} className={field} />
          </div>
          <fieldset>
            <legend className="font-bold">How often do you handle refunds?</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {["Daily", "Weekly", "Rarely", "Never"].map((o) => (
                <label key={o} className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-4 py-2.5 has-[:checked]:border-ink has-[:checked]:bg-yellow-soft has-[:checked]:font-bold">
                  <input type="radio" name="freq" value={o} className="accent-ink" /> {o}
                </label>
              ))}
            </div>
          </fieldset>
          <Button type="submit" size="lg">Submit my contribution</Button>
        </form>
      )}
    </div>
  );
}
