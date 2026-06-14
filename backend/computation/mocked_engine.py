from __future__ import annotations

import logging
from typing import Any

import numpy as np
from scipy.optimize import minimize

from core.models import SensitivityPoint

logger = logging.getLogger(__name__)


class MockedBackend:
    """Sandbox pure-Python backend using numpy and scipy. No Wolfram dependency."""

    async def forecast_runway(self, historical_balances: list[float], months: int = 12) -> list[float]:
        """Simple linear regression extrapolation."""
        if len(historical_balances) < 2:
            delta = historical_balances[-1] * 0.05 if historical_balances else 0
            return [round(historical_balances[-1] + delta * (i + 1), 2) for i in range(months)]

        x = np.arange(len(historical_balances))
        y = np.array(historical_balances)
        
        # Fit line: y = mx + c
        m, c = np.polyfit(x, y, 1)
        
        projected = []
        start_idx = len(historical_balances)
        for i in range(months):
            val = m * (start_idx + i) + c
            projected.append(round(float(val), 2))
            
        return projected

    async def optimize_price(
        self,
        current_burn: float,
        current_revenue: float,
        price_bounds: tuple[float, float] | None = None
    ) -> float:
        """Find optimal price using simple heuristic/optimization."""
        deficit = max(current_burn - current_revenue, 0)
        base_price = max(current_revenue / 100, 9.0) if current_revenue > 0 else 29.0
        
        if deficit <= 0:
            return round(base_price * 1.1, 2)
            
        min_p = price_bounds[0] if price_bounds else max(base_price * 0.5, 1.0)
        max_p = price_bounds[1] if price_bounds else base_price * 5.0
        
        # Simple objective: minimize absolute difference between simulated revenue and burn
        # Assuming elasticity where higher price = fewer users
        users = 100  # Baseline
        
        def objective(p_array):
            p = p_array[0]
            # Simple demand curve: Q = Q0 * (P/P0)^(-1.5)
            q = users * (p / base_price) ** -1.5
            simulated_revenue = p * q
            return abs(current_burn - simulated_revenue)
            
        res = minimize(objective, [base_price * 1.5], bounds=[(min_p, max_p)])
        return round(float(res.x[0]), 2)

    async def compute_burn_sensitivity(
        self, 
        optimal_price: float, 
        current_cash: float,
        current_burn: float,
        current_revenue: float,
        steps: int = 10
    ) -> list[SensitivityPoint]:
        """Generate grid of pricing vs runway."""
        grid = []
        base_price = max(current_revenue / 100, 9.0) if current_revenue > 0 else 29.0
        users = 100
        
        # Sweep ±30% around optimal price
        prices = np.linspace(optimal_price * 0.7, optimal_price * 1.3, steps)
        
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
        return True
