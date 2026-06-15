"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  TrendingUp,
  SlidersHorizontal,
  History,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { useAxiomStore } from "@/lib/axiom/store";

const NAV: { icon: LucideIcon; label: string; to: string }[] = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: TrendingUp, label: "Forecast", to: "/forecast" },
  { icon: SlidersHorizontal, label: "Pricing Lab", to: "/pricing" },
  { icon: History, label: "Past Runs", to: "/runs" },
  { icon: Terminal, label: "Agent Console", to: "/agents" },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const mode = useAxiomStore((s) => s.wolframMode);

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--panel)]">
      <div className="px-5 py-6">
        <Link href="/" className="inline-block font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)] transition-opacity hover:opacity-80">
          AXIOM
        </Link>
        <div className="mt-1 text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
          Computational Co-Founder
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              href={item.to}
              onClick={onNavigate}
              className={[
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-all",
                active
                  ? "border-l-2 border-[var(--accent)] bg-[var(--panel-hover)] text-[var(--text-primary)]"
                  : "mx-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--panel-hover)] hover:text-[var(--text-primary)]",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] px-5 py-4 font-mono text-[10px] uppercase tracking-widest">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <span
            className={`h-1.5 w-1.5 rounded-full axiom-pulse ${
              mode === "mocked" ? "bg-amber-400" : "bg-[var(--accent)]"
            }`}
          />
          ENGINE: {mode === "mocked" ? "MOCKED" : mode === "local_kernel" ? "LOCAL" : "WLSCRIPT"}
        </div>
      </div>
    </aside>
  );
}
