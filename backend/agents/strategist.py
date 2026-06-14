import json
import logging

import google.generativeai as genai
from core.config import settings
from core.models import ComputationRequest

logger = logging.getLogger(__name__)

STRATEGIST_MODEL = "gemini-2.5-flash"

def _configure_gemini() -> None:
    if settings.gemini_api_key:
        genai.configure(api_key=settings.gemini_api_key)

def _parse_json(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
        if cleaned.endswith("```"):
            cleaned = cleaned.rsplit("```", 1)[0]
    return json.loads(cleaned)

def _fallback_computation_request(data) -> ComputationRequest:
    net = data.monthly_revenue - data.monthly_burn
    historical = []
    for months_back in range(5, -1, -1):
        historical.append(round(data.cash_reserve - net * months_back, 2))

    return ComputationRequest(
        operation="forecast_runway",
        cash_reserve=data.cash_reserve,
        monthly_burn=data.monthly_burn,
        monthly_revenue=data.monthly_revenue,
        net_monthly_flow=net,
        growth_rate_assumption=0.05,
        churn_rate_assumption=0.03,
        optimization_target="maximize_runway",
        historical_balances=historical,
        price_variable_bounds=(1.0, 500.0),
        goal_interpretation=data.goal_prompt,
    )

async def strategist_node(state) -> dict:
    feed = state.get("agent_feed", [])
    data = state["input"]
    trace = state.get("trace", {})

    feed.append("> Strategist parsing intent and extracting variables...")

    if not settings.gemini_api_key:
        feed.append("> Gemini unavailable \u2014 using deterministic variable extraction.")
        request = _fallback_computation_request(data)
        trace["strategist"] = {"prompt": "fallback", "request": request.model_dump()}
        return {
            "agent_feed": feed,
            "computation_request": request,
            "trace": trace
        }

    _configure_gemini()
    # Use json mode for Gemini output
    model = genai.GenerativeModel(
        STRATEGIST_MODEL,
        system_instruction=(
            "You are the Lead Strategic Planner for a high-growth startup. "
            "The user will provide their current financial metrics and a business goal. "
            "Your job is NOT to calculate the final numbers. "
            "Your job is to extract the core variables and define the exact mathematical "
            "operations required. Output ONLY valid JSON with keys: "
            "operation (forecast_runway, optimize_price, sensitivity), "
            "cash_reserve, monthly_burn, monthly_revenue, net_monthly_flow, "
            "growth_rate_assumption, churn_rate_assumption, optimization_target, "
            "historical_balances (array of 6 floats ending at cash_reserve), "
            "price_variable_bounds (array of 2 floats [min, max] or null), "
            "goal_interpretation."
        ),
        generation_config={"response_mime_type": "application/json"}
    )

    prompt = (
        f"Cash reserve: {data.cash_reserve}\n"
        f"Monthly burn: {data.monthly_burn}\n"
        f"Monthly revenue: {data.monthly_revenue}\n"
        f"Goal: {data.goal_prompt}\n"
    )

    try:
        response = await model.generate_content_async(prompt)
        parsed = json.loads(response.text) # Since it's JSON mode
        
        # Enforce bounds formatting
        if "price_variable_bounds" in parsed and parsed["price_variable_bounds"]:
            parsed["price_variable_bounds"] = tuple(parsed["price_variable_bounds"])
            
        request = ComputationRequest(**parsed)
        feed.append("> Strategist formulated ComputationRequest \u2014 delegating to Quant.")
        trace["strategist"] = {"prompt": prompt, "request": request.model_dump()}
        return {"agent_feed": feed, "computation_request": request, "trace": trace}
    except Exception as exc:
        logger.warning("Strategist failed: %s", exc)
        feed.append("> Strategist reformulating \u2014 fallback extraction applied.")
        request = _fallback_computation_request(data)
        trace["strategist"] = {"prompt": prompt, "error": str(exc), "request": request.model_dump()}
        return {
            "agent_feed": feed,
            "computation_request": request,
            "trace": trace
        }
