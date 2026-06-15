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
      wolframMode: "mocked",
      executiveSummary:
        "At current burn of $62k/mo with $18k MRR, Axiom projects 14 months of runway. Wolfram TimeSeriesForecast confirms a cash-zero event in month 14 under linear assumptions. Optimal price point of $149 maximizes revenue given elasticity constraints — increasing to $149 extends runway to 17 months.",
      chartCoordinates: [
        { month: -5, balance: 640000, type: "historical" },
        { month: -4, balance: 674000, type: "historical" },
        { month: -3, balance: 710000, type: "historical" },
        { month: -2, balance: 762000, type: "historical" },
        { month: -1, balance: 808000, type: "historical" },
        { month: 0, balance: 850000, type: "historical" },
        { month: 1, balance: 806000, type: "projected", confidenceLow: 790000, confidenceHigh: 822000 },
        { month: 2, balance: 762000, type: "projected", confidenceLow: 738000, confidenceHigh: 786000 },
        { month: 3, balance: 718000, type: "projected", confidenceLow: 686000, confidenceHigh: 750000 },
        { month: 6, balance: 586000, type: "projected", confidenceLow: 534000, confidenceHigh: 638000 },
        { month: 9, balance: 454000, type: "projected", confidenceLow: 382000, confidenceHigh: 526000 },
        { month: 12, balance: 322000, type: "projected", confidenceLow: 230000, confidenceHigh: 414000 },
        { month: 14, balance: 68000, type: "projected", confidenceLow: -42000, confidenceHigh: 178000 },
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
          wolframMode: "mocked",
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
      wolframMode: "mocked",
      executiveSummary:
        "With $28k MRR under aggressive pricing at $179, runway extends to 17 months. Wolfram optimization confirms diminishing returns above $179 due to estimated elasticity of -1.4.",
      chartCoordinates: [
        { month: -3, balance: 720000, type: "historical" },
        { month: -2, balance: 765000, type: "historical" },
        { month: -1, balance: 808000, type: "historical" },
        { month: 0, balance: 850000, type: "historical" },
        { month: 3, balance: 772000, type: "projected", confidenceLow: 740000, confidenceHigh: 804000 },
        { month: 6, balance: 694000, type: "projected", confidenceLow: 650000, confidenceHigh: 738000 },
        { month: 9, balance: 616000, type: "projected", confidenceLow: 558000, confidenceHigh: 674000 },
        { month: 12, balance: 538000, type: "projected", confidenceLow: 466000, confidenceHigh: 610000 },
        { month: 15, balance: 360000, type: "projected", confidenceLow: 268000, confidenceHigh: 452000 },
        { month: 17, balance: 132000, type: "projected", confidenceLow: 22000, confidenceHigh: 242000 },
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
          wolframMode: "mocked",
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
      wolframMode: "mocked",
      executiveSummary:
        "Reducing burn to $45k/mo dramatically extends runway to 22 months — a 57% improvement over the base case. This unlocks a path to profitability at $18k MRR by month 22 without additional fundraising.",
      chartCoordinates: [
        { month: -3, balance: 760000, type: "historical" },
        { month: -2, balance: 790000, type: "historical" },
        { month: -1, balance: 820000, type: "historical" },
        { month: 0, balance: 850000, type: "historical" },
        { month: 3, balance: 796000, type: "projected", confidenceLow: 770000, confidenceHigh: 822000 },
        { month: 6, balance: 742000, type: "projected", confidenceLow: 706000, confidenceHigh: 778000 },
        { month: 9, balance: 688000, type: "projected", confidenceLow: 634000, confidenceHigh: 742000 },
        { month: 12, balance: 634000, type: "projected", confidenceLow: 562000, confidenceHigh: 706000 },
        { month: 18, balance: 526000, type: "projected", confidenceLow: 418000, confidenceHigh: 634000 },
        { month: 22, balance: 82000, type: "projected", confidenceLow: -58000, confidenceHigh: 222000 },
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
          wolframMode: "mocked",
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
