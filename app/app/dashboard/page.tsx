"use client";

import { useState } from "react";
import ActionCards from "@/components/ActionCards";
import AgentFeed from "@/components/AgentFeed";
import ChartDisplay from "@/components/ChartDisplay";
import MetricsInputPanel from "@/components/MetricsInputPanel";
import SummaryHeader from "@/components/dashboard/SummaryHeader";
import { computeStrategyStream } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { ComputationResponse, StrategyInput, Run } from "@/lib/types";
import Link from "next/link";

const defaultInput: StrategyInput = {
  cash_reserve: 250000,
  monthly_burn: 45000,
  monthly_revenue: 18000,
  goal_prompt: "Extend runway to 18 months while testing a higher enterprise price tier.",
};

export default function DashboardPage() {
  const [input, setInput] = useState<StrategyInput>(defaultInput);
  const [agentSteps, setAgentSteps] = useState<string[]>([]);
  const [result, setResult] = useState<ComputationResponse | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addRun = useStore((state) => state.addRun);

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
      
      const newRun: Run = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        inputs: { ...input },
        output: response
      };
      addRun(newRun);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Computation failed");
    } finally {
      setIsComputing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row h-full">
      <div className="w-full lg:w-80 flex-shrink-0">
        <MetricsInputPanel
          values={input}
          onChange={setInput}
          onCompute={handleCompute}
          isComputing={isComputing}
        />
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <SummaryHeader result={result} />

        {error && (
          <div className="rounded-lg border border-[var(--danger)] bg-red-950/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {isComputing || agentSteps.length > 0 ? (
          <div className="mb-4">
            <AgentFeed steps={agentSteps} isActive={isComputing} />
            {!isComputing && result && (
              <div className="mt-2 text-right">
                <Link href="/agents" className="text-xs text-teal-500 hover:text-teal-400">
                  View full console &rarr;
                </Link>
              </div>
            )}
          </div>
        ) : null}

        <div className="flex-1 min-h-[300px]">
          <ChartDisplay data={result?.chart_coordinates ?? []} />
        </div>

        <div>
          <ActionCards result={result} />
        </div>
      </div>
    </div>
  );
}
