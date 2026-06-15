"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { History, ChevronDown, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAxiomStore, fmtCurrency } from "@/lib/axiom/store";
import { EmptyState } from "@/components/axiom/EmptyState";
import { DarkTooltip } from "@/components/axiom/ChartTooltip";

const COLORS = ["#0d9488", "#8b5cf6", "#f59e0b"];

export default function Page() {
  const runs = useAxiomStore((s) => s.runs);
  const clearRuns = useAxiomStore((s) => s.clearRuns);
  const selectRun = useAxiomStore((s) => s.selectRun);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  if (runs.length === 0) {
    return (
      <div className="p-6">
        <EmptyState icon={History} title="No runs yet" message="Your past analyses will appear here." actionLabel="Run your first analysis →" onAction={() => (window.location.href = "/dashboard")} />
      </div>
    );
  }

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Past Runs</h2>
          <span className="rounded border border-[var(--border)] bg-[var(--panel)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
            {runs.length} runs
          </span>
        </div>
        <button
          onClick={() => { if (confirm("Clear all runs?")) clearRuns(); }}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-red-500 hover:text-red-400"
        >
          Clear All
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--panel)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-primary)]">
            <tr className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3 text-left">Run #</th>
              <th className="px-4 py-3 text-left">Label</th>
              <th className="px-4 py-3 text-left">Timestamp</th>
              <th className="px-4 py-3 text-right">Cash</th>
              <th className="px-4 py-3 text-right">Burn</th>
              <th className="px-4 py-3 text-right">Revenue</th>
              <th className="px-4 py-3 text-right">Runway</th>
              <th className="px-4 py-3 text-right">Optimal</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r, i) => (
              <FragmentRow key={r.id}>
                <tr className="border-t border-[var(--border)] hover:bg-[var(--panel-hover)]">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(r.id)}
                      onChange={() => toggle(r.id)}
                      className="h-3.5 w-3.5 accent-[var(--accent)]"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">#{String(i + 1).padStart(3, "0")}</td>
                  <td className="px-4 py-3">{r.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">{new Date(r.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono">{fmtCurrency(r.inputs.cashReserve, { compact: true })}</td>
                  <td className="px-4 py-3 text-right font-mono">{fmtCurrency(r.inputs.monthlyBurn, { compact: true })}</td>
                  <td className="px-4 py-3 text-right font-mono">{fmtCurrency(r.inputs.monthlyRevenue, { compact: true })}</td>
                  <td className="px-4 py-3 text-right font-mono text-[var(--accent)]">{r.output.verifiedRunwayMonths}mo</td>
                  <td className="px-4 py-3 text-right font-mono">${r.output.optimalPricePoint}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                      className="rounded p-1 text-[var(--text-secondary)] hover:text-[var(--accent)]"
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${expanded === r.id ? "rotate-180" : ""}`} />
                    </button>
                  </td>
                </tr>
                <AnimatePresence>
                  {expanded === r.id && (
                    <tr>
                      <td colSpan={10} className="bg-[var(--bg-primary)] p-0">
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-3 p-5">
                            <p className="text-xs text-[var(--text-secondary)]">{r.output.executiveSummary}</p>
                            <div className="flex flex-wrap gap-3">
                              <Link href="/dashboard" onClick={() => selectRun(r.id)} className="rounded-lg border border-[var(--border)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] hover:border-[var(--accent)]">
                                View in Dashboard →
                              </Link>
                              <Link href="/forecast" onClick={() => selectRun(r.id)} className="rounded-lg border border-[var(--border)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] hover:border-[var(--accent)]">
                                View Forecast →
                              </Link>
                              <Link href="/agents" onClick={() => selectRun(r.id)} className="rounded-lg border border-[var(--border)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] hover:border-[var(--accent)]">
                                View Agent Logs →
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </FragmentRow>
            ))}
          </tbody>
        </table>
      </div>

      {/* Compare bar */}
      <AnimatePresence>
        {selected.length >= 2 && !showCompare && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--panel)] px-6 py-3 shadow-2xl"
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-[var(--text-secondary)]">
                Comparing {selected.length} runs
              </span>
              <button
                onClick={() => setShowCompare(true)}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-dim)]"
              >
                Compare Now →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison panel */}
      {showCompare && selected.length >= 2 && (
        <ComparisonPanel
          runs={runs.filter((r) => selected.includes(r.id))}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function ComparisonPanel({
  runs, onClose,
}: { runs: ReturnType<typeof useAxiomStore.getState>["runs"]; onClose: () => void }) {
  // Merge chart coordinates onto common month axis
  const months = Array.from(
    new Set(runs.flatMap((r) => r.output.chartCoordinates.map((c) => c.month)))
  ).sort((a, b) => a - b);
  const data = months.map((m) => {
    const row: Record<string, number> = { month: m };
    runs.forEach((r) => {
      const c = r.output.chartCoordinates.find((x) => x.month === m);
      if (c) row[r.label] = c.balance;
    });
    return row;
  });

  const base = runs[0];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">Scenario Comparison</h3>
        <button onClick={onClose} className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)]">
          Close ✕
        </button>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ left: 0, right: 20, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#334155" opacity={0.4} />
            <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={{ stroke: "#334155" }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11, fontFamily: "IBM Plex Mono" }} tickFormatter={(v) => fmtCurrency(v, { compact: true })} axisLine={{ stroke: "#334155" }} />
            <Tooltip content={<DarkTooltip />} />
            <Legend wrapperStyle={{ fontFamily: "IBM Plex Mono", fontSize: 11 }} />
            {runs.map((r, i) => (
              <Line key={r.id} type="monotone" dataKey={r.label} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} connectNulls />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
              <th className="px-3 py-2 text-left">Metric</th>
              {runs.map((r) => (
                <th key={r.id} className="px-3 py-2 text-right">{r.label}</th>
              ))}
              <th className="px-3 py-2 text-right">Δ vs Base</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <ComparisonRow label="Runway Months" values={runs.map((r) => r.output.verifiedRunwayMonths)} suffix="mo" baseValue={base.output.verifiedRunwayMonths} />
            <ComparisonRow label="Optimal Price" values={runs.map((r) => r.output.optimalPricePoint)} prefix="$" baseValue={base.output.optimalPricePoint} />
            <ComparisonRow label="Monthly Burn" values={runs.map((r) => r.inputs.monthlyBurn)} prefix="$" baseValue={base.inputs.monthlyBurn} invert />
            <ComparisonRow label="Monthly Revenue" values={runs.map((r) => r.inputs.monthlyRevenue)} prefix="$" baseValue={base.inputs.monthlyRevenue} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComparisonRow({
  label, values, prefix = "", suffix = "", baseValue, invert,
}: {
  label: string; values: number[]; prefix?: string; suffix?: string; baseValue: number; invert?: boolean;
}) {
  const delta = values[values.length - 1] - baseValue;
  const positive = invert ? delta < 0 : delta > 0;
  return (
    <tr className="border-t border-[var(--border)]">
      <td className="px-3 py-2.5 font-sans text-xs text-[var(--text-secondary)]">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-3 py-2.5 text-right">{prefix}{v.toLocaleString()}{suffix}</td>
      ))}
      <td className={`px-3 py-2.5 text-right ${positive ? "text-emerald-400" : "text-red-400"}`}>
        <span className="inline-flex items-center gap-1">
          {delta >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {prefix}{Math.abs(delta).toLocaleString()}{suffix}
        </span>
      </td>
    </tr>
  );
}

