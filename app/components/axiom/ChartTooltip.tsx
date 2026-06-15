import { fmtCurrency } from "@/lib/axiom/store";

export function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3 font-mono text-xs shadow-xl">
      <div className="mb-1 text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
        Month {label}
      </div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-[var(--text-primary)]">
            {typeof p.value === "number" ? fmtCurrency(p.value, { compact: true }) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}
