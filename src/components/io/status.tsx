import { AlertTriangle, CheckCircle2, CircleDashed, FileEdit, HelpCircle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type Status = "approved" | "draft" | "conflict" | "missing" | "pending" | "unconfigured";

const map: Record<Status, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  approved: { label: "Approved", icon: CheckCircle2, cls: "bg-success-soft text-success border-success/30" },
  draft: { label: "Draft — needs review", icon: FileEdit, cls: "bg-yellow-soft text-warning border-brand-yellow" },
  conflict: { label: "Unresolved conflict", icon: AlertTriangle, cls: "bg-pink-soft text-pink-ink border-brand-pink" },
  missing: { label: "Insufficient evidence", icon: HelpCircle, cls: "bg-muted text-muted-foreground border-input border-dashed" },
  pending: { label: "Awaiting input", icon: CircleDashed, cls: "bg-background text-foreground border-input" },
  unconfigured: { label: "Configuration required", icon: ShieldAlert, cls: "bg-muted text-muted-foreground border-input" },
};

export function StatusBadge({ status, label, className }: { status: Status; label?: string; className?: string }) {
  const s = map[status];
  const Icon = s.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold whitespace-nowrap", s.cls, className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {label ?? s.label}
    </span>
  );
}

export function PageHeader({ eyebrow, title, children, actions }: { eyebrow: string; title: string; children?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b pb-6">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-extrabold md:text-6xl">{title}</h1>
        {children && <p className="mt-4 text-lg text-muted-foreground">{children}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
