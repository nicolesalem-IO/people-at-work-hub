import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ThebeMark } from "./ThebeMark";
import { useAssessment } from "./AssessmentProvider";
import { useAdmin, DemoProfileSelector, DemoTeamProvider } from "./AdminProvider";
import { WorkspaceProvider } from "./WorkspaceStore";

/** Three clearly separate places:
 *  - Visitors: Try it, How it works, See the demo, Sign in.
 *  - The product (signed in): My work, Jobs, Admin (admins only), How it works.
 *  - The demo (/demo/…): the same screens on a fictional company, with a yellow Demo bar and Exit demo. */
export function AppShell() {
  const path = useLocation({ select: (l) => l.pathname });
  const inDemo = path === "/demo" || path.startsWith("/demo/");
  return (
    <DemoTeamProvider active={inDemo}>
      <Shell inDemo={inDemo} path={path} />
    </DemoTeamProvider>
  );
}

function Shell({ inDemo, path }: { inDemo: boolean; path: string }) {
  const team = useAdmin(),
    query = useQueryClient(),
    navigate = useNavigate(),
    c = useAssessment();
  const candidate = path.startsWith("/candidate/") || path.startsWith("/take/");
  const [login, setLogin] = useState(false),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [brand, setBrand] = useState({ name: "Thebe IO", logo: "" });
  useEffect(() => {
    if (team.demo) {
      setBrand({ name: "Thebe IO", logo: "" });
      return;
    }
    void (async () => {
      const { data } = await supabase.from("org_settings").select("name,logo_path").maybeSingle();
      let logo = "";
      if (data?.logo_path) {
        const r = await supabase.storage.from("organization-logos").createSignedUrl(data.logo_path, 3600);
        logo = r.data?.signedUrl ?? "";
      }
      if (data) setBrand({ name: data.name, logo });
    })();
  }, [team.demo, team.person?.id]);
  const isAdmin = Boolean(team.person?.roles.includes("admin"));
  const exitDemo = () => {
    team.setDemoId("");
    void navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      {!candidate && (
        <div className={`workspace-top-banner${inDemo ? " is-demo" : ""}`}>
          <div className="workspace-top-banner-inner">
            {inDemo ? (
              <>
                <span>
                  <span className="workspace-demo-label">Demo</span>A fictional company and candidates. Same screens as the product.
                </span>
                <DemoProfileSelector />
              </>
            ) : (
              <span>{c.signedIn ? "Signed in · Your organization's workspace" : "Sign in to see your hiring work."}</span>
            )}
            {!inDemo &&
              (c.signedIn ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    void (async () => {
                      await query.cancelQueries();
                      query.clear();
                      await supabase.auth.signOut();
                      await navigate({ to: "/", replace: true });
                    })()
                  }
                >
                  <LogOut /> Sign out
                </Button>
              ) : (
                <Button size="sm" variant="link" onClick={() => setLogin(!login)}>
                  Sign in <ArrowRight />
                </Button>
              ))}
          </div>
          {login && !inDemo && (
            <form
              className="workspace-top-banner-inner"
              onSubmit={(e) => {
                e.preventDefault();
                void c.run(async () => {
                  const { error } = await supabase.auth.signInWithPassword({ email, password });
                  if (error) throw error;
                  setPassword("");
                  setLogin(false);
                  await navigate({ to: "/work" });
                }, "Signed in.");
              }}
            >
              <label>
                Email
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label>
                Password
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </label>
              <Button type="submit" disabled={c.busy}>
                Sign in <ArrowRight />
              </Button>
              {c.error && <p role="alert">{c.error}</p>}
            </form>
          )}
        </div>
      )}
      <header className="workspace-header">
        <div className="workspace-header-inner">
          <Link to={inDemo ? "/demo" : c.signedIn ? "/work" : "/"} className="workspace-wordmark">
            <ThebeMark size={30} />
            {brand.logo && !inDemo && <img src={brand.logo} alt="" className="h-8 max-w-24 object-contain" />}
            {inDemo ? "Thebe IO · Demo" : brand.name}
          </Link>
          {!candidate && (
            <div className="workspace-header-actions">
              <nav className="workspace-nav" aria-label="Primary">
                {inDemo ? (
                  <>
                    <Link to="/demo/work">My work</Link>
                    <Link to="/demo/jobs">Jobs</Link>
                    {isAdmin && <Link to="/demo/team">Admin</Link>}
                    <Link to="/demo/help">How it works</Link>
                  </>
                ) : c.signedIn ? (
                  <>
                    <Link to="/work">My work</Link>
                    <Link to="/jobs">Jobs</Link>
                    {team.allowed("people") && <Link to="/admin">Admin</Link>}
                    <Link to="/glossary">How it works</Link>
                  </>
                ) : (
                  <>
                    <Link to="/try">Try it</Link>
                    <Link to="/glossary">How it works</Link>
                  </>
                )}
              </nav>
              {inDemo ? (
                <button type="button" className="workspace-demo-button" onClick={exitDemo}>
                  Exit demo
                </button>
              ) : (
                !c.signedIn && (
                  <Link to="/demo" className="workspace-demo-button">
                    See the demo
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </header>
      <main className="workspace-main">
        <WorkspaceProvider mode="product">
          <Outlet />
        </WorkspaceProvider>
      </main>
      <footer className="workspace-footer">
        {candidate
          ? "Candidate responses are confidential."
          : inDemo
            ? "Demo: everything here is fictional and saved only in this browser."
            : "People make every hiring decision. O*NET data, CC BY 4.0."}
        {!candidate && (
          <Link to={inDemo ? "/demo/help" : "/glossary"} className="ml-5 underline">
            How it works
          </Link>
        )}
      </footer>
    </div>
  );
}
