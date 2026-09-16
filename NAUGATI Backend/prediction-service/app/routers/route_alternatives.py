from fastapi import APIRouter, HTTPException
from app.schemas.route_alternatives import RouteRequest, RouteResponse
from app.model_registry import registry

router = APIRouter()


@router.post("/route", response_model=RouteResponse)
def optimize_route(req: RouteRequest):
    model = registry.get("route_alternatives")

    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Route alternatives model is currently unavailable. No synthetic routing generated."
        )

    features = req.model_dump()
    prediction = model.predict(features)
    return prediction
