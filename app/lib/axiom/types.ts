export interface StrategyInput {
  cashReserve: number;
  monthlyBurn: number;
  monthlyRevenue: number;
  strategicGoal: string;
}

export interface ChartCoordinate {
  month: number;
  historical: number | null;
  projected: number | null;
}

export interface SensitivityPoint {
  price: number;
  runwayMonths: number;
}

export interface ComputationRequest {
  operation: string;
  historicalBalances: number[];
  priceVariableBounds: [number, number];
}

export interface AgentTrace {
  strategist: {
    prompt: string;
    request: ComputationRequest;
    durationMs: number;
  };
  quant: {
    wlExpression: string;
    result: unknown;
    executionMs: number;
    retries: number;
    wolframMode: string;
  };
  architect: {
    prompt: string;
    response: unknown;
    durationMs: number;
  };
}

export type WolframMode = "local_kernel" | "wolframscript" | "mocked";

export interface ComputationResponse {
  verifiedRunwayMonths: number;
  optimalPricePoint: number;
  chartCoordinates: ChartCoordinate[];
  sensitivityGrid: SensitivityPoint[];
  executiveSummary: string;
  wolframMode: WolframMode;
  trace: AgentTrace;
}

export interface Run {
  id: string;
  timestamp: string;
  label: string;
  inputs: StrategyInput;
  output: ComputationResponse;
  agentLogs: AgentTrace;
}
