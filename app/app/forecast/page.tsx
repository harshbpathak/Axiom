"use client";

import { useStore } from "@/lib/store";
import EmptyState from "@/components/shared/EmptyState";
import ChartDisplay from "@/components/ChartDisplay";

export default function ForecastPage() {
  const run = useStore((state) => state.getActiveRun());

  if (!run) {
    return <EmptyState message="Run a simulation on the Dashboard to see your runway forecast." />;
  }

  const result = run.output;
  const metrics = run.inputs;
  const netFlow = metrics.monthly_revenue - metrics.monthly_burn;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Runway Forecast</h1>
        <div className="rounded border border-teal-800 bg-teal-950/30 px-3 py-1 text-sm text-teal-400">
          Verified via {result.trace?.quant?.wolfram_mode || "mocked"}
        </div>
      </div>

      <div className="h-[500px]">
        <ChartDisplay data={result.chart_coordinates} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
          <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Executive Summary</h3>
          <p className="text-[var(--text-secondary)] leading-relaxed">{result.executive_summary}</p>
          
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-teal-500">Key Insights</h4>
            <ul className="list-inside list-disc space-y-2 text-sm text-[var(--text-secondary)]">
              {result.action_insights.map((insight, i) => (
                <li key={i}>{insight}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
          <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Unit Economics</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[var(--text-secondary)]">Cash Reserve</dt>
              <dd className="mt-1 text-xl font-medium text-[var(--text-primary)]">${metrics.cash_reserve.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)]">Net Flow</dt>
              <dd className={`mt-1 text-xl font-medium ${netFlow >= 0 ? "text-teal-500" : "text-red-400"}`}>
                ${Math.abs(netFlow).toLocaleString()}/mo {netFlow >= 0 ? "profit" : "burn"}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)]">Burn Rate</dt>
              <dd className="mt-1 text-xl font-medium text-[var(--text-primary)]">${metrics.monthly_burn.toLocaleString()}/mo</dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)]">Revenue</dt>
              <dd className="mt-1 text-xl font-medium text-[var(--text-primary)]">${metrics.monthly_revenue.toLocaleString()}/mo</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
