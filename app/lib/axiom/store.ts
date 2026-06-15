import { create } from "zustand";
import type { Run, WolframMode } from "./types";

interface AppStore {
  runs: Run[];
  activeRunId: string | null;
  wolframMode: WolframMode;
  isComputing: boolean;
  addRun: (run: Run) => void;
  selectRun: (id: string) => void;
  clearRuns: () => void;
  setWolframMode: (m: WolframMode) => void;
  setIsComputing: (v: boolean) => void;
}

export const useAxiomStore = create<AppStore>((set) => ({
  runs: [],
  activeRunId: null,
  wolframMode: "local_kernel",
  isComputing: false,
  addRun: (run) =>
    set((s) => ({ runs: [run, ...s.runs], activeRunId: run.id })),
  selectRun: (id) => set({ activeRunId: id }),
  clearRuns: () => set({ runs: [], activeRunId: null }),
  setWolframMode: (m) => set({ wolframMode: m }),
  setIsComputing: (v) => set({ isComputing: v }),
}));

export const useActiveRun = (): Run | null => {
  const runs = useAxiomStore((s) => s.runs);
  const activeId = useAxiomStore((s) => s.activeRunId);
  return runs.find((r) => r.id === activeId) ?? runs[0] ?? null;
};

export function fmtCurrency(n: number, opts: { compact?: boolean } = {}): string {
  if (opts.compact) {
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return `${n < 0 ? "-" : ""}$${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${n < 0 ? "-" : ""}$${(abs / 1_000).toFixed(0)}k`;
    return `$${n.toFixed(0)}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
