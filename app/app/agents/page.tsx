"use client";

import { useStore } from "@/lib/store";
import EmptyState from "@/components/shared/EmptyState";
import AgentFeed from "@/components/AgentFeed";

export default function AgentsPage() {
  const run = useStore((state) => state.getActiveRun());

  if (!run) {
    return <EmptyState message="Run a simulation on the Dashboard to see agent traces." />;
  }

  const trace = run.output.trace;

  if (!trace) {
    return (
      <EmptyState message="No detailed trace available for this run. Newer runs will include full agent execution logs." />
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Agent Console</h1>
        <div className="rounded border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm text-slate-300 font-mono">
          Run ID: {run.id.split("-")[0]}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
        
        {/* Strategist Panel */}
        <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden">
          <div className="bg-slate-800/50 px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="font-semibold text-[var(--text-primary)]">Strategist Node</h3>
            <span className="text-[10px] uppercase tracking-wider text-teal-500">Gemini 1.5 Pro</span>
          </div>
          <div className="flex-1 p-4 overflow-auto text-sm space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Input Prompt</h4>
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-300 bg-slate-900 p-3 rounded border border-slate-800">
                {trace.strategist?.prompt || "N/A"}
              </pre>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Parsed Request Object</h4>
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-teal-400/80 bg-slate-900 p-3 rounded border border-slate-800">
                {JSON.stringify(trace.strategist?.request, null, 2) || "N/A"}
              </pre>
            </div>
            {trace.strategist?.error && (
              <div>
                <h4 className="text-xs font-semibold uppercase text-red-500 mb-2">Execution Error</h4>
                <div className="text-xs text-red-400 bg-red-950/30 p-3 rounded border border-red-900/50">
                  {trace.strategist.error}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quant Panel */}
        <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden">
          <div className="bg-slate-800/50 px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="font-semibold text-[var(--text-primary)]">Quant Node</h3>
            <span className="text-[10px] uppercase tracking-wider text-teal-500">
              {trace.quant?.wolfram_mode === "local_kernel" ? "Wolfram Kernel" : 
               trace.quant?.wolfram_mode === "mocked" ? "Python Fallback" : "Wolfram Cloud"}
            </span>
          </div>
          <div className="flex-1 p-4 overflow-auto text-sm space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Execution Metrics</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="block text-slate-500 mb-1">Compute Time</span>
                  <span className="font-mono text-slate-300">{Math.round(trace.quant?.execution_ms || 0)}ms</span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="block text-slate-500 mb-1">Retries</span>
                  <span className="font-mono text-slate-300">{trace.quant?.retries || 0}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">WL Expression (Abstracted)</h4>
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-300 bg-slate-900 p-3 rounded border border-slate-800">
                {trace.quant?.wl_expression || "LinearModelFit[...]\nNMaximize[...]"}
              </pre>
            </div>
          </div>
        </div>

        {/* Architect Panel */}
        <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden">
          <div className="bg-slate-800/50 px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="font-semibold text-[var(--text-primary)]">Architect Node</h3>
            <span className="text-[10px] uppercase tracking-wider text-teal-500">Gemini 1.5 Flash</span>
          </div>
          <div className="flex-1 p-4 overflow-auto text-sm space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Input Payload</h4>
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-300 bg-slate-900 p-3 rounded border border-slate-800">
                {typeof trace.architect?.prompt === 'string' 
                  ? trace.architect.prompt 
                  : JSON.stringify(trace.architect?.prompt, null, 2) || "N/A"}
              </pre>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Generated Output</h4>
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-teal-400/80 bg-slate-900 p-3 rounded border border-slate-800">
                {JSON.stringify(trace.architect?.response, null, 2) || "N/A"}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
