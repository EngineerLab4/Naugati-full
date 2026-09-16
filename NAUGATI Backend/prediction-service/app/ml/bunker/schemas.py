from pydantic import BaseModel, Field
from typing import Literal

class BunkerForecastRequest(BaseModel):
    fuel_type: str = Field(..., description="Fuel type: VLSFO, IFO380, or MGO", example="VLSFO")
    current_price: float = Field(..., description="Current bunker fuel price in USD per MT", gt=0, example=585.50)

class BunkerForecastResponse(BaseModel):
    fuel_type: str
    current_price_usd_per_mt: float
    forecast_7d_usd_per_mt: float
    expected_change_pct: float
    forecast_horizon_days: int
    forecast_method: Literal["persistence_baseline"] = "persistence_baseline"
    validation_r2: float
    expected_mae_usd_per_mt: float
    status: Literal["MVP_READY", "EXPERIMENTAL"]
    note: str
