"use client";
import Link from "next/link";
import { Fragment as FragmentWithKey } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Brain,
  Clock,
  TrendingUp,
  SlidersHorizontal,
  FlaskConical,
  Terminal,
  GitCompare,
  ShieldCheck,
  ArrowRight,
  ArrowDown,
  Menu,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MOCK_RUNS } from "@/lib/axiom/mockData";
import { fmtCurrency } from "@/lib/axiom/store";
import { DarkTooltip } from "@/components/axiom/ChartTooltip";


const NAV_LINKS = [
  { href: "#how", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#agents", label: "Agent Stack" },
  { href: "#cta", label: "Pricing" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <LiveDemo />
      <Trust />
      <CTABanner />
      <Footer />
    </div>
  );
}

/* ---------- NAVBAR ---------- */
function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-primary)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-mono text-sm font-bold uppercase tracking-[0.35em] text-[var(--accent)]">
          AXIOM
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/dashboard"
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dim)]"
          >
            Launch App →
          </Link>
        </nav>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded p-1.5 text-[var(--text-secondary)] md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--panel)] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/dashboard"
              className="mt-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Launch App →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-20 sm:px-6">
      <div className="axiom-grid-bg pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-1/3 mx-auto h-96 w-96 rounded-full bg-[var(--accent)] opacity-[0.08] blur-[120px]" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-glow)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--accent)]"
        >
          [ Computational AI × Wolfram Engine ]
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Your startup's financial model,
          <br />
          <span className="text-[var(--accent)]">computed — not guessed.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 max-w-2xl text-base text-[var(--text-secondary)] sm:text-lg"
        >
          Axiom combines Gemini AI reasoning with Wolfram Language computation to deliver
          mathematically verified runway forecasts and pricing optimization — not hallucinated estimates.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dim)]"
          >
            Run Your First Analysis <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            See How It Works <ArrowDown className="h-4 w-4" />
          </a>
        </motion.div>

        <div className="mt-10 flex w-full max-w-5xl gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible">
          {[
            "Wolfram-Verified Results",
            "3-Agent AI Pipeline",
            "Real-Time Sensitivity Analysis",
            "Zero Hallucinated Numbers",
          ].map((t) => (
            <span
              key={t}
              className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]"
            >
              [ {t} ]
            </span>
          ))}
        </div>

        {/* Hero visual: mock dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mt-16 w-full max-w-5xl"
        >
          <div className="absolute -inset-4 rounded-2xl bg-[var(--accent)] opacity-20 blur-3xl" />
          <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-2xl">
            {/* Mock browser chrome */}
            <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2.5">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
              </div>
              <div className="mx-auto rounded bg-[var(--panel)] px-3 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]">
                axiom.app/dashboard
              </div>
            </div>
            <HeroMockChart />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HeroMockChart() {
  const data = MOCK_RUNS[0].output.chartCoordinates;
  return (
    <div className="grid grid-cols-1 gap-0 md:grid-cols-[200px_1fr]">
      <div className="border-b border-[var(--border)] p-4 md:border-b-0 md:border-r">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">AXIOM</div>
        <div className="mt-6 space-y-2 text-left">
          {["Dashboard", "Forecast", "Pricing Lab", "Past Runs", "Agent Console"].map((l, i) => (
            <div
              key={l}
              className={`rounded px-3 py-1.5 text-xs ${
                i === 0 ? "bg-[var(--panel-hover)] text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
              }`}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
              Projected Runway
            </div>
            <div className="mt-1 font-mono text-3xl font-bold text-[var(--accent)]">14 months</div>
          </div>
          <span className="rounded border border-[var(--accent)]/30 bg-[var(--accent-glow)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">
            Wolfram ✓
          </span>
        </div>
        <div className="mt-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ left: 24, right: 10, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#334155" opacity={0.4} />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={{ stroke: "#334155" }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10, fontFamily: "IBM Plex Mono" }} tickFormatter={(v) => fmtCurrency(v, { compact: true })} axisLine={{ stroke: "#334155" }} />
              <Area type="monotone" dataKey="confidenceHigh" stroke="none" fill="#0d9488" fillOpacity={0.12} />
              <Area type="monotone" dataKey="confidenceLow" stroke="none" fill="#0f172a" fillOpacity={1} />
              <Line type="monotone" dataKey="balance" stroke="#0d9488" strokeWidth={2} dot={false} isAnimationActive />
              <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="4 4" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ---------- PROBLEM ---------- */
function Problem() {
  const items = [
    { icon: AlertTriangle, title: "Excel Models Break", body: "Manual spreadsheets with hardcoded assumptions that shatter on first contact with reality." },
    { icon: Brain, title: "AI Hallucinates Numbers", body: "Generic LLMs give confident but mathematically unverified financial projections." },
    { icon: Clock, title: "Advisors Take Weeks", body: "Finance consultants charge $400/hr and take 2 weeks to produce what Axiom does in 8 seconds." },
  ];
  return (
    <section className="border-t border-[var(--border)] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Founders make million-dollar decisions on{" "}
          <span className="text-[var(--danger)]">spreadsheet guesses.</span>
        </h2>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6"
            >
              <it.icon className="h-7 w-7 text-[var(--danger)]" />
              <h3 className="mt-4 text-lg font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{it.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="h-px flex-1 max-w-xs bg-gradient-to-r from-transparent via-[var(--accent)] to-[var(--accent)]" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Axiom Solves This →
          </span>
          <div className="h-px flex-1 max-w-xs bg-gradient-to-l from-transparent via-[var(--accent)] to-[var(--accent)]" />
        </div>
      </div>
    </section>
  );
}

/* ---------- HOW IT WORKS ---------- */
function HowItWorks() {
  const agents = [
    { name: "Strategist", model: "Gemini 1.5 Pro", desc: "Interprets goals, structures the computation query.", color: "text-[var(--accent)]" },
    { name: "Quant", model: "Wolfram Engine", desc: "Computes mathematically exact results.", color: "text-purple-400" },
    { name: "Architect", model: "Gemini Flash", desc: "Synthesizes plain-language executive summary.", color: "text-amber-400" },
  ];

  const logLines = [
    "[09:22:11] strategist › Synthesizing historical series from 3 inputs...",
    "[09:22:12] strategist › ComputationRequest dispatched to Quant",
    "[09:22:12] quant › Executing: TimeSeriesForecast[{...}, {14}]",
    "[09:22:12] quant › ✓ Wolfram result in 312ms",
    "[09:22:13] architect › Composing executive summary...",
    "[09:22:13] ✓ Analysis complete — 14 months runway verified",
  ];

  return (
    <section id="how" className="border-t border-[var(--border)] bg-[var(--panel)]/30 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Three agents. <span className="text-[var(--accent)]">One verified answer.</span>
          </h2>
          <p className="mt-4 text-base text-[var(--text-secondary)]">
            Every computation is traceable, reproducible, and mathematically grounded.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {agents.map((a, i) => (
            <FragmentWithKey key={a.name}>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
                <div className={`font-mono text-[10px] uppercase tracking-widest ${a.color}`}>
                  {a.name}
                </div>
                <div className="mt-1 text-base font-semibold">{a.model}</div>
                <p className="mt-3 text-xs text-[var(--text-secondary)]">{a.desc}</p>
              </div>
              {i < agents.length - 1 && (
                <div className="hidden h-px w-10 axiom-flow-line md:block" />
              )}
            </FragmentWithKey>
          ))}
        </div>

        <div className="mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
          ↑ Retry loop: error → Strategist reformulates (max 2 retries)
        </div>

        {/* Animated terminal log */}
        <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-4 font-mono text-[11px] leading-relaxed">
          {logLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.25, duration: 0.3 }}
              className="text-[var(--text-secondary)]"
            >
              <span className="text-[var(--text-primary)]">{line}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FEATURES ---------- */
function Features() {
  const features = [
    { icon: TrendingUp, title: "Runway Forecasting", body: "Wolfram TimeSeriesForecast projects your cash balance with confidence bands — month by month." },
    { icon: SlidersHorizontal, title: "Pricing Optimization", body: "NMaximize finds the exact price point that maximizes revenue given your cost structure and elasticity." },
    { icon: FlaskConical, title: "Sensitivity Lab", body: "Drag a slider across a precomputed ±20% price grid. See runway change in real-time without a new API call." },
    { icon: Terminal, title: "Agent Console", body: "Full reasoning transparency. See every prompt, every Wolfram expression, every retry — not a black box." },
    { icon: GitCompare, title: "Scenario Comparison", body: "Run multiple scenarios and overlay them on a single chart. Diff your assumptions in a table." },
    { icon: ShieldCheck, title: "Verified, Not Estimated", body: "Every number carries a wolfram_mode tag. You always know if a result is kernel-verified or mocked." },
  ];
  return (
    <section id="features" className="border-t border-[var(--border)] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Everything a CFO would compute. <span className="text-[var(--accent)]">Done by AI in seconds.</span>
        </h2>
        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 transition-colors hover:border-[var(--accent)]"
            >
              <f.icon className="h-7 w-7 text-[var(--accent)]" strokeWidth={1.75} />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- LIVE DEMO ---------- */
function LiveDemo() {
  const [burn, setBurn] = useState(62);
  const [revenue, setRevenue] = useState(18);
  const [price, setPrice] = useState(149);
  const cash = 850;

  const sensitivityGrid = MOCK_RUNS[0].output.sensitivityGrid;

  const runway = useMemo(() => {
    // interpolate sensitivity grid by price, then adjust by burn/revenue delta
    const base = sensitivityGrid.reduce((a, b) =>
      Math.abs(b.price - price) < Math.abs(a.price - price) ? b : a
    ).runwayMonths;
    const burnDelta = (62 - burn) * 0.18;
    const revDelta = (revenue - 18) * 0.22;
    return Math.max(1, Math.round(base + burnDelta + revDelta));
  }, [burn, revenue, price, sensitivityGrid]);

  const chartData = useMemo(() => {
    const monthly = (revenue - burn) * 1000;
    const data = [];
    let bal = cash * 1000;
    for (let m = 0; m <= Math.max(runway + 2, 18); m++) {
      data.push({ month: m, balance: Math.round(bal) });
      bal += monthly;
    }
    return data;
  }, [burn, revenue, runway]);

  return (
    <section className="border-t border-[var(--border)] bg-[var(--panel)]/30 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          See the <span className="text-[var(--accent)]">numbers move.</span>
        </h2>
        <p className="mt-4 text-center text-[var(--text-secondary)]">
          Drag a slider. The forecast updates instantly — no API call.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
            <Slider label="Monthly Burn" value={burn} min={45} max={90} step={1} unit="k" onChange={setBurn} />
            <Slider label="Monthly Revenue" value={revenue} min={10} max={40} step={1} unit="k" onChange={setRevenue} />
            <Slider label="Price Point" value={price} min={89} max={179} step={10} unit="$" prefix onChange={setPrice} />
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
            <div className="flex items-end justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
                  Projected Runway
                </div>
                <div className="mt-1 font-mono text-5xl font-bold text-[var(--accent)]">
                  {runway} <span className="text-2xl text-[var(--text-secondary)]">months</span>
                </div>
              </div>
              <span className="rounded border border-[var(--accent)]/30 bg-[var(--accent-glow)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">
                Live preview
              </span>
            </div>
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ left: 24, right: 10, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={{ stroke: "#334155" }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11, fontFamily: "IBM Plex Mono" }} tickFormatter={(v) => fmtCurrency(v, { compact: true })} axisLine={{ stroke: "#334155" }} />
                  <Tooltip content={<DarkTooltip />} />
                  <Line type="monotone" dataKey="balance" name="Balance" stroke="#0d9488" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="4 4" label={{ value: "Cash Zero", fill: "#dc2626", fontSize: 10, position: "right" }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dim)]"
              >
                Run a real analysis with your numbers <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({
  label, value, min, max, step, unit, prefix, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number; unit: string; prefix?: boolean;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
          {label}
        </span>
        <span className="font-mono text-sm font-semibold text-[var(--accent)]">
          {prefix ? `$${value}` : `$${value}${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="axiom-range mt-3 w-full"
      />
      <div className="mt-1 flex justify-between font-mono text-[10px] text-[var(--secondary)]">
        <span>{prefix ? `$${min}` : `$${min}${unit}`}</span>
        <span>{prefix ? `$${max}` : `$${max}${unit}`}</span>
      </div>
    </div>
  );
}

/* ---------- TRUST ---------- */
function Trust() {
  return (
    <section id="agents" className="border-t border-[var(--border)] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Mathematically grounded. <span className="text-[var(--accent)]">Not prompt-engineered guesses.</span>
        </h2>
        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <p className="text-base leading-relaxed text-[var(--text-secondary)]">
              Wolfram Language's <span className="text-[var(--text-primary)] font-mono">TimeSeriesForecast</span> implements proper
              ARIMA / state-space models. <span className="text-[var(--text-primary)] font-mono">NMaximize</span> runs Nelder-Mead
              or interior point methods. These are deterministic algorithms — not stochastic predictions.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
              When Axiom returns a number, it carries a <span className="font-mono text-[var(--accent)]">wolfram_mode</span> tag.
              You always know whether the result is kernel-verified or sandbox-mocked. No silent hallucination.
            </p>
          </div>
          <div className="relative rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-6 font-mono text-xs leading-relaxed text-[var(--text-secondary)]">
            <span className="absolute right-3 top-3 rounded border border-[var(--accent)]/30 bg-[var(--accent-glow)] px-2 py-0.5 text-[9px] uppercase tracking-widest text-[var(--accent)]">
              Wolfram Language
            </span>
            <pre className="overflow-x-auto"><code>{`(* Wolfram Language — actual computation *)

TimeSeriesForecast[
  {640000, 674000, 710000, 762000, 808000, 850000},
  {14}
]
(* → {806000, 762000, 718000, ...} *)

NMaximize[
  {revenue[p] - cost[p], 89 <= p <= 179},
  p
]
(* → {17, {p -> 149}} *)`}</code></pre>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA BANNER ---------- */
function CTABanner() {
  return (
    <section id="cta" className="relative overflow-hidden border-t border-[var(--border)] px-4 py-24 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--accent-glow)] via-transparent to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-10 blur-3xl" />
      <div className="relative mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Stop guessing. <span className="text-[var(--accent)]">Start computing.</span>
        </h2>
        <p className="mt-6 text-lg text-[var(--text-secondary)]">
          Axiom gives you the financial clarity of a quant team — in 8 seconds, not 8 weeks.
        </p>
        <Link
          href="/dashboard"
          className="mt-10 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[var(--accent-dim)]"
        >
          Launch Axiom Free <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}

/* ---------- FOOTER ---------- */
function Footer() {
  return (
    <footer className="border-t border-[var(--border)] px-4 py-12 sm:px-6">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        <div>
          <div className="font-mono text-sm font-bold uppercase tracking-[0.35em] text-[var(--accent)]">AXIOM</div>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            Computational co-founder for early-stage startups.
          </p>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
            Product
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/dashboard" className="text-[var(--text-secondary)] hover:text-[var(--accent)]">Dashboard</Link></li>
            <li><Link href="/forecast" className="text-[var(--text-secondary)] hover:text-[var(--accent)]">Forecast</Link></li>
            <li><Link href="/pricing" className="text-[var(--text-secondary)] hover:text-[var(--accent)]">Pricing Lab</Link></li>
            <li><Link href="/agents" className="text-[var(--text-secondary)] hover:text-[var(--accent)]">Agent Console</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
            Stack
          </div>
          <ul className="mt-3 space-y-2 font-mono text-xs text-[var(--text-secondary)]">
            <li>Gemini 1.5 Pro / Flash</li>
            <li>Wolfram Engine</li>
            <li>LangGraph</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-[var(--border)] pt-6 text-center font-mono text-[10px] uppercase tracking-widest text-[var(--secondary)]">
        © 2025 Axiom · Built with Gemini 1.5 · Wolfram Engine · LangGraph
      </div>
    </footer>
  );
}




