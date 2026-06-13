"use client";

import { ArrowUpRight, Clock, DollarSign } from "lucide-react";
import type { ComputationResponse } from "@/lib/types";

interface ActionCardsProps {
  result: ComputationResponse | null;
}

const cardMeta = [
  { icon: Clock, title: "Verified Runway", key: "runway" as const },
  { icon: DollarSign, title: "Optimal Pricing", key: "price" as const },
  { icon: ArrowUpRight, title: "Strategic Action", key: "insight" as const },
];

export default function ActionCards({ result }: ActionCardsProps) {
  if (!result) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {cardMeta.map(({ title }) => (
          <div
            key={title}
            className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-5 text-slate-500"
          >
            {title}
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      ...cardMeta[0],
      value: `${result.verified_runway_months} months`,
      detail: "Mathematically verified at current burn and revenue.",
    },
    {
      ...cardMeta[1],
      value: `$${result.optimal_price_point.toFixed(2)}/mo`,
      detail: "Price point optimized to maximize runway.",
    },
    {
      ...cardMeta[2],
      value: result.action_insights[0] ?? "Review strategic options",
      detail: result.action_insights[1] ?? result.executive_summary,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map(({ icon: Icon, title, value, detail }) => (
        <article
          key={title}
          className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-5 transition hover:border-teal-700/50"
        >
          <div className="mb-3 flex items-center gap-2 text-teal-400">
            <Icon className="h-4 w-4" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">{title}</h3>
          </div>
          <p className="text-lg font-semibold text-white">{value}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{detail}</p>
        </article>
      ))}
    </div>
  );
}
