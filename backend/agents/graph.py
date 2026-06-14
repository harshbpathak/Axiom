"""LangGraph agent nodes: Strategist, Quant, Architect."""

from __future__ import annotations

import json
import logging
from typing import Annotated, TypedDict

import google.generativeai as genai
from langgraph.graph import END, StateGraph

from computation.engine import execute_computation
from core.config import settings
from core.models import (
    ChartPoint,
    ComputationRequest,
    ComputationResponse,
    QuantResult,
    StrategyInput,
)

logger = logging.getLogger(__name__)

STRATEGIST_MODEL = "gemini-1.5-pro"
ARCHITECT_MODEL = "gemini-1.5-flash"


class AgentState(TypedDict):
    input: StrategyInput
    agent_feed: Annotated[list[str], lambda a, b: a + b]
    computation_request: ComputationRequest | None
    quant_result: QuantResult | None
    final_response: ComputationResponse | None
    error: str | None


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


def _fallback_computation_request(data: StrategyInput) -> ComputationRequest:
    net = data.monthly_revenue - data.monthly_burn
    historical = []
    for months_back in range(5, -1, -1):
        historical.append(round(data.cash_reserve - net * months_back, 2))

    return ComputationRequest(
        cash_reserve=data.cash_reserve,
        monthly_burn=data.monthly_burn,
        monthly_revenue=data.monthly_revenue,
        net_monthly_flow=net,
        growth_rate_assumption=0.05,
        churn_rate_assumption=0.03,
        optimization_target="maximize_runway",
        historical_balances=historical,
        goal_interpretation=data.goal_prompt,
    )


def strategist_node(state: AgentState) -> AgentState:
    feed = ["> Strategist parsing intent and extracting variables..."]
    data = state["input"]

    if not settings.gemini_api_key:
        feed.append("> Gemini unavailable — using deterministic variable extraction.")
        return {
            "agent_feed": feed,
            "computation_request": _fallback_computation_request(data),
        }

    _configure_gemini()
    model = genai.GenerativeModel(
        STRATEGIST_MODEL,
        system_instruction=(
            "You are the Lead Strategic Planner for a high-growth startup. "
            "The user will provide their current financial metrics and a business goal. "
            "Your job is NOT to calculate the final numbers. "
            "Your job is to extract the core variables and define the exact mathematical "
            "operations required. Output ONLY valid JSON with keys: "
            "cash_reserve, monthly_burn, monthly_revenue, net_monthly_flow, "
            "growth_rate_assumption, churn_rate_assumption, optimization_target, "
            "historical_balances (array of 6 floats ending at cash_reserve), "
            "goal_interpretation."
        ),
    )

    prompt = (
        f"Cash reserve: {data.cash_reserve}\n"
        f"Monthly burn: {data.monthly_burn}\n"
        f"Monthly revenue: {data.monthly_revenue}\n"
        f"Goal: {data.goal_prompt}\n"
    )

    try:
        response = model.generate_content(prompt)
        parsed = _parse_json(response.text)
        request = ComputationRequest(**parsed)
        feed.append("> Strategist formulated ComputationRequest — delegating to Quant.")
        return {"agent_feed": feed, "computation_request": request}
    except Exception as exc:
        logger.warning("Strategist failed: %s", exc)
        feed.append("> Strategist reformulating — fallback extraction applied.")
        return {
            "agent_feed": feed,
            "computation_request": _fallback_computation_request(data),
        }


def quant_node(state: AgentState) -> AgentState:
    request = state["computation_request"]
    if request is None:
        return {"agent_feed": ["> Quant error: no computation request."], "error": "Missing computation request"}

    feed = ["> Wolfram compiling TimeSeriesForecast and LinearOptimization..."]
    try:
        result = execute_computation(request)
        source_label = result.computation_source.replace("_", " ").title()
        feed.append(f"> Quant verified math via {source_label}.")
        return {"agent_feed": feed, "quant_result": result}
    except Exception as exc:
        logger.error("Quant failed: %s", exc)
        feed.append("> Quant computation failed — requesting reformulation.")
        return {"agent_feed": feed, "error": str(exc)}


