"use client";
import { Terminal } from "lucide-react";
import { useState } from "react";
import { useAxiomStore } from "@/lib/axiom/store";
import { VerifiedTag } from "@/components/axiom/VerifiedTag";
import { EmptyState } from "@/components/axiom/EmptyState";
import { AgentFeed, buildLogsFromTrace } from "@/components/axiom/AgentFeed";

type Tab = "strategist" | "quant" | "architect";

export default function Page() {
  const runs = useAxiomStore((s) => s.runs);
  const activeId = useAxiomStore((s) => s.activeRunId);
  const selectRun = useAxiomStore((s) => s.selectRun);
  const [tab, setTab] = useState<Tab>("strategist");

  if (runs.length === 0) {
    return (
      <div className="p-6">
        <EmptyState icon={Terminal} title="No agent traces" message="Run an analysis to see agent reasoning here." actionLabel="Go to Dashboard →" onAction={() => (window.location.href = "/dashboard")} />
      </div>
    );
  }

  const run = runs.find((r) => r.id === activeId) ?? runs[0];
  const trace = run.output.trace;
  const logs = buildLogsFromTrace(trace, run.output.verifiedRunwayMonths);

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Run selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
            Viewing
          </span>
          <select
            value={run.id}
            onChange={(e) => selectRun(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-1.5 font-mono text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
          >
            {runs.map((r) => (
              <option key={r.id} value={r.id}>{r.label} [{r.id}]</option>
            ))}
          </select>
        </div>
        <VerifiedTag mode={run.output.wolframMode === "mocked" ? "mocked" : "verified"} />
      </div>

      {/* Full terminal */}
      <AgentFeed lines={[...logs, ...logs.slice(0, 2)]} height="h-48" />

      {/* Tabs */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)]">
        <div className="flex border-b border-[var(--border)]">
          {(["strategist", "quant", "architect"] as Tab[]).map((t) => {
            const active = tab === t;
            const color = t === "strategist" ? "text-[var(--accent)]" : t === "quant" ? "text-purple-400" : "text-amber-400";
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-3 font-mono text-[10px] uppercase tracking-widest ${active ? `${color} border-b-2 border-current` : "text-[var(--text-secondary)]"}`}
              >
                {t}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {tab === "strategist" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CodeBlock title="Prompt → Gemini 1.5 Pro" body={trace.strategist.prompt} />
              <CodeBlock title="Structured ComputationRequest" body={JSON.stringify(trace.strategist.request, null, 2)} highlight />
              <div className="md:col-span-2">
                <DurationBadge ms={trace.strategist.durationMs} />
              </div>
            </div>
          )}

          {tab === "quant" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <VerifiedTag mode={trace.quant.wolframMode === "mocked" ? "mocked" : "verified"} label={`Wolfram: ${trace.quant.wolframMode.toUpperCase()}`} />
              </div>
              <CodeBlock title="Wolfram Expression Executed" body={trace.quant.wlExpression} highlight />
              <CodeBlock title="Raw Result" body={JSON.stringify(trace.quant.result, null, 2)} />
              <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
                <Badge>Execution: {trace.quant.executionMs}ms</Badge>
                <Badge>Retries: {trace.quant.retries}</Badge>
                <Badge>Mode: {trace.quant.wolframMode.toUpperCase()}</Badge>
              </div>
            </div>
          )}

          {tab === "architect" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CodeBlock title="Prompt → Gemini Flash" body={trace.architect.prompt} />
              <div className="rounded-lg border border-[var(--border)] bg-[var(--code-bg)] p-4">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
                  Final Response
                </div>
                <div className="border-l-2 border-[var(--accent)] bg-[var(--accent-glow)] p-3 font-mono text-xs leading-relaxed text-[var(--text-primary)]">
                  <div className="mb-1 text-[10px] uppercase tracking-widest text-[var(--accent)]">executive_summary</div>
                  {run.output.executiveSummary}
                </div>
                <pre className="mt-3 overflow-x-auto font-mono text-[11px] text-[var(--text-secondary)]">
{`verifiedRunwayMonths: ${run.output.verifiedRunwayMonths}
optimalPricePoint:    ${run.output.optimalPricePoint}
wolframMode:          "${run.output.wolframMode}"`}
                </pre>
              </div>
              <div className="md:col-span-2">
                <DurationBadge ms={trace.architect.durationMs} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ title, body, highlight }: { title: string; body: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--code-bg)] p-4">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
        {title}
      </div>
      <pre className={`overflow-x-auto font-mono text-xs leading-relaxed ${highlight ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}>
        {body}
      </pre>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-[var(--border)] bg-[var(--bg-primary)] px-2 py-1">
      {children}
    </span>
  );
}

function DurationBadge({ ms }: { ms: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
      Duration: <span className="text-[var(--accent)]">{ms.toLocaleString()}ms</span>
    </span>
  );
}

