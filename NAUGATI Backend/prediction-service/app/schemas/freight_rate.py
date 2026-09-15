from typing import Optional, Literal, List, Dict, Any
from pydantic import BaseModel, Field


class FreightRateRequest(BaseModel):
    shipment_id: Optional[str] = None
    origin: str
    destination: str
    vessel_type: Optional[str] = "Panamax"
    cargo_qty: float = 75000.0
    loading_date: str = "2026-09-20"
    distance_nm: Optional[float] = None
    commodity_price_usd: Optional[float] = None
    brent_crude_usd: Optional[float] = None
    usd_index: Optional[float] = None


class FreightFactors(BaseModel):
    weather: float = 0.10
    global_market: float = 0.45
    vessel_availability: float = 0.25
    commodity_price: float = 0.20


class TimeSeriesPoint(BaseModel):
    date: str
    actual: Optional[float] = None
    forecast: Optional[float] = None
    upper: Optional[float] = None
    lower: Optional[float] = None


class FreightRateResponse(BaseModel):
    predicted_rate: float
    current_rate: float
    range_low: float
    range_high: float
    confidence: float
    trend: Literal["up", "down", "flat", "Increasing (+5.5%)", "Stable / Softening"]
    forecast_1m: Optional[float] = None
    forecast_3m: Optional[float] = None
    forecast_6m: Optional[float] = None
    forecast_7d: Optional[float] = None
    forecast_14d: Optional[float] = None
    forecast_30d: Optional[float] = None
    forecast_90d: Optional[float] = None
    recommended_action: Literal["wait", "book_now", "BOOK NOW", "WAIT", "MONITOR"]
    market_action_reason: Optional[str] = None
    historical_series: List[float] = []
    forecast_short: List[float] = []
    forecast_mid: List[float] = []
    time_series: List[Dict[str, Any]] = []
    factors: FreightFactors
    model_version: str
