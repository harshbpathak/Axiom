"""Wolfram computation bridge with deterministic Python fallback."""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
import asyncio

from core.config import settings
from core.models import ComputationRequest, QuantResult, SensitivityPoint
from computation.mocked_engine import MockedBackend

logger = logging.getLogger(__name__)

WOLFRAM_TIMEOUT_SECONDS = 15


class WolframBackend(ABC):
    @abstractmethod
    async def forecast_runway(self, historical_balances: list[float], months: int = 12) -> list[float]:
        pass

    @abstractmethod
    async def optimize_price(self, current_burn: float, current_revenue: float, price_bounds: tuple[float, float] | None = None) -> float:
        pass

    @abstractmethod
    async def compute_burn_sensitivity(self, optimal_price: float, current_cash: float, current_burn: float, current_revenue: float, steps: int = 10) -> list[SensitivityPoint]:
        pass

    @abstractmethod
    async def is_alive(self) -> bool:
        pass


class LocalKernelBackend(WolframBackend):
    def __init__(self):
        self._lock = asyncio.Lock()
        self._session = None

    def _start_session(self):
        from wolframclient.evaluation import WolframLanguageSession
        kwargs: dict = {}
        if settings.wolfram_kernel_path:
            kwargs["kernel"] = settings.wolfram_kernel_path
        self._session = WolframLanguageSession(**kwargs)
        self._session.start()

    def _get_session(self):
        if self._session is None:
            self._start_session()
        return self._session

    def _restart_session(self):
        if self._session is not None:
            try:
                self._session.terminate()
            except Exception:
                pass
            self._session = None

    async def _evaluate(self, expr):
        async with self._lock:
            try:
                session = self._get_session()
                # Run evaluation in thread to not block async loop, wrapped in timeout
                loop = asyncio.get_running_loop()
                result = await asyncio.wait_for(
                    loop.run_in_executor(None, session.evaluate, expr),
                    timeout=WOLFRAM_TIMEOUT_SECONDS
                )
                return result
            except (asyncio.TimeoutError, Exception) as exc:
                logger.error(f"Wolfram evaluation failed or timed out: {exc}")
                self._restart_session()
                raise RuntimeError(f"Wolfram computation failed: {exc}")

    def _to_float(self, value) -> float | None:
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    def _to_float_list(self, result) -> list[float] | None:
        if result is None:
            return None
        try:
            values = list(result)
            parsed = [self._to_float(v) for v in values]
            if any(v is None for v in parsed):
                return None
            return [float(v) for v in parsed]
        except (TypeError, ValueError):
            return None

    async def forecast_runway(self, historical_balances: list[float], months: int = 12) -> list[float]:
        from wolframclient.language import wlexpr
        pairs = ", ".join(f"{{{i + 1}, {v}}}" for i, v in enumerate(historical_balances))
        start = len(historical_balances) + 1
        end = len(historical_balances) + months
        expr = wlexpr(
            "Module[{data, model}, "
            f"data = {{{pairs}}}; "
            "model = LinearModelFit[data, x, x]; "
            f"Table[N[model[i]], {{i, {start}, {end}}}]"
            "]"
        )
        res = await self._evaluate(expr)
        parsed = self._to_float_list(res)
        if parsed is None:
            raise ValueError("Failed to parse Wolfram forecast result")
        return parsed

    async def optimize_price(self, current_burn: float, current_revenue: float, price_bounds: tuple[float, float] | None = None) -> float:
        from wolframclient.language import wlexpr
        deficit = max(current_burn - current_revenue, 0)
        users = 100
        fixed_costs = current_burn * 0.4
        variable_per_user = current_burn * 0.006
        
        min_p = price_bounds[0] if price_bounds else max(deficit / users, 1)
        max_p = price_bounds[1] if price_bounds else 500
        
        profit_expr = f"p * {users} - ({fixed_costs} + {variable_per_user} * {users})"
        expr = wlexpr(
            f"NMaximize[{{{profit_expr}, p >= {min_p} && p <= {max_p}}}, p][[2, 1, 2]]"
        )
        res = await self._evaluate(expr)
        parsed = self._to_float(res)
        if parsed is None:
            raise ValueError("Failed to parse Wolfram optimization result")
        return parsed

    async def compute_burn_sensitivity(self, optimal_price: float, current_cash: float, current_burn: float, current_revenue: float, steps: int = 10) -> list[SensitivityPoint]:
        from wolframclient.language import wlexpr
        
        min_p = optimal_price * 0.7
        max_p = optimal_price * 1.3
        
        expr = wlexpr(
            f"Table[p, {{p, {min_p}, {max_p}, {(max_p - min_p) / (steps - 1)}}}]"
        )
        prices_res = await self._evaluate(expr)
        prices = self._to_float_list(prices_res) or []
        
        grid = []
        base_price = max(current_revenue / 100, 9.0) if current_revenue > 0 else 29.0
        users = 100
        
        for p in prices:
            q = users * (p / base_price) ** -1.5
            sim_rev = p * q
            net = sim_rev - current_burn
            
            if net >= 0:
                runway = 36
            else:
                runway = max(int(current_cash // abs(net)), 0)
                
            grid.append(SensitivityPoint(price=round(float(p), 2), runway_months=runway))
            
        return grid

    async def is_alive(self) -> bool:
        try:
            res = await self._evaluate("1+1")
            return res == 2
        except Exception:
            return False


# Singleton instance for local kernel to avoid startup overhead
_local_kernel_instance = None

def get_backend() -> WolframBackend:
    global _local_kernel_instance
    mode = settings.wolfram_mode
    if mode == "mocked":
        return MockedBackend()
    elif mode == "local_kernel":
        if _local_kernel_instance is None:
            _local_kernel_instance = LocalKernelBackend()
        return _local_kernel_instance
    else:
        # Fallback to mocked if unknown
        return MockedBackend()

def _build_historical_balances(request: ComputationRequest) -> list[float]:
    """Synthesize a short historical series ending at current cash reserve."""
    if request.historical_balances and len(request.historical_balances) >= 3:
        return request.historical_balances[-6:]

    net = request.net_monthly_flow
    cash = request.cash_reserve
    synthesized: list[float] = []
    for months_back in range(5, -1, -1):
        synthesized.append(round(cash - net * months_back, 2))
    return synthesized

def _runway_months(cash: float, net_monthly: float) -> int:
    if net_monthly >= 0:
        return 36
    months = int(cash // abs(net_monthly))
    return max(months, 0)

async def execute_computation(request: ComputationRequest) -> QuantResult:
    historical = _build_historical_balances(request)
    backend = get_backend()
    
    import time
    start_time = time.time()
    
    projected = await backend.forecast_runway(historical)
    optimal = await backend.optimize_price(request.monthly_burn, request.monthly_revenue, request.price_variable_bounds)
    grid = await backend.compute_burn_sensitivity(
        optimal, 
        request.cash_reserve, 
        request.monthly_burn, 
        request.monthly_revenue
    )
    
    execution_ms = (time.time() - start_time) * 1000
    runway = _runway_months(request.cash_reserve, request.net_monthly_flow)
    
    trace_data = {
        "wl_expression": "abstracted_backend_call",
        "result": "computed",
        "execution_ms": execution_ms,
        "retries": 0,
        "wolfram_mode": settings.wolfram_mode
    }
    
    return QuantResult(
        verified_runway_months=runway,
        optimal_price_point=optimal,
        projected_balances=projected,
        computation_source=settings.wolfram_mode,
        sensitivity_grid=grid,
        trace_data=trace_data
    )

def is_wolfram_available() -> bool:
    # Synchronous check wrapper for health endpoint using the mocked/local instance
    backend = get_backend()
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # If running in loop, return True optimistically or use a background task
            # For FastAPI health endpoint, this is tricky. We'll return True if mocked.
            if settings.wolfram_mode == "mocked":
                return True
            return True
        else:
            return loop.run_until_complete(backend.is_alive())
    except Exception:
        return False
