"use client";

import { Calculator, DollarSign, Flame, Target } from "lucide-react";
import type { StrategyInput } from "@/lib/types";

interface MetricsInputPanelProps {
  values: StrategyInput;
  onChange: (values: StrategyInput) => void;
  onCompute: () => void;
  isComputing: boolean;
}

const fields = [
  {
    key: "cash_reserve" as const,
    label: "Current Cash in Bank",
    prefix: "$",
    icon: DollarSign,
    type: "number",
    placeholder: "250000",
  },
  {
    key: "monthly_burn" as const,
    label: "Monthly Burn Rate",
    prefix: "$",
    icon: Flame,
    type: "number",
    placeholder: "45000",
  },
  {
    key: "monthly_revenue" as const,
    label: "Monthly Revenue",
    prefix: "$",
    icon: Calculator,
    type: "number",
    placeholder: "18000",
  },
];

export default function MetricsInputPanel({
  values,
  onChange,
  onCompute,
  isComputing,
}: MetricsInputPanelProps) {
  const updateField = <K extends keyof StrategyInput>(key: K, value: StrategyInput[K]) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-700/60 bg-slate-900/80 p-6 lg:w-80 lg:shrink-0">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400">
          Axiom
        </p>
        <h1 className="mt-1 text-xl font-semibold text-white">Mission Control</h1>
        <p className="mt-2 text-sm text-slate-400">
          Enter your financial metrics and strategic goal.
        </p>
      </div>

      <form
        className="flex flex-1 flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          onCompute();
        }}
      >
        {fields.map(({ key, label, prefix, icon: Icon, type, placeholder }) => (
          <label key={key} className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
              <Icon className="h-4 w-4 text-teal-500" />
              {label}
            </span>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                {prefix}
              </span>
              <input
                type={type}
                min={0}
                step={key === "cash_reserve" ? 1000 : 100}
                required
                disabled={isComputing}
                value={values[key] || ""}
                placeholder={placeholder}
                onChange={(e) =>
                  updateField(key, key === "goal_prompt" ? e.target.value : Number(e.target.value))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2.5 pl-7 pr-3 text-sm text-white outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-60"
              />
            </div>
          </label>
        ))}

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
            <Target className="h-4 w-4 text-teal-500" />
            Strategic Goal
          </span>
          <textarea
            required
            rows={4}
            disabled={isComputing}
            value={values.goal_prompt}
            placeholder="Extend runway to 18 months while increasing pricing for enterprise tier..."
            onChange={(e) => updateField("goal_prompt", e.target.value)}
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-60"
          />
        </label>

        <button
          type="submit"
          disabled={isComputing}
          className="mt-auto rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isComputing ? "Computing..." : "Compute Strategy"}
        </button>
      </form>
    </aside>
  );
}
