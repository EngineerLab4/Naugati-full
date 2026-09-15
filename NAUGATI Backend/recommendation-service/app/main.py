from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

from app.routers import vessel_type, contract, eta, risk, deadheading

# DESIGN.md §1: recommendation-service = ETA computation, risk scoring,
# deadheading optimization, and Shipment orchestration (vessel-type +
# contract steps). None of these require a trained model — they're computed
# from live inputs (DESIGN.md §8) — which is why they live here, not in
# prediction-service.

app = FastAPI(
    title="NAUGATI recommendation-service",
    description="ETA, risk scoring, deadheading optimization, vessel-type & contract recommendation",
    version="0.1.0",
)

Instrumentator().instrument(app).expose(app)

app.include_router(vessel_type.router, prefix="/internal/recommend", tags=["vessel-type"])
app.include_router(contract.router, prefix="/internal/recommend", tags=["contract"])
app.include_router(eta.router, prefix="/internal/predict", tags=["eta"])
app.include_router(risk.router, prefix="/internal", tags=["risk"])
app.include_router(deadheading.router, prefix="/internal/optimize", tags=["deadheading"])


@app.get("/healthz")
def healthz():
    return {"status": "ok"}
