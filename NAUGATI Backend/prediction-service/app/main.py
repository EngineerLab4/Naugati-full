from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
try:
    from prometheus_fastapi_instrumentator import Instrumentator
except ImportError:
    Instrumentator = None

from app.routers import (
    freight_rate,
    market_direction,
    port_congestion,
    voyage_eta,
    weather_risk,
    route_alternatives,
    alternative_employment,
)
from app.model_registry import registry

app = FastAPI(
    title="NAUGATI ML Prediction Service",
    description=(
        "Production-oriented ML inference engine for Maritime & Logistics Intelligence. "
        "Hosts Freight Rate (1M, 3M, 6M), 7-Day Market Direction, Port Congestion, "
        "Voyage ETA, and Maritime Weather Risk models."
    ),
    version="1.0.0",
)

# CORS middleware for frontend and service-to-service communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if Instrumentator is not None:
    Instrumentator().instrument(app).expose(app)

# Core 5 ML Prediction Routers
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
    print("[prediction-service] Starting up and loading trained models into registry...")
    registry.load_all()
    print(f"[prediction-service] Loaded models: {registry.loaded_model_names()}")


@app.get("/healthz")
def healthz():
    return {
        "status": "ok",
        "service": "prediction-service",
        "models_loaded": registry.loaded_model_names(),
        "versions": {m: registry.version(m) for m in registry.loaded_model_names()},
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
