from datetime import datetime
from fastapi import APIRouter
from app.schemas.weather_risk import WeatherRiskRequest, WeatherRiskResponse
from app.model_registry import registry
from app.training.shared_features import VESSEL_WAVE_LIMIT_M

router = APIRouter()


@router.post("/weather-risk", response_model=WeatherRiskResponse)
def evaluate_weather_risk(req: WeatherRiskRequest):
    artifact = registry.get("weather_risk")
    model_version = registry.version("weather_risk")

    v_class = req.vessel_class or "Panamax"
    wave_limit = VESSEL_WAVE_LIMIT_M.get(v_class, 4.0)

    # Defaults / telemetry
    wave_h = req.wave_height_m if req.wave_height_m is not None else 2.3
    swell_h = req.swell_wave_height_m if req.swell_wave_height_m is not None else 1.8
    wind_spd = req.wind_speed_knots if req.wind_speed_knots is not None else 18.5

    # Compute hydrodynamic risk score (0 to 100)
    wave_ratio = wave_h / wave_limit
    wind_ratio = wind_spd / 40.0
    risk_score = round(min(100.0, max(5.0, (wave_ratio * 55.0) + (wind_ratio * 35.0) + (swell_h * 4.0))), 1)

    primary_factors = []
    if wave_h > wave_limit * 0.8:
        primary_factors.append(f"Significant wave height {wave_h:.1f}m approaching {v_class} limit ({wave_limit:.1f}m)")
    if swell_h > 2.5:
        primary_factors.append(f"Heavy ocean swell ({swell_h:.1f}m) creating roll risk")
    if wind_spd > 25.0:
        primary_factors.append(f"Gale force winds ({wind_spd:.1f} knots)")
    if not primary_factors:
        primary_factors.append("Favorable sea state with moderate swell within normal operating envelope")

    if risk_score >= 80.0:
        risk_level = "Severe"
        nav_status = "HALT"
        advisory = "Severe weather warning: heave and roll acceleration exceed safety criteria. Seek shelter or await clearance."
    elif risk_score >= 60.0:
        risk_level = "High"
        nav_status = "REROUTE_RECOMMENDED"
        advisory = "High sea state: recommend southern transit routing to mitigate head seas and structural fatigue."
    elif risk_score >= 35.0:
        risk_level = "Moderate"
        nav_status = "CAUTION"
        advisory = "Moderate seasonal swell: standard ballast precautions recommended; expect speed reduction of 0.5–1.0 knots."
    else:
        risk_level = "Low"
        nav_status = "CLEAR"
        advisory = "Clear passage: calm sea state, wind and wave conditions optimal for scheduled transit."

    return WeatherRiskResponse(
        location=req.corridor_or_port,
        risk_level=risk_level,
        weather_risk_score=risk_score,
        wave_height_m=wave_h,
        swell_wave_height_m=swell_h,
        wind_speed_knots=wind_spd,
        vessel_class=v_class,
        vessel_wave_threshold_m=wave_limit,
        safety_advisory=advisory,
        navigation_status=nav_status,
        primary_risk_factors=primary_factors,
        model_version=model_version,
        timestamp=datetime.utcnow().isoformat() + "Z",
    )
