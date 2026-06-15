import { motion } from "framer-motion";

export interface AgentLogLine {
  ts: string;
  agent: "strategist" | "quant" | "architect" | "system";
  message: string;
}

const COLORS: Record<AgentLogLine["agent"], string> = {
  strategist: "text-[var(--accent)]",
  quant: "text-purple-400",
  architect: "text-amber-400",
  system: "text-[var(--text-secondary)]",
};

export function AgentFeed({
  lines,
  height = "h-48",
}: {
  lines: AgentLogLine[];
  height?: string;
}) {
  return (
    <div
      className={`overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-3 font-mono text-[11px] leading-relaxed ${height}`}
    >
      {lines.map((l, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.25 }}
          className="flex gap-2"
        >
          <span className="text-[var(--secondary)]">[{l.ts}]</span>
          <span className={`${COLORS[l.agent]} w-20 shrink-0`}>{l.agent}</span>
          <span className="text-[var(--secondary)]">›</span>
          <span className="text-[var(--text-primary)]">{l.message}</span>
        </motion.div>
      ))}
    </div>
  );
}

export function buildLogsFromTrace(trace: {
  strategist: { durationMs: number };
  quant: { wlExpression: string; executionMs: number; retries: number };
  architect: { durationMs: number };
}, runwayMonths: number): AgentLogLine[] {
  return [
    { ts: "09:22:11", agent: "strategist", message: "Synthesizing historical series from inputs..." },
    { ts: "09:22:12", agent: "strategist", message: `ComputationRequest dispatched to Quant (${trace.strategist.durationMs}ms)` },
    { ts: "09:22:12", agent: "quant", message: `Executing: ${trace.quant.wlExpression.slice(0, 56)}${trace.quant.wlExpression.length > 56 ? "…" : ""}` },
    { ts: "09:22:12", agent: "quant", message: `✓ Wolfram result in ${trace.quant.executionMs}ms (retries: ${trace.quant.retries})` },
    { ts: "09:22:13", agent: "architect", message: "Composing executive summary..." },
    { ts: "09:22:13", agent: "system", message: `✓ Analysis complete — ${runwayMonths} months runway verified` },
  ];
}
