"use client";

import { useEffect, useState } from "react";
import { fetchHealth } from "@/lib/api";
import type { HealthResponse } from "@/lib/types";

export default function StatusBadge() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await fetchHealth();
        setHealth(data);
      } catch (err) {
        setHealth({ status: "error", wolfram_available: false, gemini_configured: false, wolfram_mode: "unknown" });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!health) {
    return <div className="h-2 w-2 rounded-full bg-slate-600 animate-pulse" />;
  }

  const isHealthy = health.wolfram_available && health.gemini_configured;

  return (
    <div className="flex items-center gap-2">
      {health.wolfram_mode === "mocked" && (
        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Mocked
        </span>
      )}
      <div className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1">
        <div
          className={`h-2 w-2 rounded-full ${
            isHealthy ? "bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" : "bg-[var(--danger)] shadow-[0_0_8px_rgba(220,38,38,0.5)]"
          }`}
        />
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          {isHealthy ? "System Ready" : "Degraded"}
        </span>
      </div>
    </div>
  );
}
