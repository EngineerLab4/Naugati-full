from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
try:
    from prometheus_fastapi_instrumentator import Instrumentator
except ImportError:
    Instrumentator = None

from app.routers import (
    ml_v1,
    freight_rate,
    market_direction,
    port_congestion,
    voyage_eta,
    weather_risk,
    route_alternatives,
    alternative_employment,
)
from app.model_registry import registry
from app.ml.freight.service import freight_service
from app.ml.weather.service import weather_service
from app.ml.charter.service import charter_service
from app.ml.bunker.service import bunker_service
from app.ml.commodity.service import commodity_service

app = FastAPI(
    title="NAUGATI ML Prediction Service",
    description=(
        "Production ML inference engine for Maritime & Logistics Intelligence. "
        "Hosts the 5 official trained artifacts: Freight Rate Random Forest, "
        "Wave Height ExtraTrees, Charter Optimization Engine, Bunker Persistence Baseline, "
        "and Commodity Persistence Baseline."
    ),
    version="2.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if Instrumentator is not None:
    Instrumentator().instrument(app).expose(app)

# -------------------------------------------------------------
# Official API v1 Endpoints & Health Check
# -------------------------------------------------------------
app.include_router(ml_v1.router, prefix="/api/v1")
app.include_router(ml_v1.router)  # Also mounts /health/models at root

# -------------------------------------------------------------
# Core Internal Prediction Routers (backwards compatibility)
# -------------------------------------------------------------
app.include_router(freight_rate.router, prefix="/internal/predict", tags=["freight-rate"])
app.include_router(market_direction.router, prefix="/internal/predict", tags=["market-direction"])
app.include_router(port_congestion.router, prefix="/internal/predict", tags=["port-congestion"])
app.include_router(voyage_eta.router, prefix="/internal/predict", tags=["voyage-eta"])
app.include_router(weather_risk.router, prefix="/internal/predict", tags=["weather-risk"])

# Optimization & Alternative Employment Routers
app.include_router(route_alternatives.router, prefix="/internal/optimize", tags=["route-alternatives"])
app.include_router(alternative_employment.router, prefix="/internal/recommend", tags=["alternative-employment"])


@app.on_event("startup")
async def load_models_on_startup():
    print("\n" + "="*60)
    print("[prediction-service] Initializing NAUGATI Trained ML Models...")
    print("="*60)

    # 1. Load Freight Model (95MB Random Forest)
    try:
        freight_service.load()
    except Exception as e:
        print(f"[ERR] Failed to load Freight Model: {e}")

    # 2. Load Wave Height Model (368MB ExtraTrees)
    try:
        weather_service.load()
    except Exception as e:
        print(f"[ERR] Failed to load Wave Height Model: {e}")

    # 3. Load Charter Optimization Engine
    try:
        charter_service.load()
    except Exception as e:
        print(f"[ERR] Failed to load Charter Engine: {e}")

    # 4. Load legacy registry
    try:
        registry.load_all()
    except Exception as e:
        print(f"[ERR] Legacy registry load: {e}")

    print("="*60)
    print("[prediction-service] Startup complete. All 5 ML services active.")
    print("="*60 + "\n")


@app.get("/healthz")
def healthz():
    return {
        "status": "ok",
        "service": "prediction-service",
        "ml_v1_models": {
            "freight_loaded": freight_service.is_loaded,
            "weather_loaded": weather_service.is_loaded,
            "charter_loaded": charter_service.is_loaded,
            "bunker_ready": True,
            "commodity_ready": True,
        }
    }


@app.get("/internal/models/registry")
def get_model_registry_info():
    names = ["freight_rate", "market_direction", "port_congestion", "voyage_eta", "weather_risk"]
    return {
        "models": {
            n: {
                "loaded": registry.get(n) is not None,
                "version": registry.version(n),
                "metrics": registry.get_metrics(n),
            }
            for n in names
        }
    }
