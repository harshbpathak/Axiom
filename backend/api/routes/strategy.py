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
        wolfram_mode=settings.wolfram_mode,
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
            # We can stream intermediate steps using astream instead of ainvoke
            async for event in agent_graph.astream(
                {
                    "input": data,
                    "agent_feed": [],
                    "computation_request": None,
                    "quant_result": None,
                    "final_response": None,
                    "error": None,
                    "trace": {},
                    "quant_retries": 0,
                },
                stream_mode="values"
            ):
                # The state contains the accumulated feed. Let's yield the last message
                if event.get("agent_feed"):
                    yield _StreamEvent.step(event["agent_feed"][-1])
                
                # Check if final response is ready
                if event.get("final_response"):
                    yield _StreamEvent.complete(event["final_response"])
                    return
                
                # Check if critical error
                if event.get("error") and event.get("quant_retries", 0) >= 2:
                    yield _StreamEvent.error(event["error"])
                    return
            
        except Exception as exc:
            yield _StreamEvent.error(str(exc))

    return EventSourceResponse(event_generator())
