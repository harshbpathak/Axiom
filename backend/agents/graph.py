"""LangGraph agent workflow definition."""

from __future__ import annotations

import logging
from typing import Annotated, TypedDict

from langgraph.graph import END, StateGraph

from core.models import ComputationRequest, ComputationResponse, QuantResult, StrategyInput
from agents.strategist import strategist_node
from agents.quant import quant_node
from agents.architect import architect_node

logger = logging.getLogger(__name__)


class AgentState(TypedDict):
    input: StrategyInput
    agent_feed: Annotated[list[str], lambda a, b: a + b]
    computation_request: ComputationRequest | None
    quant_result: QuantResult | None
    final_response: ComputationResponse | None
    error: str | None
    trace: dict
    quant_retries: int


def should_retry_quant(state: AgentState) -> str:
    """Conditional edge logic after Quant."""
    if state.get("error"):
        if state.get("quant_retries", 0) < 2:
            return "strategist"
        else:
            # Give up and go to architect to report degraded state
            return "architect"
    return "architect"


def build_graph():
    graph = StateGraph(AgentState)
    graph.add_node("strategist", strategist_node)
    graph.add_node("quant", quant_node)
    graph.add_node("architect", architect_node)

    graph.set_entry_point("strategist")
    graph.add_edge("strategist", "quant")
    
    # Conditional edge handles quant failures (up to 2 retries)
    graph.add_conditional_edges(
        "quant",
        should_retry_quant,
        {
            "strategist": "strategist",
            "architect": "architect"
        }
    )
    
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
            "trace": {},
            "quant_retries": 0,
        }
    )

    if result.get("final_response") is None:
        raise RuntimeError(result.get("error") or "Pipeline failed to produce a response")

    return result["agent_feed"], result["final_response"]
