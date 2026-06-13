"use client";

import { Terminal } from "lucide-react";

interface AgentFeedProps {
  steps: string[];
  isActive: boolean;
}

export default function AgentFeed({ steps, isActive }: AgentFeedProps) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-950/80 p-4 font-mono text-sm">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
        <Terminal className="h-4 w-4 text-teal-500" />
        Agent Swarm Feed
      </div>
      <div className="max-h-36 space-y-1 overflow-y-auto">
        {steps.length === 0 && !isActive && (
          <p className="text-slate-600">Awaiting computation...</p>
        )}
        {steps.map((step, index) => (
          <p key={`${step}-${index}`} className="text-teal-300/90">
            {step}
          </p>
        ))}
        {isActive && (
          <p className="animate-pulse text-slate-500">
            {">"} Agents processing...
          </p>
        )}
      </div>
    </div>
  );
}
