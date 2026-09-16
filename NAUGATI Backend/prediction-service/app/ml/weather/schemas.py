from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, Literal

class WaveHeightRequest(BaseModel):
    loc: str = Field(..., description="Target port / marine location (e.g., 'Paradip Port', 'Dhamra Port')", example="Paradip Port")
    # Optional direct sensor/historical overrides (if provided by caller, used directly)
    wind_speed: Optional[float] = Field(None, description="Current wind speed in knots/m/s", ge=0)
    wave_height: Optional[float] = Field(None, description="Current significant wave height in meters", ge=0)
    rainfall: Optional[float] = Field(None, description="Current rainfall in mm", ge=0)
    # Target timestamp or day for seasonal features
    target_date: Optional[str] = Field(None, description="Target date YYYY-MM-DD", example="2026-09-20")

class WaveHeightResponse(BaseModel):
    loc: str
    target_date: str
    forecast_horizon: str = "1 day"
    predicted_wave_height_m: float
    current_wave_height_m: float
    current_wind_speed: float
    current_rainfall_mm: float
    confidence: Literal["experimental"] = "experimental"
    status: Literal["EXPERIMENTAL"] = "EXPERIMENTAL"
    validation_r2: float
    required_r2: float
    validation_mae_m: float
    validation_rmse_m: float
    production_threshold_met: bool = False
    data_period: str
    model_type: str = "ExtraTreesRegressor"
    disclaimer: str
    features_used: Dict[str, Any]
