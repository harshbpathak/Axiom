import logging
from computation.engine import execute_computation

logger = logging.getLogger(__name__)

async def quant_node(state) -> dict:
    request = state["computation_request"]
    feed = state.get("agent_feed", [])
    trace = state.get("trace", {})
    retries = state.get("quant_retries", 0)

    if request is None:
        feed.append("> Quant error: no computation request.")
        return {"agent_feed": feed, "error": "Missing computation request"}

    feed.append(f"> Quant compiling {request.operation or 'computation'}...")
    try:
        # execute_computation is now async because it calls the async backend interface
        result = await execute_computation(request)
        source_label = result.computation_source.replace("_", " ").title()
        feed.append(f"> Quant verified math via {source_label}.")
        
        trace["quant"] = result.trace_data or {}
        
        return {
            "agent_feed": feed, 
            "quant_result": result, 
            "trace": trace,
            "error": None # Clear previous errors on success
        }
    except Exception as exc:
        logger.error("Quant failed: %s", exc)
        feed.append(f"> Quant computation failed: {str(exc)} \u2014 requesting reformulation.")
        
        trace["quant"] = {"error": str(exc), "retries": retries + 1}
        
        return {
            "agent_feed": feed, 
            "error": str(exc),
            "quant_retries": retries + 1,
            "trace": trace
        }
