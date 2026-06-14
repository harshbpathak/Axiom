import { create } from "zustand";
import type { Run } from "./types";

interface AxiomStore {
  runs: Run[];
  activeRunId: string | null;
  addRun: (run: Run) => void;
  selectRun: (id: string | null) => void;
  getActiveRun: () => Run | undefined;
}

export const useStore = create<AxiomStore>((set, get) => ({
  runs: [],
  activeRunId: null,
  
  addRun: (run) => set((state) => ({ 
    runs: [run, ...state.runs],
    activeRunId: run.id 
  })),
  
  selectRun: (id) => set({ activeRunId: id }),
  
  getActiveRun: () => {
    const { runs, activeRunId } = get();
    if (!activeRunId) return runs[0];
    return runs.find((r) => r.id === activeRunId);
  },
}));
