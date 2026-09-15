from fastapi import APIRouter
from app.schemas.vessel_type import VesselTypeRequest, VesselTypeResponse, VesselTypeComparisonRow

router = APIRouter()

# DESIGN.md §3/§7 — step 2 of the Shipment flow, runs in PARALLEL with step 1
# (freight prediction in prediction-service). Rule-based / heuristic scoring
# from cargo qty + port draft restrictions — not a trained model.


@router.post("/vessel-type", response_model=VesselTypeResponse)
def recommend_vessel_type(req: VesselTypeRequest):
    # TODO: look up the Shipment row by shipment_id (via core-api internal
    # read or a shared read replica), then score candidate vessel types
    # against cargo_qty, port draft_restriction, max_vessel_size.
    comparison = [
        VesselTypeComparisonRow(type="handysize", score=0.55, why="Fits smaller port drafts, lower cargo fit"),
        VesselTypeComparisonRow(type="panamax", score=0.82, why="Best fit for cargo quantity and port limits"),
        VesselTypeComparisonRow(type="capesize", score=0.30, why="Oversized for this cargo quantity"),
    ]
    best = max(comparison, key=lambda c: c.score)
    return VesselTypeResponse(
        recommended_type=best.type,
        comparison=comparison,
        candidate_vessel_ids=[],  # TODO: join against Vessel table for real candidates
    )
