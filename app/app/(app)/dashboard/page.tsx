"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart2, Loader2, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
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
import { useActiveRun, useAxiomStore, fmtCurrency } from "@/lib/axiom/store";
import { VerifiedTag } from "@/components/axiom/VerifiedTag";
import { EmptyState } from "@/components/axiom/EmptyState";
import { AgentFeed, buildLogsFromTrace } from "@/components/axiom/AgentFeed";
import { DarkTooltip } from "@/components/axiom/ChartTooltip";
import type { StrategyInput } from "@/lib/axiom/types";

export default function Page() {
  const run = useActiveRun();
  const isComputing = useAxiomStore((s) => s.isComputing);
  const setIsComputing = useAxiomStore((s) => s.setIsComputing);
  const selectRun = useAxiomStore((s) => s.selectRun);
  const runs = useAxiomStore((s) => s.runs);
  const addRun = useAxiomStore((s) => s.addRun);
  const setWolframMode = useAxiomStore((s) => s.setWolframMode);

  const [inputs, setInputs] = useState<StrategyInput>({
    cashReserve: 850000,
    monthlyBurn: 62000,
    monthlyRevenue: 18000,
    strategicGoal: "",
  });

  const impliedRunway = useMemo(() => {
    const delta = inputs.monthlyBurn - inputs.monthlyRevenue;
    if (delta <= 0) return Infinity;
    return Math.floor(inputs.cashReserve / delta);
  }, [inputs]);

  const monthlyDelta = inputs.monthlyRevenue - inputs.monthlyBurn;

  async function handleRun(useDemoInputs = false) {
    const currentInputs = useDemoInputs ? {
      cashReserve: 850000,
      monthlyBurn: 62000,
      monthlyRevenue: 18000,
      strategicGoal: "Extend runway past Series A",
    } : inputs;

    setIsComputing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/v1/strategy/compute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cash_reserve: currentInputs.cashReserve,
          monthly_burn: currentInputs.monthlyBurn,
          monthly_revenue: currentInputs.monthlyRevenue,
          goal_prompt: currentInputs.strategicGoal || "Extend runway",
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const rawOutput = await res.json();
      
      const output = {
        verifiedRunwayMonths: rawOutput.verified_runway_months,
        optimalPricePoint: rawOutput.optimal_price_point,
        chartCoordinates: rawOutput.chart_coordinates,
        executiveSummary: rawOutput.executive_summary,
        sensitivityGrid: rawOutput.sensitivity_grid,
        actionInsights: rawOutput.action_insights,
        trace: rawOutput.trace,
        wolframMode: rawOutput.trace?.quant?.wolfram_mode || "local_kernel"
      };
      
      const newRun: any = {
        id: "run_" + Date.now(),
        timestamp: new Date().toISOString(),
        label: "Live Analysis",
        inputs: currentInputs,
        output,
        agentLogs: output.trace,
      };

      addRun(newRun);
      setWolframMode(output.wolframMode as any);
    } catch (err) {
      console.error("Failed to run analysis:", err);
      alert("Backend computation failed. Please ensure the python backend is running on port 8000.");
    } finally {
      setIsComputing(false);
    }
  }

  function loadDemo() {
    setInputs({
      cashReserve: 850000,
      monthlyBurn: 62000,
      monthlyRevenue: 18000,
      strategicGoal: "Extend runway past Series A",
    });
    handleRun(true);
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[400px_1fr]">
      {/* INPUT PANEL */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <h2 className="text-base font-semibold">Financial Inputs</h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">Enter your current metrics</p>

        <div className="mt-6 space-y-4">
          <DollarInput
            label="Cash Reserve"
            value={inputs.cashReserve}
            onChange={(v) => setInputs({ ...inputs, cashReserve: v })}
            placeholder="850,000"
          />
          <DollarInput
            label="Monthly Burn"
            value={inputs.monthlyBurn}
            onChange={(v) => setInputs({ ...inputs, monthlyBurn: v })}
            placeholder="62,000"
          />
          <DollarInput
            label="Monthly Revenue"
            value={inputs.monthlyRevenue}
            onChange={(v) => setInputs({ ...inputs, monthlyRevenue: v })}
            placeholder="18,000"
          />
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
              Strategic Goal
            </label>
            <textarea
              rows={3}
              value={inputs.strategicGoal}
              onChange={(e) => setInputs({ ...inputs, strategicGoal: e.target.value })}
              placeholder="e.g. Extend runway to 18 months before Series A"
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--secondary)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </div>

        {/* Live preview */}
        <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3 font-mono text-xs">
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Implied Runway</span>
            <span className="text-[var(--accent)]">
              {Number.isFinite(impliedRunway) ? `${impliedRunway} mo` : "∞"}
            </span>
          </div>
          <div className="mt-1 flex justify-between text-[var(--text-secondary)]">
            <span>Monthly Delta</span>
            <span className={monthlyDelta >= 0 ? "text-emerald-400" : "text-red-400"}>
              {monthlyDelta >= 0 ? "+" : ""}
              {fmtCurrency(monthlyDelta)}
            </span>
          </div>
        </div>

        <button
          onClick={() => handleRun()}
          disabled={isComputing}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dim)] disabled:opacity-60"
        >
          {isComputing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Agents working...
            </>
          ) : (
            <>
              Run Analysis <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="mt-3 flex items-start gap-2 text-[10px] text-emerald-400/80">
          <span>✓</span>
          Results verified via Wolfram Engine computation.
        </p>
      </div>

      {/* RESULTS */}
      <div>
        {!run ? (
          <EmptyState
            icon={BarChart2}
            title="No analysis yet"
            message="Enter your metrics on the left and click Run Analysis to get started."
            actionLabel="Try with demo data →"
            onAction={loadDemo}
          />
        ) : (
          <ResultsArea run={run} />
        )}
      </div>
    </div>
  );
}