def architect_node(state: AgentState) -> AgentState:
    feed = ["> Architect finalizing executive report..."]
    data = state["input"]
    quant = state["quant_result"]
    request = state["computation_request"]

    if quant is None or request is None:
        return {"agent_feed": feed, "error": "Missing quant result"}

    historical = request.historical_balances[-6:]
    chart: list[ChartPoint] = []

    for i, balance in enumerate(historical):
        chart.append(ChartPoint(month=i - len(historical) + 1, historical=balance, projected=None))

    start_month = 1
    for i, projected_balance in enumerate(quant.projected_balances[:12]):
        chart.append(
            ChartPoint(
                month=start_month + i,
                historical=None,
                projected=round(projected_balance, 2),
            )
        )

    if not settings.gemini_api_key:
        insights = [
            f"Projected runway: {quant.verified_runway_months} months at current burn.",
            f"Optimal price point: ${quant.optimal_price_point:.2f}/mo to improve unit economics.",
            f"Net monthly flow: ${request.net_monthly_flow:,.0f} — {'positive' if request.net_monthly_flow >= 0 else 'negative'}.",
        ]
        summary = (
            f"Based on verified computation, Axiom projects {quant.verified_runway_months} months of runway. "
            f"Raising price to ${quant.optimal_price_point:.2f}/mo aligns with your goal: {request.goal_interpretation}."
        )
        response = ComputationResponse(
            verified_runway_months=quant.verified_runway_months,
            optimal_price_point=quant.optimal_price_point,
            chart_coordinates=chart,
            executive_summary=summary,
            action_insights=insights,
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
    )

    payload = {
        "runway_months": quant.verified_runway_months,
        "optimal_price_point": quant.optimal_price_point,
        "net_monthly_flow": request.net_monthly_flow,
        "goal": request.goal_interpretation,
        "computation_source": quant.computation_source,
    }

    try:
        result = model.generate_content(json.dumps(payload))
        parsed = _parse_json(result.text)
        response = ComputationResponse(
            verified_runway_months=quant.verified_runway_months,
            optimal_price_point=quant.optimal_price_point,
            chart_coordinates=chart,
            executive_summary=parsed["executive_summary"],
            action_insights=parsed["action_insights"][:3],
        )
    except Exception as exc:
        logger.warning("Architect failed: %s", exc)
        insights = [
            f"Extend runway to {quant.verified_runway_months}+ months by optimizing burn.",
            f"Set subscription price to ${quant.optimal_price_point:.2f}/mo.",
            f"Address goal: {data.goal_prompt[:80]}{'...' if len(data.goal_prompt) > 80 else ''}",
        ]
        response = ComputationResponse(
            verified_runway_months=quant.verified_runway_months,
            optimal_price_point=quant.optimal_price_point,
            chart_coordinates=chart,
            executive_summary=f"Verified runway: {quant.verified_runway_months} months. Optimal price: ${quant.optimal_price_point:.2f}/mo.",
            action_insights=insights,
        )

    feed.append("> Architect report ready.")
    return {"agent_feed": feed, "final_response": response}


def build_graph():
    graph = StateGraph(AgentState)
    graph.add_node("strategist", strategist_node)
    graph.add_node("quant", quant_node)
    graph.add_node("architect", architect_node)

    graph.set_entry_point("strategist")
    graph.add_edge("strategist", "quant")
    graph.add_edge("quant", "architect")
    graph.add_edge("architect", END)

    return graph.compile()


agent_graph = build_graph()


async def run_strategy_pipeline(data: StrategyInput) -> tuple[list[str], ComputationResponse]:
    result = await agent_graph.ainvoke(
        {
            "input": data,
            "agent_feed": [],
            "computation_request": None,
            "quant_result": None,
            "final_response": None,
            "error": None,
        }
    )

    if result.get("error") or result.get("final_response") is None:
        raise RuntimeError(result.get("error") or "Pipeline failed to produce a response")

    return result["agent_feed"], result["final_response"]
