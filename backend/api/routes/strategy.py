from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from agents.graph import agent_graph, run_strategy_pipeline
from computation.engine import is_wolfram_available
from core.config import settings
from core.models import ComputationResponse, HealthResponse, StrategyInput

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        wolfram_available=is_wolfram_available(),
        gemini_configured=bool(settings.gemini_api_key),
    )


@router.post("/strategy/compute", response_model=ComputationResponse)
async def compute_strategy(data: StrategyInput) -> ComputationResponse:
    try:
        _, response = await run_strategy_pipeline(data)
        return response
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


class _StreamEvent:
    @staticmethod
    def step(message: str) -> dict:
        return {"event": "step", "data": message}

    @staticmethod
    def complete(response: ComputationResponse) -> dict:
        return {"event": "complete", "data": response.model_dump_json()}

    @staticmethod
    def error(message: str) -> dict:
        return {"event": "error", "data": message}


@router.post("/strategy/compute/stream")
async def compute_strategy_stream(data: StrategyInput):
    async def event_generator():
        try:
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

            for step in result.get("agent_feed", []):
                yield _StreamEvent.step(step)

            if result.get("error"):
                yield _StreamEvent.error(result["error"])
                return

            final = result.get("final_response")
            if final is None:
                yield _StreamEvent.error("Pipeline failed to produce a response")
                return

            yield _StreamEvent.complete(final)
        except Exception as exc:
            yield _StreamEvent.error(str(exc))

    return EventSourceResponse(event_generator())
