from fastapi import APIRouter
from app.schemas.deadheading import DeadheadingRequest, DeadheadingResponse, AlternativeNearbyVessel

router = APIRouter()

# DESIGN.md §4/§7/§8 — shipowner-initiated (never a background scan).
# Distance/cost math uses PostGIS spatial queries per ARCHITECTURE.md §9,
# not a trained model.


@router.post("/deadheading", response_model=DeadheadingResponse)
def optimize_deadheading(req: DeadheadingRequest):
    # TODO: PostGIS distance query from vessel's current position
    # (VesselState) to loading_port_id; find nearby vessels via spatial index.
    empty_repositioning_nm = 850.0
    cost_per_nm = 45.0  # placeholder bunker+opex rate

    return DeadheadingResponse(
        empty_repositioning_nm=empty_repositioning_nm,
        estimated_cost=empty_repositioning_nm * cost_per_nm,
        alternative_nearby_vessels=[
            AlternativeNearbyVessel(vessel_id="mock-vessel-1", distance_nm=210, cost=210 * cost_per_nm),
            AlternativeNearbyVessel(vessel_id="mock-vessel-2", distance_nm=340, cost=340 * cost_per_nm),
        ],
        savings_estimate=(empty_repositioning_nm - 210) * cost_per_nm,
    )
