from fastapi import APIRouter
from app.ml.freight.schemas import FreightPredictRequest, FreightPredictResponse
from app.ml.freight.service import freight_service
from app.ml.weather.schemas import WaveHeightRequest, WaveHeightResponse
from app.ml.weather.service import weather_service
from app.ml.charter.schemas import CharterOptimizeRequest, CharterOptimizeResponse
from app.ml.charter.service import charter_service
from app.ml.bunker.schemas import BunkerForecastRequest, BunkerForecastResponse
from app.ml.bunker.service import bunker_service
from app.ml.commodity.schemas import CommodityForecastRequest, CommodityForecastResponse
from app.ml.commodity.service import commodity_service
from app.ml.config import WEATHER_METADATA, BUNKER_METADATA, COMMODITY_METADATA, CHARTER_METADATA

router = APIRouter()

# -------------------------------------------------------------
# 1. Freight Rate Model
# -------------------------------------------------------------
@router.post("/freight/predict", response_model=FreightPredictResponse, tags=["Freight"])
def predict_freight(req: FreightPredictRequest):
    return freight_service.predict(req)

# -------------------------------------------------------------
# 2. Wave Height / Weather Model
# -------------------------------------------------------------
@router.post("/weather/wave-height", response_model=WaveHeightResponse, tags=["Weather"])
def predict_wave_height(req: WaveHeightRequest):
    return weather_service.predict(req)

# -------------------------------------------------------------
# 3. Charter Optimization Engine
# -------------------------------------------------------------
@router.post("/charter/optimize", response_model=CharterOptimizeResponse, tags=["Charter Optimization"])
def optimize_charter(req: CharterOptimizeRequest):
    return charter_service.optimize(req)

# -------------------------------------------------------------
# 4. Bunker Fuel Forecast (Persistence Baseline)
# -------------------------------------------------------------
@router.post("/bunker/forecast", response_model=BunkerForecastResponse, tags=["Bunker"])
def forecast_bunker(req: BunkerForecastRequest):
    return bunker_service.predict(req)

# -------------------------------------------------------------
# 5. Commodity Price Forecast (Persistence Baseline)
# -------------------------------------------------------------
@router.post("/commodity/forecast", response_model=CommodityForecastResponse, tags=["Commodity"])
def forecast_commodity(req: CommodityForecastRequest):
    return commodity_service.predict(req)

# -------------------------------------------------------------
# 6. Health Check / Model Status Reporting
# -------------------------------------------------------------
@router.get("/health/models", tags=["Health"])
def get_models_health():
    return {
        "status": "healthy",
        "models": {
            "freight_rate_rf_v1": {
                "loaded": freight_service.is_loaded,
                "type": "RandomForestRegressor",
                "status": "MVP_READY",
                "required_scikit_learn": "1.6.1",
                "features_count": len(freight_service.feature_names) if freight_service.is_loaded else 0,
            },
            "wave_height_1day": {
                "loaded": weather_service.is_loaded,
                "type": WEATHER_METADATA.get("model_type", "ExtraTreesRegressor"),
                "status": WEATHER_METADATA.get("status", "EXPERIMENTAL"),
                "validation_r2": WEATHER_METADATA.get("validation_r2", 0.79205),
                "required_r2": WEATHER_METADATA.get("required_r2", 0.8),
                "production_threshold_met": False,
                "note": "Validation R² below production threshold (0.80). Marked EXPERIMENTAL.",
            },
            "charter_optimization_engine": {
                "loaded": charter_service.is_loaded,
                "type": CHARTER_METADATA.get("type", "Operations Research / Rule-Based Optimizer"),
                "status": CHARTER_METADATA.get("status", "MVP_READY"),
                "supported_vessel_classes": CHARTER_METADATA.get("supported_vessel_classes", []),
            },
            "bunker_fuel_forecast": {
                "loaded": True,
                "type": BUNKER_METADATA.get("forecast_type", "persistence_baseline"),
                "status": "MVP_READY (VLSFO, IFO380) / EXPERIMENTAL (MGO)",
                "fuels": BUNKER_METADATA.get("fuels", {}),
                "note": BUNKER_METADATA.get("note", ""),
            },
            "commodity_price_forecast": {
                "loaded": True,
                "type": "persistence_baseline",
                "status": "MVP_READY (Australian Thermal Coal) / EXPERIMENTAL (Iron Ore)",
                "coal_status": COMMODITY_METADATA.get("Australian_Thermal_Coal", {}).get("status"),
                "iron_ore_status": COMMODITY_METADATA.get("Iron_Ore", {}).get("status"),
                "note": COMMODITY_METADATA.get("note", ""),
            },
        }
    }
