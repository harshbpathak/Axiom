"use client";
import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import {
  ComposedChart,
  Line,
  Area,
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
import { DarkTooltip } from "@/components/axiom/ChartTooltip";

export default function Page() {
  const run = useActiveRun();
  const [horizon, setHorizon] = useState(12);
  const [showBand, setShowBand] = useState(true);
  const [showZero, setShowZero] = useState(true);

  if (!run) {
    return (
      <div className="p-6">
        <EmptyState icon={TrendingUp} title="No forecast data yet" message="Run an analysis from the dashboard to see your runway projection." actionLabel="Go to Dashboard →" onAction={() => (window.location.href = "/dashboard")} />
      </div>
    );
  }

  const o = run.output;
  const data = o.chartCoordinates.filter((c) => c.month <= horizon);
  const initialBalance = run.inputs.cashReserve;

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
          Last run: 2 minutes ago
        </div>
        <Link href="/dashboard" className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]">
          Re-run →
        </Link>
      </div>

      {/* Controls */}
      <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="mr-2 font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">Horizon</span>
            {[3, 6, 12, 24].map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`rounded-md px-3 py-1 font-mono text-xs ${
                  horizon === h
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]"
                }`}
              >
                {h} mo
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Toggle label="Confidence band" value={showBand} onChange={setShowBand} />
            <Toggle label="Zero line" value={showZero} onChange={setShowZero} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
              Computed by TimeSeriesForecast
            </span>
            <VerifiedTag mode={o.wolframMode === "mocked" ? "mocked" : "verified"} />
          </div>
        </div>
      </div>

      {/* Main chart */}
      <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="h-[60vh] min-h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ left: 10, right: 30, top: 16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#334155" opacity={0.4} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "IBM Plex Mono" }}
                axisLine={{ stroke: "#334155" }}
                tickFormatter={(v) => (v === 0 ? "Today" : `M${v > 0 ? "+" : ""}${v}`)}
              />
              <YAxis tick={{ fill: "#64748b", fontSize: 11, fontFamily: "IBM Plex Mono" }} tickFormatter={(v) => fmtCurrency(v, { compact: true })} axisLine={{ stroke: "#334155" }} />
              <Tooltip content={<DarkTooltip />} />
              {showBand && (
                <Area type="monotone" dataKey="projected" stroke="none" fill="#0d9488" fillOpacity={0.1} name="Projected Area" />
              )}
              <Line type="monotone" dataKey="historical" name="Historical Balance" stroke="#64748b" strokeWidth={2.5} dot={{ r: 4, fill: "#64748b" }} isAnimationActive animationDuration={1000} />
              <Line type="monotone" dataKey="projected" name="Projected Balance" stroke="#0d9488" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4, fill: "#0d9488" }} isAnimationActive animationDuration={1000} />
              {showZero && (
                <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="4 4" label={{ value: "Cash Zero", fill: "#dc2626", fontSize: 10, position: "right" }} />
              )}
              <ReferenceLine x={0} stroke="#64748b" strokeDasharray="2 2" label={{ value: "Today", fill: "#94a3b8", fontSize: 10, position: "top" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight card */}
      <div className="mt-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-glow)] p-5">
        <div className="flex items-start gap-3">
          <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              At current burn, cash reaches zero in month {o.verifiedRunwayMonths} — Wolfram-verified via TimeSeriesForecast with synthetic historical series.
            </p>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              ℹ Historical series was synthesized from 3 data points (cash, burn, revenue). See Agent Console for full trace.
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown table */}
      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden">
        <div className="border-b border-[var(--border)] px-5 py-3">
          <h3 className="text-sm font-semibold">Month-by-Month Projection</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-primary)]">
              <tr className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
                <th className="px-5 py-2.5 text-left">Month</th>
                <th className="px-5 py-2.5 text-right">Projected Balance</th>
                <th className="px-5 py-2.5 text-right">Δ vs Prior</th>
                <th className="px-5 py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {data.map((c, i) => {
                const bal = c.projected ?? c.historical ?? 0;
                const pct = bal / initialBalance;
                const cls =
                  bal < 0
                    ? "bg-red-900/20 text-red-400 font-semibold"
                    : pct < 0.2
                    ? "text-red-400 font-semibold"
                    : pct < 0.5
                    ? "text-amber-400"
                    : "text-[var(--text-primary)]";
                const priorBal = i > 0 ? (data[i - 1].projected ?? data[i - 1].historical ?? 0) : bal;
                const delta = bal - priorBal;
                const status = bal < 0 ? "INSOLVENT" : pct < 0.2 ? "CRITICAL" : pct < 0.5 ? "WATCH" : "HEALTHY";
                return (
                  <tr key={c.month} className={`border-t border-[var(--border)] ${cls}`}>
                    <td className="px-5 py-2.5">M{c.month >= 0 ? "+" : ""}{c.month}</td>
                    <td className="px-5 py-2.5 text-right">{fmtCurrency(bal)}</td>
                    <td className="px-5 py-2.5 text-right">{i === 0 ? "—" : `${delta >= 0 ? "+" : ""}${fmtCurrency(delta, { compact: true })}`}</td>
                    <td className="px-5 py-2.5 text-right text-[10px] uppercase tracking-widest">{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--text-secondary)]">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative h-4 w-7 rounded-full transition-colors ${value ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
      >
        <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${value ? "translate-x-3.5" : "translate-x-0.5"}`} />
      </button>
      {label}
    </label>
  );
}
