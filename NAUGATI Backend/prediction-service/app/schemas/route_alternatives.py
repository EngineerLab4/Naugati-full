from typing import Optional
from pydantic import BaseModel


class RouteRequest(BaseModel):
    origin_port_id: str
    destination_port_id: str
    vessel_id: Optional[str] = None


class RouteAlternative(BaseModel):
    kind: str  # fastest | cheapest | safest | recommended
    geometry: dict
    distance_nm: float
    duration_hrs: float
    risk_level: str


class RouteZones(BaseModel):
    weather: list = []
    congestion: list = []
    risk: list = []


class RouteResponse(BaseModel):
    planned_route: dict
    alternatives: list[RouteAlternative]
    zones: RouteZones
    model_version: str
