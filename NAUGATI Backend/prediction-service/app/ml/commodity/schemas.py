from pydantic import BaseModel, Field
from typing import Optional, Literal

class CommodityForecastRequest(BaseModel):
    commodity: str = Field(..., description="Commodity name (e.g. 'Thermal Coal', 'Iron Ore')", example="Thermal Coal")
    current_price: float = Field(..., description="Current commodity spot price in USD per MT", gt=0, example=138.50)

class CommodityForecastResponse(BaseModel):
    commodity: str
    current_price_usd_per_mt: Optional[float] = None
    forecast_1m_usd_per_mt: Optional[float] = None
    expected_change_pct: Optional[float] = None
    forecast_horizon: Optional[str] = "1 month"
    forecast_method: Optional[Literal["persistence_baseline"]] = "persistence_baseline"
    validation_r2: Optional[float] = None
    test_r2: Optional[float] = None
    expected_mae_usd_per_mt: Optional[float] = None
    status: Literal["MVP_READY", "EXPERIMENTAL"]
    message: Optional[str] = None
    note: str
