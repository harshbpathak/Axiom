import type { Run } from "./types";

export const MOCK_RUNS: Run[] = [
  {
    id: "run_001",
    label: "Scenario A — Base Case",
    timestamp: "2025-06-14T09:22:11Z",
    inputs: {
      cashReserve: 850000,
      monthlyBurn: 62000,
      monthlyRevenue: 18000,
      strategicGoal: "Extend runway past Series A",
    },
    output: {
      verifiedRunwayMonths: 14,
      optimalPricePoint: 149,
      wolframMode: "local_kernel",
      executiveSummary:
        "At current burn of $62k/mo with $18k MRR, Axiom projects 14 months of runway. Wolfram TimeSeriesForecast confirms a cash-zero event in month 14 under linear assumptions. Optimal price point of $149 maximizes revenue given elasticity constraints — increasing to $149 extends runway to 17 months.",
      chartCoordinates: [
        { month: -5, historical: 640000, projected: null },
        { month: -4, historical: 674000, projected: null },
        { month: -3, historical: 710000, projected: null },
        { month: -2, historical: 762000, projected: null },
        { month: -1, historical: 808000, projected: null },
        { month: 0, historical: 850000, projected: null },
        { month: 1, historical: null, projected: 806000 },
        { month: 2, historical: null, projected: 762000 },
        { month: 3, historical: null, projected: 718000 },
        { month: 6, historical: null, projected: 586000 },
        { month: 9, historical: null, projected: 454000 },
        { month: 12, historical: null, projected: 322000 },
        { month: 14, historical: null, projected: 68000 },
      ],
      sensitivityGrid: [
        { price: 89, runwayMonths: 10 },
        { price: 99, runwayMonths: 11 },
        { price: 109, runwayMonths: 12 },
        { price: 119, runwayMonths: 13 },
        { price: 129, runwayMonths: 14 },
        { price: 139, runwayMonths: 15 },
        { price: 149, runwayMonths: 17 },
        { price: 159, runwayMonths: 16 },
        { price: 169, runwayMonths: 15 },
        { price: 179, runwayMonths: 13 },
      ],
      trace: {
        strategist: {
          prompt:
            "You are a financial strategist. Given the founder's cash position, monthly burn, monthly revenue and strategic goal, structure a precise ComputationRequest for the Quant agent. Identify whether the goal requires a forecast, a price optimization, or both. Synthesize a 6-month historical cash trajectory from the inputs.",
          request: {
            operation: "forecast_runway",
            historicalBalances: [640000, 674000, 710000, 762000, 808000, 850000],
            priceVariableBounds: [89, 179],
          },
          durationMs: 1840,
        },
        quant: {
          wlExpression: "TimeSeriesForecast[{640000,674000,710000,762000,808000,850000},{14}]",
          result: [806000, 762000, 718000, 674000, 630000, 586000, 542000, 498000, 454000, 410000, 366000, 322000, 195000, 68000],
          executionMs: 312,
          retries: 0,
          wolframMode: "local_kernel",
        },
        architect: {
          prompt:
            "You are a financial architect. Given the Quant agent's verified output, write a single concise executive summary (3-5 sentences) explaining the runway projection and pricing recommendation in plain language for the founder.",
          response: { ok: true },
          durationMs: 920,
        },
      },
    },
    agentLogs: {} as never,
  },
  {
    id: "run_002",
    label: "Scenario B — Aggressive Pricing",
    timestamp: "2025-06-14T11:05:33Z",
    inputs: {
      cashReserve: 850000,
      monthlyBurn: 62000,
      monthlyRevenue: 28000,
      strategicGoal: "Maximize revenue per user",
    },
    output: {
      verifiedRunwayMonths: 17,
      optimalPricePoint: 179,
      wolframMode: "local_kernel",
      executiveSummary:
        "With $28k MRR under aggressive pricing at $179, runway extends to 17 months. Wolfram optimization confirms diminishing returns above $179 due to estimated elasticity of -1.4.",
      chartCoordinates: [
        { month: -3, historical: 720000, projected: null },
        { month: -2, historical: 765000, projected: null },
        { month: -1, historical: 808000, projected: null },
        { month: 0, historical: 850000, projected: null },
        { month: 3, historical: null, projected: 772000 },
        { month: 6, historical: null, projected: 694000 },
        { month: 9, historical: null, projected: 616000 },
        { month: 12, historical: null, projected: 538000 },
        { month: 15, historical: null, projected: 360000 },
        { month: 17, historical: null, projected: 132000 },
      ],
      sensitivityGrid: [
        { price: 119, runwayMonths: 13 },
        { price: 139, runwayMonths: 15 },
        { price: 159, runwayMonths: 16 },
        { price: 179, runwayMonths: 17 },
        { price: 199, runwayMonths: 16 },
        { price: 219, runwayMonths: 14 },
      ],
      trace: {
        strategist: {
          prompt: "You are a financial strategist...",
          request: {
            operation: "optimize_price",
            historicalBalances: [720000, 765000, 808000, 850000],
            priceVariableBounds: [99, 299],
          },
          durationMs: 2100,
        },
        quant: {
          wlExpression: "NMaximize[{revenue[p] - cost[p], 99 <= p <= 299}, p]",
          result: { optimalPrice: 179, maxRevenue: 28400 },
          executionMs: 428,
          retries: 0,
          wolframMode: "local_kernel",
        },
        architect: {
          prompt: "You are a financial architect...",
          response: { ok: true },
          durationMs: 880,
        },
      },
    },
    agentLogs: {} as never,
  },
  {
    id: "run_003",
    label: "Scenario C — Cost Reduction",
    timestamp: "2025-06-14T14:42:07Z",
    inputs: {
      cashReserve: 850000,
      monthlyBurn: 45000,
      monthlyRevenue: 18000,
      strategicGoal: "Cut burn to 45k, how does it change runway?",
    },
    output: {
      verifiedRunwayMonths: 22,
      optimalPricePoint: 129,
      wolframMode: "local_kernel",
      executiveSummary:
        "Reducing burn to $45k/mo dramatically extends runway to 22 months — a 57% improvement over the base case. This unlocks a path to profitability at $18k MRR by month 22 without additional fundraising.",
      chartCoordinates: [
        { month: -3, historical: 760000, projected: null },
        { month: -2, historical: 790000, projected: null },
        { month: -1, historical: 820000, projected: null },
        { month: 0, historical: 850000, projected: null },
        { month: 3, historical: null, projected: 796000 },
        { month: 6, historical: null, projected: 742000 },
        { month: 9, historical: null, projected: 688000 },
        { month: 12, historical: null, projected: 634000 },
        { month: 18, historical: null, projected: 526000 },
        { month: 22, historical: null, projected: 82000 },
      ],
      sensitivityGrid: [
        { price: 79, runwayMonths: 16 },
        { price: 99, runwayMonths: 18 },
        { price: 119, runwayMonths: 20 },
        { price: 129, runwayMonths: 22 },
        { price: 139, runwayMonths: 21 },
        { price: 149, runwayMonths: 20 },
      ],
      trace: {
        strategist: {
          prompt: "You are a financial strategist...",
          request: {
            operation: "forecast_runway",
            historicalBalances: [760000, 790000, 820000, 850000],
            priceVariableBounds: [79, 149],
          },
          durationMs: 1620,
        },
        quant: {
          wlExpression: "TimeSeriesForecast[{760000,790000,820000,850000},{22}]",
          result: [824000, 797000, 770000, 743000, 716000, 689000],
          executionMs: 289,
          retries: 0,
          wolframMode: "local_kernel",
        },
        architect: {
          prompt: "You are a financial architect...",
          response: { ok: true },
          durationMs: 756,
        },
      },
    },
    agentLogs: {} as never,
  },
];

// Hydrate agentLogs from trace for convenience
MOCK_RUNS.forEach((r) => {
  r.agentLogs = r.output.trace;
});
