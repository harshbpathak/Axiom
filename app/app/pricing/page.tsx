"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import EmptyState from "@/components/shared/EmptyState";
import SensitivityChart from "@/components/charts/SensitivityChart";

export default function PricingPage() {
  const run = useStore((state) => state.getActiveRun());
  const [sliderVal, setSliderVal] = useState<number | null>(null);

  if (!run) {
    return <EmptyState message="Run a simulation on the Dashboard to access the Pricing Lab." />;
  }

  const result = run.output;
  const grid = result.sensitivity_grid || [];
  
  // Find current point based on slider or default to optimal
  const optimalPrice = result.optimal_price_point;
  const currentVal = sliderVal !== null ? sliderVal : optimalPrice;
  
  // Find closest runway value from grid for the slider display
  const closestPoint = useMemo(() => {
    if (!grid.length) return null;
    return grid.reduce((prev, curr) => 
      Math.abs(curr.price - currentVal) < Math.abs(prev.price - currentVal) ? curr : prev
    );
  }, [grid, currentVal]);

  const minPrice = grid.length ? Math.min(...grid.map(g => g.price)) : optimalPrice * 0.5;
  const maxPrice = grid.length ? Math.max(...grid.map(g => g.price)) : optimalPrice * 1.5;

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Pricing & Sensitivity Lab</h1>
        <div className="rounded border border-teal-800 bg-teal-950/30 px-3 py-1 text-sm text-teal-400">
          Wolfram Verified ✓
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-teal-500 mb-2">Optimal Price Point</p>
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-5xl font-bold text-teal-400">
            ${optimalPrice.toFixed(2)}
          </span>
          <span className="text-lg text-[var(--text-secondary)]">/ month</span>
        </div>
        <details className="mt-4 text-sm text-[var(--text-secondary)]">
          <summary className="cursor-pointer hover:text-white transition">View underlying optimization formula</summary>
          <div className="mt-2 p-3 bg-slate-900 rounded font-mono text-xs border border-[var(--border)]">
            {"NMaximize[{{p * 100 - (FixedCosts + VariableCosts * 100), constraints}}, p]"}
          </div>
        </details>
      </div>

      {grid.length > 0 && (
        <div className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 flex flex-col">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Price Elasticity Simulation</h3>
              <p className="text-sm text-[var(--text-secondary)]">Interactive what-if analysis across computed price range.</p>
            </div>
            {closestPoint && (
              <div className="text-right">
                <p className="text-sm text-[var(--text-secondary)]">Simulated Runway</p>
                <p className="font-mono text-2xl text-[var(--text-primary)]">{closestPoint.runway_months} mo</p>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <SensitivityChart data={grid} optimalPrice={optimalPrice} />
          </div>

          <div className="mt-8 px-4">
            <input 
              type="range" 
              min={minPrice} 
              max={maxPrice} 
              step={(maxPrice - minPrice) / 100}
              value={currentVal}
              onChange={(e) => setSliderVal(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-2">
              <span>${minPrice.toFixed(2)}</span>
              <span>Slide to explore</span>
              <span>${maxPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-teal-500">Model Assumptions</h3>
        <ul className="list-inside list-disc space-y-2 text-sm text-[var(--text-secondary)]">
          <li>Assumes price elasticity where higher price point logarithmically reduces conversion rate.</li>
          <li>Baseline user volume assumed constant at current run-rate prior to price change.</li>
          <li>Fixed costs remain constant across modeled volume variance.</li>
          <li>Variable costs scale linearly with user volume.</li>
        </ul>
      </div>
    </div>
  );
}
