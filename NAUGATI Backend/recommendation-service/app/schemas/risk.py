from typing import Literal
from pydantic import BaseModel


class RiskResponse(BaseModel):
    geopolitical: float
    weather: float
    port_congestion: float
    trade_restrictions: float
    sanctions: float
    regional_conflict: float
    canal_disruption: float
    fuel_price_risk: float
    overall_level: Literal["low", "medium", "high"]
    explanation: str
