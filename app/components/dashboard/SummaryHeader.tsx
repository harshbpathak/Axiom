"use client";

import type { ComputationResponse } from "@/lib/types";

export default function SummaryHeader({ result }: { result: ComputationResponse | null }) {
  if (!result) {
    return (
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-500">
          Awaiting Data
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Ready for Analysis</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Enter your metrics to run a verified simulation.
        </p>
      </header>
    );
  }

  return (
    <header>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-500">
        Runway Extrapolated
      </p>
      <h2 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
        Projected Runway: {result.verified_runway_months} months
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)]">
        {result.executive_summary}
      </p>
    </header>
  );
}
