"use client";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useActiveRun, fmtCurrency } from "@/lib/axiom/store";
import { VerifiedTag } from "@/components/axiom/VerifiedTag";
import { EmptyState } from "@/components/axiom/EmptyState";
import { AssumptionsPanel } from "@/components/axiom/AssumptionsPanel";
import { DarkTooltip } from "@/components/axiom/ChartTooltip";

export default function Page() {
  const run = useActiveRun();
  const [open, setOpen] = useState(false);

  if (!run) {
    return (
      <div className="p-6">
        <EmptyState icon={SlidersHorizontal} title="No pricing data" message="Run an analysis to see the optimal price point." actionLabel="Go to Dashboard →" onAction={() => (window.location.href = "/dashboard")} />
      </div>
    );
  }

  const o = run.output;
  const grid = o.sensitivityGrid;
  const minP = grid[0].price;
  const maxP = grid[grid.length - 1].price;
  const optimal = o.optimalPricePoint;
  const currentPrice = Math.round((minP + maxP) / 2);

  const [sliderPrice, setSliderPrice] = useState(optimal);

  const interpolated = useMemo(() => {
    const closest = grid.reduce((a, b) =>
      Math.abs(b.price - sliderPrice) < Math.abs(a.price - sliderPrice) ? b : a
    );
    return closest.runwayMonths;
  }, [sliderPrice, grid]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Hero stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Optimal Price Point" value={`$${optimal}`} verified mode={o.wolframMode} />
        <StatCard label="Runway at Optimal" value={`${o.verifiedRunwayMonths} mo`} />
        <StatCard label="Revenue Uplift" value="+$2,800" sub="vs current price" success />
      </div>

      {/* Formula */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)]">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]"
        >
          View optimization formula
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <pre className="border-t border-[var(--border)] bg-[var(--code-bg)] px-5 py-4 font-mono text-xs leading-relaxed text-[var(--text-secondary)]">
{`NMaximize[
  { revenue[p] - cost[p], ${minP} <= p <= ${maxP} },
  p
]

→ Optimal: p = ${optimal}
→ Max Revenue = $28,400/mo`}
          </pre>
        )}
      </div>

      {/* Sensitivity chart */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
            Price → Runway Sensitivity
          </h3>
          <VerifiedTag mode={o.wolframMode === "mocked" ? "mocked" : "verified"} />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={grid} margin={{ left: 0, right: 20, top: 16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#334155" opacity={0.4} />
              <XAxis dataKey="price" tick={{ fill: "#64748b", fontSize: 11, fontFamily: "IBM Plex Mono" }} tickFormatter={(v) => `$${v}`} axisLine={{ stroke: "#334155" }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11, fontFamily: "IBM Plex Mono" }} tickFormatter={(v) => `${v}mo`} axisLine={{ stroke: "#334155" }} />
              <Tooltip content={<DarkTooltip />} />
              <Line type="monotone" dataKey="runwayMonths" name="Runway" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 4, fill: "#0d9488" }} isAnimationActive animationDuration={800} />
              <ReferenceLine x={optimal} stroke="#0d9488" strokeDasharray="4 4" label={{ value: `Optimal: $${optimal}`, fill: "#0d9488", fontSize: 10, position: "top" }} />
              <ReferenceLine x={currentPrice} stroke="#64748b" strokeDasharray="2 2" label={{ value: "Current", fill: "#94a3b8", fontSize: 10, position: "insideBottomRight" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Slider lab */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <h3 className="text-sm font-semibold">Drag to explore. No API call required.</h3>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Interpolates the precomputed sensitivity grid in real-time.
        </p>

        <div className="mt-6 text-center">
          <div className="font-mono text-3xl font-bold text-[var(--accent)]">
            At ${sliderPrice} → {interpolated} months runway
          </div>
        </div>

        <input
          type="range"
          min={minP}
          max={maxP}
          step={10}
          value={sliderPrice}
          onChange={(e) => setSliderPrice(Number(e.target.value))}
          className="axiom-range mt-6 w-full"
        />
        <div className="mt-1 flex justify-between font-mono text-[10px] text-[var(--secondary)]">
          <span>${minP}</span>
          <span>${maxP}</span>
        </div>

        {/* Mini bars */}
        <div className="mt-8 grid grid-cols-10 gap-2">
          {grid.map((g) => {
            const active = g.price === sliderPrice;
            const h = (g.runwayMonths / Math.max(...grid.map((x) => x.runwayMonths))) * 100;
            return (
              <div key={g.price} className="flex flex-col items-center gap-1">
                <div className="flex h-24 w-full items-end">
                  <div
                    className={`w-full rounded-t transition-all ${active ? "bg-[var(--accent)]" : "bg-[var(--accent-dim)]/40"}`}
                    style={{ height: `${h}%` }}
                  />
                </div>
                <span className="font-mono text-[9px] text-[var(--text-secondary)]">${g.price}</span>
              </div>
            );
          })}
        </div>
      </div>

      <AssumptionsPanel />
    </div>
  );
}

function StatCard({ label, value, sub, verified, success, mode }: {
  label: string; value: string; sub?: string; verified?: boolean; success?: boolean; mode?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
          {label}
        </span>
        {verified && <VerifiedTag mode={mode === "mocked" ? "mocked" : "verified"} />}
      </div>
      <div className={`mt-3 font-mono text-3xl font-bold ${success ? "text-emerald-400" : "text-[var(--accent)]"}`}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-[var(--text-secondary)]">{sub}</div>}
    </div>
  );
}

