"""Wolfram computation bridge with deterministic Python fallback."""

from __future__ import annotations

import logging
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError

from core.config import settings
from core.models import ComputationRequest, QuantResult

logger = logging.getLogger(__name__)

WOLFRAM_TIMEOUT_SECONDS = 15


def _build_historical_balances(request: ComputationRequest) -> list[float]:
    """Synthesize a short historical series ending at current cash reserve."""
    balances = list(request.historical_balances)
    if len(balances) >= 3:
        return balances[-6:]

    net = request.net_monthly_flow
    cash = request.cash_reserve
    synthesized: list[float] = []
    for months_back in range(5, -1, -1):
        synthesized.append(round(cash - net * months_back, 2))
    return synthesized


def _python_forecast(historical: list[float], months: int = 12) -> list[float]:
    """Linear trend extrapolation when Wolfram is unavailable."""
    if len(historical) < 2:
        delta = historical[-1] * 0.05 if historical else 0
        return [round(historical[-1] + delta * (i + 1), 2) for i in range(months)]

    deltas = [historical[i + 1] - historical[i] for i in range(len(historical) - 1)]
    avg_delta = sum(deltas) / len(deltas)
    last = historical[-1]
    return [round(last + avg_delta * (i + 1), 2) for i in range(months)]


def _python_optimal_price(request: ComputationRequest) -> float:
    """Heuristic pricing optimization based on burn coverage goal."""
    base_price = max(request.monthly_revenue / 100, 9.0) if request.monthly_revenue > 0 else 29.0
    deficit = max(request.monthly_burn - request.monthly_revenue, 0)

    if deficit <= 0:
        return round(base_price * 1.1, 2)

    uplift = (deficit * 0.6) / 100
    return round(max(base_price + uplift, base_price), 2)


def _runway_months(cash: float, net_monthly: float) -> int:
    if net_monthly >= 0:
        return 36
    months = int(cash // abs(net_monthly))
    return max(months, 0)


def _wolfram_session():
    from wolframclient.evaluation import WolframLanguageSession

    kwargs: dict = {}
    if settings.wolfram_license_path:
        kwargs["license"] = settings.wolfram_license_path
    return WolframLanguageSession(**kwargs)


def _to_float(value) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _to_float_list(result) -> list[float] | None:
    if result is None:
        return None
    try:
        values = list(result)
        parsed = [_to_float(v) for v in values]
        if any(v is None for v in parsed):
            return None
        return [float(v) for v in parsed]
    except (TypeError, ValueError):
        return None


def _wolfram_forecast(session, historical: list[float], months: int = 12) -> list[float] | None:
    from wolframclient.language import wlexpr

    pairs = ", ".join(f"{{{i + 1}, {v}}}" for i, v in enumerate(historical))
    start = len(historical) + 1
    end = len(historical) + months
    expr = wlexpr(
        "Module[{data, model}, "
        f"data = {{{pairs}}}; "
        "model = LinearModelFit[data, x, x]; "
        f"Table[N[model[i]], {{i, {start}, {end}}}]"
        "]"
    )
    return _to_float_list(session.evaluate(expr))


def _wolfram_optimize(session, request: ComputationRequest) -> float | None:
    from wolframclient.language import wlexpr

    deficit = max(request.monthly_burn - request.monthly_revenue, 0)
    users = 100
    fixed_costs = request.monthly_burn * 0.4
    variable_per_user = request.monthly_burn * 0.006
    min_price = max(deficit / users, 1)
    profit_expr = f"p * {users} - ({fixed_costs} + {variable_per_user} * {users})"

    expr = wlexpr(
        f"NMaximize[{{{profit_expr}, p >= {min_price} && p <= 500}}, p][[2, 1, 2]]"
    )
    return _to_float(session.evaluate(expr))


def _run_wolfram_computation(historical: list[float], request: ComputationRequest) -> tuple[list[float] | None, float | None]:
    with _wolfram_session() as session:
        projected = _wolfram_forecast(session, historical)
        optimal = _wolfram_optimize(session, request)
        return projected, optimal


def _with_timeout(fn, timeout: int = WOLFRAM_TIMEOUT_SECONDS):
    with ThreadPoolExecutor(max_workers=1) as pool:
        future = pool.submit(fn)
        try:
            return future.result(timeout=timeout)
        except FuturesTimeoutError:
            logger.warning("Wolfram computation timed out after %ss", timeout)
            return None


def is_wolfram_available() -> bool:
    for attempt in range(2):
        try:
            with _wolfram_session() as session:
                result = session.evaluate(1 + 1)
                return result == 2
        except Exception as exc:
            logger.warning("Wolfram availability check attempt %s failed: %s", attempt + 1, exc)
    return False


def execute_computation(request: ComputationRequest) -> QuantResult:
    historical = _build_historical_balances(request)

    wolfram_result = _with_timeout(lambda: _run_wolfram_computation(historical, request))
    projected: list[float] | None = None
    optimal: float | None = None

    if wolfram_result is not None:
        projected, optimal = wolfram_result

    source = "wolfram"
    if projected is None:
        projected = _python_forecast(historical)
        source = "python_fallback"

    if optimal is None:
        optimal = _python_optimal_price(request)
        if source == "wolfram":
            source = "wolfram_forecast_only"
        else:
            source = "python_fallback"

    runway = _runway_months(request.cash_reserve, request.net_monthly_flow)

    return QuantResult(
        verified_runway_months=runway,
        optimal_price_point=optimal,
        projected_balances=projected,
        computation_source=source,
    )
