import { ChevronDown, Info, AlertTriangle } from "lucide-react";
import { useState } from "react";

const ITEMS: { icon: "info" | "warn"; text: string }[] = [
  { icon: "info", text: "Historical series synthesized from 3 inputs (cash, burn, revenue) — 6-month linear projection backward." },
  { icon: "info", text: "Price elasticity assumed at -1.4 (demand drops 1.4% per 1% price increase)." },
  { icon: "info", text: "Cost structure assumed linear with revenue." },
  { icon: "warn", text: "Wolfram mode: MOCKED — results use scipy.optimize, not live Wolfram kernel." },
];

export function AssumptionsPanel() {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Model Assumptions</span>
          <Info className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
        </div>
        <ChevronDown
          className={`h-4 w-4 text-[var(--text-secondary)] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <ul className="space-y-2 border-t border-[var(--border)] px-5 py-4">
          {ITEMS.map((it, i) => {
            const Icon = it.icon === "warn" ? AlertTriangle : Info;
            const color = it.icon === "warn" ? "text-amber-400" : "text-[var(--accent)]";
            return (
              <li key={i} className="flex items-start gap-3 text-xs text-[var(--text-secondary)]">
                <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${color}`} />
                <span>{it.text}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
