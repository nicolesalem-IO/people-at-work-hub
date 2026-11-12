import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { kitSeedCalibration, kitSeedDecisions, kitSeedSheets } from "@/data/kit-demo";
import { reviseSheet, type Decision, type Sheet } from "@/lib/kit-rules";

// Demo storage for the hiring kit. Same actions the database layer will provide; for now the
// records live in this browser only, so nothing here authorizes anything.
type Calibration = Record<string, Record<string, Record<string, number>>>;
interface KitState {
  sheets: Sheet[];
  decisions: Decision[];
  calibration: Calibration;
  approvedBy: string | null;
}
interface KitActions extends KitState {
  saveSheet: (s: Sheet, submit: boolean) => void;
  reviseSheet: (s: Sheet, scores: Record<string, number>, notes: Record<string, string>, reason: string) => void;
  saveCalibration: (raterId: string, scores: Record<string, Record<string, number>>) => void;
  decide: (d: Decision) => void;
  approve: (name: string) => void;
  reset: () => void;
}

const KEY = "io-hiring-kit-v1";
const seed = (): KitState => ({
  sheets: kitSeedSheets,
  decisions: kitSeedDecisions,
  calibration: kitSeedCalibration,
  approvedBy: "Priya Shah",
});
const Ctx = createContext<KitActions | null>(null);

export function useKit() {
  const c = useContext(Ctx);
  if (!c) throw new Error("Hiring kit context missing");
  return c;
}

export function KitProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<KitState>(seed);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...seed(), ...(JSON.parse(raw) as KitState) });
    } catch {
      /* storage unavailable: keep the seed */
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, loaded]);

  const now = () => new Date().toISOString();
  const put = (s: Sheet) => (prev: KitState) => ({ ...prev, sheets: [...prev.sheets.filter((x) => x.id !== s.id), s] });

  return (
    <Ctx.Provider
      value={{
        ...state,
        saveSheet: (s, submit) => setState(put(submit ? { ...s, submittedAt: now() } : s)),
        reviseSheet: (s, scores, notes, reason) => setState(put(reviseSheet(s, scores, notes, now(), reason))),
        saveCalibration: (raterId, scores) =>
          setState((p) => ({ ...p, calibration: { ...p.calibration, [raterId]: scores } })),
        decide: (d) =>
          setState((p) => ({ ...p, decisions: [...p.decisions.filter((x) => x.candidateId !== d.candidateId), d] })),
        approve: (name) => setState((p) => ({ ...p, approvedBy: name })),
        reset: () => setState(seed()),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
