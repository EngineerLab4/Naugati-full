from fastapi import APIRouter, Query
from app.schemas.risk import RiskResponse

router = APIRouter()

# DESIGN.md §7 — GET /internal/risk?scope=&ref=
# Composed from ingested weather/global-trade/congestion events
# (ARCHITECTURE.md §5); risk scoring itself is a weighted composite, not a
# trained model, per DESIGN.md §8.


@router.get("/risk", response_model=RiskResponse)
def get_risk(scope: str = Query(...), ref: str = Query(...)):
    # TODO: pull latest weather/congestion/trade-risk rows for `ref`
    # (route|region|port id) and compute a weighted composite score.
    factors = {
        "geopolitical": 0.3,
        "weather": 0.2,
        "port_congestion": 0.25,
        "trade_restrictions": 0.15,
        "sanctions": 0.05,
        "regional_conflict": 0.1,
        "canal_disruption": 0.0,
        "fuel_price_risk": 0.2,
    }
    overall = sum(factors.values()) / len(factors)
    level = "low" if overall < 0.2 else "medium" if overall < 0.4 else "high"

    return RiskResponse(
        **factors,
        overall_level=level,
        explanation=f"Composite risk for {scope}={ref} based on latest ingested weather, congestion, and trade-risk data.",
    )
