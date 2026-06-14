"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceDot
} from "recharts";
import type { SensitivityPoint } from "@/lib/types";

interface SensitivityChartProps {
  data: SensitivityPoint[];
  optimalPrice: number;
}

export default function SensitivityChart({ data, optimalPrice }: SensitivityChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-full min-h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis 
            dataKey="price" 
            stroke="var(--text-secondary)"
            tickFormatter={(val) => `$${val}`}
            label={{ value: 'Price Point ($)', position: 'bottom', fill: 'var(--text-secondary)' }}
          />
          <YAxis 
            stroke="var(--text-secondary)"
            label={{ value: 'Runway (Months)', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [`${value} months`, "Runway"]}
            labelFormatter={(label) => `Price: $${Number(label).toFixed(2)}`}
          />
          <Line
            type="monotone"
            dataKey="runway_months"
            stroke="var(--accent)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: "var(--accent)", stroke: "var(--bg-primary)" }}
          />
          <ReferenceDot 
            x={optimalPrice} 
            y={data.find(d => Math.abs(d.price - optimalPrice) < 0.1)?.runway_months} 
            r={6} 
            fill="var(--accent)" 
            stroke="var(--bg-primary)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
