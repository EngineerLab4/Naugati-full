from typing import Optional, Literal, Dict, Any, List
from pydantic import BaseModel


class WeatherRiskRequest(BaseModel):
    corridor_or_port: str = "Bay of Bengal (Central Corridor)"
    latitude: Optional[float] = 13.85
    longitude: Optional[float] = 85.98
    vessel_class: Optional[str] = "Panamax"
    wave_height_m: Optional[float] = None
    wind_speed_knots: Optional[float] = None
    swell_wave_height_m: Optional[float] = None


class WeatherRiskResponse(BaseModel):
    location: str
    risk_level: Literal["Low", "Moderate", "High", "Severe"]
    weather_risk_score: float # 0 to 100
    wave_height_m: float
    swell_wave_height_m: float
    wind_speed_knots: float
    vessel_class: str
    vessel_wave_threshold_m: float
    safety_advisory: str
    navigation_status: Literal["CLEAR", "CAUTION", "REROUTE_RECOMMENDED", "HALT"]
    primary_risk_factors: List[str]
    model_version: str
    timestamp: str
