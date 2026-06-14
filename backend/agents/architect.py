import json
import logging
import google.generativeai as genai

from core.config import settings
from core.models import ChartPoint, ComputationResponse, AgentTrace

logger = logging.getLogger(__name__)

ARCHITECT_MODEL = "gemini-2.5-flash"

def _configure_gemini() -> None:
    if settings.gemini_api_key:
        genai.configure(api_key=settings.gemini_api_key)

async def architect_node(state) -> dict:
    feed = state.get("agent_feed", [])
    data = state["input"]
    quant = state["quant_result"]
    request = state["computation_request"]
    trace_dict = state.get("trace", {})

    feed.append("> Architect finalizing executive report...")

    if quant is None or request is None:
        feed.append("> Architect error: missing inputs.")
        return {"agent_feed": feed, "error": "Missing quant result"}

    # Pass raw arrays through exactly as requested
    historical = request.historical_balances[-6:] if request.historical_balances else []
    chart: list[ChartPoint] = []

    for i, balance in enumerate(historical):
        chart.append(ChartPoint(month=i - len(historical) + 1, historical=balance, projected=None))

    start_month = 1
    if quant.projected_balances:
        for i, projected_balance in enumerate(quant.projected_balances[:12]):
            chart.append(
                ChartPoint(
                    month=start_month + i,
                    historical=None,
                    projected=round(projected_balance, 2),
                )
            )

    trace = AgentTrace(
        strategist=trace_dict.get("strategist", {}),
        quant=trace_dict.get("quant", {}),
        architect={}
    )

    if not settings.gemini_api_key:
        insights = [
            f"Projected runway: {quant.verified_runway_months} months at current burn.",
            f"Optimal price point: ${quant.optimal_price_point:.2f}/mo to improve unit economics.",
            f"Net monthly flow: ${request.net_monthly_flow:,.0f} \u2014 {'positive' if request.net_monthly_flow >= 0 else 'negative'}.",
        ]
        summary = (
            f"Based on verified computation, Axiom projects {quant.verified_runway_months} months of runway. "
            f"Raising price to ${quant.optimal_price_point:.2f}/mo aligns with your goal: {request.goal_interpretation}."
        )
        
        trace.architect = {"prompt": "fallback", "response": "fallback"}
        
        response = ComputationResponse(
            verified_runway_months=quant.verified_runway_months,
            optimal_price_point=quant.optimal_price_point,
            chart_coordinates=chart,
            executive_summary=summary,
            action_insights=insights,
            trace=trace,
            sensitivity_grid=quant.sensitivity_grid
        )
        feed.append("> Architect report ready.")
        return {"agent_feed": feed, "final_response": response}

    _configure_gemini()
    model = genai.GenerativeModel(
        ARCHITECT_MODEL,
        system_instruction=(
            "You are an Executive Financial Translator. You receive verified mathematical data. "
            "Translate into a concise strategic summary for the CEO. Do NOT alter the numbers. "
            "Output ONLY valid JSON with keys: executive_summary (string), "
            "action_insights (array of exactly 3 short actionable strings)."
        ),
        generation_config={"response_mime_type": "application/json"}
    )

    payload = {
        "runway_months": quant.verified_runway_months,
        "optimal_price_point": quant.optimal_price_point,
        "net_monthly_flow": request.net_monthly_flow,
        "goal": request.goal_interpretation,
        "computation_source": quant.computation_source,
    }
    
    prompt = json.dumps(payload)

    try:
        result = await model.generate_content_async(prompt)
        parsed = json.loads(result.text)
        
        trace.architect = {"prompt": prompt, "response": parsed}
        
        response = ComputationResponse(
            verified_runway_months=quant.verified_runway_months,
            optimal_price_point=quant.optimal_price_point,
            chart_coordinates=chart,
            executive_summary=parsed["executive_summary"],
            action_insights=parsed["action_insights"][:3],
            trace=trace,
            sensitivity_grid=quant.sensitivity_grid
        )
    except Exception as exc:
        logger.warning("Architect failed: %s", exc)
        insights = [
            f"Extend runway to {quant.verified_runway_months}+ months by optimizing burn.",
            f"Set subscription price to ${quant.optimal_price_point:.2f}/mo.",
            f"Address goal: {data.goal_prompt[:80]}{'...' if len(data.goal_prompt) > 80 else ''}",
        ]
        
        trace.architect = {"prompt": prompt, "error": str(exc)}
        
        response = ComputationResponse(
            verified_runway_months=quant.verified_runway_months,
            optimal_price_point=quant.optimal_price_point,
            chart_coordinates=chart,
            executive_summary=f"Verified runway: {quant.verified_runway_months} months. Optimal price: ${quant.optimal_price_point:.2f}/mo.",
            action_insights=insights,
            trace=trace,
            sensitivity_grid=quant.sensitivity_grid
        )

    feed.append("> Architect report ready.")
    return {"agent_feed": feed, "final_response": response}
