from fastapi import APIRouter
from app.schemas.route_alternatives import RouteRequest, RouteResponse, RouteAlternative, RouteZones
from app.model_registry import registry

router = APIRouter()

# DESIGN.md §7 — POST /internal/optimize/route
# "alternatives + duration_hrs are model output, not geometry-only" — this is
# one of the three trained models (Route Alternatives / Voyage Time), per
# ARCHITECTURE.md §1/§4. Raw geometry itself comes from Mapbox via
# ingestion-service; this router adds the learned alternatives + ETA layer
# on top of that geometry.


@router.post("/route", response_model=RouteResponse)
def optimize_route(req: RouteRequest):
    model = registry.get("route_alternatives")

    if model is None:
        # Dev-mode mock. Real geometry should come from a Mapbox-backed
        # lookup (ingestion-service cache) keyed by origin/destination.
        planned_route = {
            "origin_port_id": req.origin_port_id,
            "destination_port_id": req.destination_port_id,
            "geometry": {"type": "LineString", "coordinates": []},
        }
        alternatives = [
            RouteAlternative(kind="fastest", geometry={}, distance_nm=4200, duration_hrs=310, risk_level="medium"),
            RouteAlternative(kind="cheapest", geometry={}, distance_nm=4550, duration_hrs=340, risk_level="low"),
            RouteAlternative(kind="safest", geometry={}, distance_nm=4700, duration_hrs=360, risk_level="low"),
        ]
        return RouteResponse(
            planned_route=planned_route,
            alternatives=alternatives,
            zones=RouteZones(weather=[], congestion=[], risk=[]),
            model_version=registry.version("route_alternatives"),
        )

    features = req.model_dump()
    prediction = model.predict(features)
    return prediction
