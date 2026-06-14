"use client";

import { ArrowUpRight, Clock, DollarSign } from "lucide-react";
import type { ComputationResponse } from "@/lib/types";
import Link from "next/link";

interface ActionCardsProps {
  result: ComputationResponse | null;
}

const cardMeta = [
  { icon: Clock, title: "Verified Runway", key: "runway" as const, href: "/forecast" },
  { icon: DollarSign, title: "Optimal Pricing", key: "price" as const, href: "/pricing" },
  { icon: ArrowUpRight, title: "Strategic Action", key: "insight" as const, href: null },
];

export default function ActionCards({ result }: ActionCardsProps) {
  if (!result) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {cardMeta.map(({ title }) => (
          <div
            key={title}
            className="rounded-xl border border-dashed border-[var(--border)] bg-slate-900/30 p-5 text-[var(--text-secondary)]"
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
      {cards.map(({ icon: Icon, title, value, detail, href }) => {
        const content = (
          <>
            <div className="mb-3 flex items-center justify-between text-teal-400">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">{title}</h3>
              </div>
              {href && <span className="text-[10px] uppercase text-teal-500/70">View details &rarr;</span>}
            </div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{value}</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{detail}</p>
          </>
        );

        const className = "block rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 transition hover:border-teal-700/50";

        if (href) {
          return (
            <Link key={title} href={href} className={className}>
              {content}
            </Link>
          );
        }

        return (
          <article key={title} className={className}>
            {content}
          </article>
        );
      })}
    </div>
  );
}
