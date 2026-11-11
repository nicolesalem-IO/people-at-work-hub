import { Link, Outlet } from "@tanstack/react-router";

const nav = [
  { to: "/", label: "Job analysis" },
  { to: "/evidence", label: "Evidence" },
  { to: "/contribute", label: "Contribute" },
  { to: "/summarize", label: "Outputs" },
] as const;

export function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-1.5 bg-brand-yellow" />
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 md:px-10">
          <Link to="/" className="flex items-center gap-3 text-xl font-semibold tracking-tight">
            <span className="size-3 rounded-[3px] bg-brand-pink" aria-hidden="true" />
            I-O Workspace
          </Link>
          <nav aria-label="Primary" className="flex flex-wrap gap-x-8 gap-y-2">
            {nav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: true }}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-pink-ink"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-14">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-6xl border-t px-5 py-6 text-sm text-muted-foreground md:px-10">
        Demo data is fictional. Generated materials stay labeled as drafts until reviewed.
      </footer>
    </div>
  );
}
