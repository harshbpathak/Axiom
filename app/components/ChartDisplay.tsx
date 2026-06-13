"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/lib/types";

interface ChartDisplayProps {
  data: ChartPoint[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ChartDisplay({ data }: ChartDisplayProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/40 text-slate-500">
        Run a computation to see your runway projection.
      </div>
    );
  }

  const merged = data.reduce<
    Record<number, { month: number; historical?: number; projected?: number }>
  >((acc, point) => {
    const existing = acc[point.month] ?? { month: point.month };
    if (point.historical != null) existing.historical = point.historical;
    if (point.projected != null) existing.projected = point.projected;
    acc[point.month] = existing;
    return acc;
  }, {});

  const chartData = Object.values(merged).sort((a, b) => a.month - b.month);

  return (
    <div className="h-full min-h-[320px] rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Runway Projection</h2>
        <p className="text-sm text-slate-400">
          Historical cash balance vs. Wolfram-verified forecast
        </p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            tickFormatter={(m) => (m <= 0 ? `M${m}` : `+${m}mo`)}
          />
          <YAxis stroke="#94a3b8" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "8px",
            }}
            labelFormatter={(m) => `Month ${m}`}
            formatter={(value) => formatCurrency(Number(value))}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="historical"
            name="Historical"
            stroke="#64748b"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="projected"
            name="Wolfram Projected"
            stroke="#0d9488"
            strokeWidth={3}
            dot={{ r: 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
