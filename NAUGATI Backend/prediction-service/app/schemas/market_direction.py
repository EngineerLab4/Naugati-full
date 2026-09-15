from typing import Optional, Literal, Dict, Any, List
from pydantic import BaseModel


class MarketDirectionRequest(BaseModel):
    commodity: str = "Iron ore fines"
    price_usd: Optional[float] = None
    return_7d: Optional[float] = None
    return_14d: Optional[float] = None
    return_30d: Optional[float] = None
    volatility_30d: Optional[float] = None
    sma_7_to_30: Optional[float] = None


class MarketDirectionResponse(BaseModel):
    commodity: str
    direction: Literal["UP", "DOWN", "STABLE"]
    horizon: str = "7-day"
    confidence: float
    probabilities: Dict[str, float]
    predicted_return_estimate: float
    market_rationale: str
    model_version: str
    timestamp: str
