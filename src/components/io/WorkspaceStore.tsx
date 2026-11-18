import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { demoJobs } from "@/data/workflow-demo";
import { kitCandidates } from "@/data/kit-demo";
import { tasksFor, type Job, type KitProgress, type Task } from "@/lib/workflow";
import { useAdmin } from "./AdminProvider";
import { stage } from "./HiringKit";
import { useKitMaybe } from "./KitStore";

// One store, two sources. The demo uses fictional jobs saved in this browser. The product will read and write
// the organization's database; until that step ships, product jobs are saved in this browser too.
export type Mode = "demo" | "product";
type Ctx = {
  mode: Mode;
  jobs: Job[];
  ready: boolean;
  me: { id: string; name: string; email: string } | null;
  job: (id: string) => Job | undefined;
  memberId: (job: Job) => string | null;
  createJob: (job: Job) => void;
  updateJob: (id: string, change: (j: Job) => Job) => void;
  reset: () => void;
  kitProgress: (job: Job) => KitProgress | undefined;
  myTasks: () => Task[];
};
const C = createContext<Ctx | null>(null);

export function useWorkspace() {
  const c = useContext(C);
  if (!c) throw new Error("Workspace context missing");
  return c;
}

export function WorkspaceProvider({ mode, children }: { mode: Mode; children: ReactNode }) {
  const team = useAdmin();
  const kit = useKitMaybe();
  // Product pages belong to signed-in people only; the demo uses its fictional person.
  const person = mode === "demo" ? team.person : team.demo ? null : team.person;
  const key = mode === "demo" ? "thebe-demo-v2" : `thebe-work-v1:${person?.id ?? "signed-out"}`;
  const seed = () => (mode === "demo" ? demoJobs() : []);
  const [jobs, setJobs] = useState<Job[]>(seed);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    try {
      const raw = localStorage.getItem(key);
      setJobs(raw ? (JSON.parse(raw) as Job[]) : seed());
    } catch {
      setJobs(seed());
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(key, JSON.stringify(jobs));
    } catch {
      /* storage unavailable */
    }
  }, [jobs, ready, key]);

  const value = useMemo<Ctx>(() => {
    const me = person ? { id: person.id, name: person.name, email: person.email } : null;
    const memberId = (job: Job) => (me ? (job.team.find((m) => m.id === me.id || (me.email && m.email === me.email))?.id ?? null) : null);
    const kitProgress = (job: Job): KitProgress | undefined => {
      if (!job.kit || !kit) return undefined;
      const st = kitCandidates.map((c) => stage(c, kit.sheets, kit.decisions));
      return {
        candidates: kitCandidates.length,
        scored: st.filter((s) => s.ws?.status === "final" || s.decision).length,
        decided: kit.decisions.length,
      };
    };
    return {
      mode,
      jobs,
      ready,
      me,
      job: (id) => jobs.find((j) => j.id === id),
      memberId,
      createJob: (j) => setJobs((p) => [...p, j]),
      updateJob: (id, change) => setJobs((p) => p.map((j) => (j.id === id ? change(structuredClone(j)) : j))),
      reset: () => {
        setJobs(seed());
        kit?.reset();
      },
      kitProgress,
      myTasks: () => jobs.flatMap((j) => {
        const id = memberId(j);
        return id ? tasksFor(id, j, kitProgress(j)) : [];
      }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, jobs, ready, person, kit]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
