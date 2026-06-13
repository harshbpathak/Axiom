"use client";

import { useState } from "react";
import ActionCards from "@/components/ActionCards";
import AgentFeed from "@/components/AgentFeed";
import ChartDisplay from "@/components/ChartDisplay";
import MetricsInputPanel from "@/components/MetricsInputPanel";
import { computeStrategyStream } from "@/lib/api";
import type { ComputationResponse, StrategyInput } from "@/lib/types";

const defaultInput: StrategyInput = {
  cash_reserve: 250000,
  monthly_burn: 45000,
  monthly_revenue: 18000,
  goal_prompt: "Extend runway to 18 months while testing a higher enterprise price tier.",
};

export default function WarRoomDashboard() {
  const [input, setInput] = useState<StrategyInput>(defaultInput);
  const [agentSteps, setAgentSteps] = useState<string[]>([]);
  const [result, setResult] = useState<ComputationResponse | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompute = async () => {
    setIsComputing(true);
    setError(null);
    setAgentSteps([]);
    setResult(null);

    try {
      const response = await computeStrategyStream(input, (step) => {
        setAgentSteps((prev) => [...prev, step]);
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Computation failed");
    } finally {
      setIsComputing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0f172a] lg:flex-row">
      <MetricsInputPanel
        values={input}
        onChange={setInput}
        onCompute={handleCompute}
        isComputing={isComputing}
      />

      <main className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-500">
            Computational Co-Founder
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white">The War Room</h2>
        </header>

        <AgentFeed steps={agentSteps} isActive={isComputing} />

        {error && (
          <div className="rounded-lg border border-red-800/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="flex-1">
          <ChartDisplay data={result?.chart_coordinates ?? []} />
        </section>

        {result && (
          <p className="max-w-3xl text-sm leading-relaxed text-slate-300">
            {result.executive_summary}
          </p>
        )}

        <ActionCards result={result} />
      </main>
    </div>
  );
}
