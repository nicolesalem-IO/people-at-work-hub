import { Link, Outlet } from "@tanstack/react-router";
import { ClipboardList, FileText, LayoutDashboard, Library, UserRound } from "lucide-react";

const nav = [
  { to: "/", label: "Project dashboard", icon: LayoutDashboard },
  { to: "/evidence", label: "Evidence library", icon: Library },
  { to: "/contribute", label: "Contributor form", icon: UserRound },
  { to: "/package", label: "Hiring package", icon: FileText },
] as const;

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0">
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="grid size-8 place-items-center rounded-md bg-sidebar-primary font-display text-sm font-extrabold text-sidebar-primary-foreground">IO</span>
          <span className="font-display text-lg font-bold text-sidebar-accent-foreground">I-O Workspace</span>
        </div>
        <nav aria-label="Primary" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className="flex items-center gap-3 whitespace-nowrap rounded-md border-l-4 border-transparent px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-sidebar-ring data-[status=active]:border-brand-pink data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mx-5 mt-4 hidden rounded-md border border-sidebar-border p-3 text-xs md:block">
          <ClipboardList className="mb-1 size-4 text-brand-yellow" aria-hidden="true" />
          Demo data is fictional. Generated materials stay labeled as drafts until reviewed.
        </div>
      </aside>
      <main className="flex-1 bg-background">
        <div className="brand-rule rounded-none" />
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
