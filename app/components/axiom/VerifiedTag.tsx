import { ShieldCheck, AlertTriangle, X } from "lucide-react";

type Mode = "verified" | "mocked" | "degraded";

export function VerifiedTag({ mode, label }: { mode: Mode; label?: string }) {
  const styles: Record<Mode, string> = {
    verified:
      "bg-[var(--accent-glow)] text-[var(--accent)] border-[var(--accent)]/30",
    mocked:
      "bg-amber-900/20 text-amber-400 border-amber-700/30",
    degraded: "bg-red-900/20 text-red-400 border-red-700/30",
  };
  const labels: Record<Mode, string> = {
    verified: "Wolfram-Verified",
    mocked: "Fallback",
    degraded: "Degraded",
  };
  const Icon = mode === "verified" ? ShieldCheck : mode === "mocked" ? AlertTriangle : X;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${styles[mode]}`}
    >
      <Icon className="h-3 w-3" />
      {label ?? labels[mode]}
    </span>
  );
}