function DollarInput({
  label, value, onChange, placeholder,
}: {
  label: string; value: number; onChange: (n: number) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
        {label}
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 focus-within:border-[var(--accent)]">
        <span className="font-mono text-sm text-[var(--text-secondary)]">$</span>
        <input
          inputMode="numeric"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
          placeholder={placeholder}
          className="w-full bg-transparent py-2 font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--secondary)] focus:outline-none"
        />
      </div>
    </div>
  );
}

function ResultsArea({ run }: { run: ReturnType<typeof useActiveRun> & {} }) {
  const r = run!;
  const o = r.output;
  const revenueGap = r.inputs.monthlyBurn - r.inputs.monthlyRevenue;
  const logs = buildLogsFromTrace(o.trace, o.verifiedRunwayMonths);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Summary Header */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
              Projected Runway
            </div>
            <div className="mt-1 font-mono text-5xl font-bold text-[var(--accent)]">
              {o.verifiedRunwayMonths} <span className="text-2xl text-[var(--text-secondary)]">months</span>
            </div>
          </div>
          <VerifiedTag mode={o.wolframMode === "mocked" ? "mocked" : "verified"} />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
          {o.executiveSummary}
        </p>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
            Cash Balance Trajectory
          </h3>
          <VerifiedTag mode={o.wolframMode === "mocked" ? "mocked" : "verified"} />
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={o.chartCoordinates} margin={{ left: 0, right: 10, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#334155" opacity={0.4} />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={{ stroke: "#334155" }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11, fontFamily: "IBM Plex Mono" }} tickFormatter={(v) => fmtCurrency(v, { compact: true })} axisLine={{ stroke: "#334155" }} />
              <Tooltip content={<DarkTooltip />} />
              <Area type="monotone" dataKey="projected" stroke="none" fill="#0d9488" fillOpacity={0.12} name="Projected Area" />
              <Line type="monotone" dataKey="historical" name="Historical Balance" stroke="#64748b" strokeWidth={2} dot={{ r: 3, fill: "#64748b" }} isAnimationActive animationDuration={800} />
              <Line type="monotone" dataKey="projected" name="Projected Balance" stroke="#0d9488" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: "#0d9488" }} isAnimationActive animationDuration={800} />
              <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="4 4" label={{ value: "Cash Zero", fill: "#dc2626", fontSize: 10, position: "right" }} />
              <ReferenceLine x={0} stroke="#64748b" strokeDasharray="2 2" label={{ value: "Today", fill: "#94a3b8", fontSize: 10, position: "top" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ActionCard
          label="Optimal Price"
          value={`$${o.optimalPricePoint}`}
          link={{ to: "/pricing", text: "View Pricing Lab →" }}
        />
        <ActionCard
          label="Projected Runway"
          value={`${o.verifiedRunwayMonths} mo`}
          link={{ to: "/forecast", text: "View Forecast →" }}
        />
        <ActionCard
          label="Revenue Gap"
          value={fmtCurrency(revenueGap)}
          sub="to break even"
          danger={revenueGap > 0}
        />
      </div>

      {/* Agent feed mini */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
            Agent Activity
          </h3>
          <Link href="/agents" className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] hover:underline">
            View full console →
          </Link>
        </div>
        <AgentFeed lines={logs.slice(-4)} height="h-28" />
      </div>
    </motion.div>
  );
}

function ActionCard({
  label, value, sub, link, danger,
}: {
  label: string; value: string; sub?: string;
  link?: { to: string; text: string }; danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 transition-colors hover:border-[var(--accent)]/50">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
        {label}
      </div>
      <div className={`mt-2 font-mono text-3xl font-bold ${danger ? "text-red-400" : "text-[var(--accent)]"}`}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-[var(--text-secondary)]">{sub}</div>}
      {link && (
        <Link href={link.to} className="mt-3 inline-block font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] hover:underline">
          {link.text}
        </Link>
      )}
    </div>
  );
}

