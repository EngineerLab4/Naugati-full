from fastapi import APIRouter, HTTPException
from app.schemas.contract import ContractRequest, ContractResponse, ContractReasons, ContractComparisonRow

router = APIRouter()

# DESIGN.md §3/§5/§7 — step 3 of the Shipment flow. Hard dependency on
# freight_prediction_id: contract advice is explicitly "on the basis of
# future predicted freight rate", so core-api MUST call this only after
# step 1 (freight-rate) has returned, never in parallel with it.


@router.post("/contract", response_model=ContractResponse)
def recommend_contract(req: ContractRequest):
    if not req.freight_prediction_id:
        # Enforce the ordering constraint at the API boundary too, not just
        # in the DB NOT NULL column (DESIGN.md §8).
        raise HTTPException(
            status_code=400,
            detail="freight_prediction_id is required — contract recommendation depends on a completed freight prediction",
        )

    # TODO: pull the FreightPrediction row (trend/confidence) plus current
    # RiskScore for the route to build real reasons/comparison.
    comparison = [
        ContractComparisonRow(type="spot", score=0.40),
        ContractComparisonRow(type="short", score=0.71),
        ContractComparisonRow(type="medium", score=0.58),
        ContractComparisonRow(type="long", score=0.35),
    ]
    best = max(comparison, key=lambda c: c.score)

    return ContractResponse(
        recommended_type=best.type,
        reasons=ContractReasons(
            freight_trend="Rates trending upward over the forecast horizon",
            volatility="Moderate — short-term rate swings observed",
            demand="Stable regional demand",
            vessel_availability="Adequate supply of panamax tonnage",
            geopolitical_risk="Low on the primary route",
            port_conditions="Normal congestion at both ends",
        ),
        comparison=comparison,
    )
