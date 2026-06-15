import { Menu } from "lucide-react";
import { useAxiomStore } from "@/lib/axiom/store";

export function TopBar({ title, onMenu }: { title: string; onMenu?: () => void }) {
  const mode = useAxiomStore((s) => s.wolframMode);
  const isMocked = false;

  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-primary)] px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {onMenu && (
          <button
            onClick={onMenu}
            className="rounded p-1.5 text-[var(--text-secondary)] hover:bg-[var(--panel-hover)] md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-sm font-semibold tracking-wide text-[var(--text-primary)] sm:text-base">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] sm:flex">
          <span
            className={`h-2 w-2 rounded-full axiom-pulse ${
              isMocked ? "bg-amber-400" : "bg-[var(--accent)]"
            }`}
          />
          WOLFRAM
        </div>
        <span
          className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
            isMocked
              ? "border-amber-700/40 bg-amber-900/30 text-amber-400"
              : "border-[var(--accent)]/30 bg-[var(--accent-glow)] text-[var(--accent)]"
          }`}
        >
          [{isMocked ? "STANDBY" : "LIVE"}]
        </span>
        <span className="hidden font-mono text-[10px] text-[var(--text-secondary)] sm:inline">
          Last checked 8s ago
        </span>
      </div>
    </header>
  );
}

