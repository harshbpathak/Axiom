export interface StrategyInput {
  cash_reserve: number;
  monthly_burn: number;
  monthly_revenue: number;
  goal_prompt: string;
}

export interface ChartPoint {
  month: number;
  historical: number | null;
  projected: number | null;
}

export interface SensitivityPoint {
  price: number;
  runway_months: number;
}

export interface AgentTrace {
  strategist: any;
  quant: any;
  architect: any;
}

export interface ComputationResponse {
  verified_runway_months: number;
  optimal_price_point: number;
  chart_coordinates: ChartPoint[];
  executive_summary: string;
  action_insights: string[];
  trace?: AgentTrace;
  sensitivity_grid?: SensitivityPoint[];
}

export interface HealthResponse {
  status: string;
  wolfram_available: boolean;
  wolfram_mode: string | null;
  gemini_configured: boolean;
}

export interface Run {
  id: string;
  timestamp: string;
  inputs: StrategyInput;
  output: ComputationResponse;
}

export type ComputeStatus = "idle" | "computing" | "complete" | "error";
