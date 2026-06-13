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

export interface ComputationResponse {
  verified_runway_months: number;
  optimal_price_point: number;
  chart_coordinates: ChartPoint[];
  executive_summary: string;
  action_insights: string[];
}

export type ComputeStatus = "idle" | "computing" | "complete" | "error";
