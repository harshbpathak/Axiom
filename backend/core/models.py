from pydantic import BaseModel, Field


class StrategyInput(BaseModel):
    cash_reserve: float = Field(gt=0, description="Current cash in bank")
    monthly_burn: float = Field(ge=0, description="Monthly burn rate")
    monthly_revenue: float = Field(ge=0, description="Monthly revenue")
    goal_prompt: str = Field(min_length=1, description="Strategic business goal")


class ChartPoint(BaseModel):
    month: int
    historical: float | None = None
    projected: float | None = None


class ComputationResponse(BaseModel):
    verified_runway_months: int
    optimal_price_point: float
    chart_coordinates: list[ChartPoint]
    executive_summary: str
    action_insights: list[str] = Field(min_length=1, max_length=5)


class HealthResponse(BaseModel):
    status: str
    wolfram_available: bool
    gemini_configured: bool


class ComputationRequest(BaseModel):
    """Internal schema produced by the Strategist agent."""

    cash_reserve: float
    monthly_burn: float
    monthly_revenue: float
    net_monthly_flow: float
    growth_rate_assumption: float
    churn_rate_assumption: float
    optimization_target: str
    historical_balances: list[float]
    goal_interpretation: str


class QuantResult(BaseModel):
    verified_runway_months: int
    optimal_price_point: float
    projected_balances: list[float]
    computation_source: str
