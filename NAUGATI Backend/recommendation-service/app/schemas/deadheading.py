from pydantic import BaseModel


class DeadheadingRequest(BaseModel):
    vessel_id: str
    loading_port_id: str


class AlternativeNearbyVessel(BaseModel):
    vessel_id: str
    distance_nm: float
    cost: float


class DeadheadingResponse(BaseModel):
    empty_repositioning_nm: float
    estimated_cost: float
    alternative_nearby_vessels: list[AlternativeNearbyVessel]
    savings_estimate: float
