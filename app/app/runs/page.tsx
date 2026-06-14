"use client";

import { useStore } from "@/lib/store";
import EmptyState from "@/components/shared/EmptyState";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function RunsPage() {
  const runs = useStore((state) => state.runs);
  const selectRun = useStore((state) => state.selectRun);

  if (runs.length === 0) {
    return <EmptyState message="No runs yet — your computed scenarios will appear here for comparison." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Past Runs</h1>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/50 text-xs uppercase text-[var(--text-secondary)] border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium">Cash/Burn/Rev</th>
              <th className="px-6 py-4 font-medium">Optimal Price</th>
              <th className="px-6 py-4 font-medium">Runway</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {runs.map((run) => (
              <tr key={run.id} className="transition hover:bg-slate-800/30">
                <td className="px-6 py-4 text-[var(--text-primary)]">
                  {formatDistanceToNow(new Date(run.timestamp), { addSuffix: true })}
                </td>
                <td className="px-6 py-4 font-mono text-[var(--text-secondary)]">
                  ${run.inputs.cash_reserve/1000}k / ${run.inputs.monthly_burn/1000}k / ${run.inputs.monthly_revenue/1000}k
                </td>
                <td className="px-6 py-4 font-mono text-teal-400">
                  ${run.output.optimal_price_point.toFixed(2)}
                </td>
                <td className="px-6 py-4 font-mono text-[var(--text-primary)]">
                  {run.output.verified_runway_months} mo
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href="/dashboard" 
                    onClick={() => selectRun(run.id)}
                    className="text-teal-500 hover:text-teal-400 text-xs font-semibold uppercase tracking-wider"
                  >
                    Load &rarr;
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
