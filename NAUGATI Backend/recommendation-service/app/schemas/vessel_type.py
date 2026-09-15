from pydantic import BaseModel


class VesselTypeRequest(BaseModel):
    shipment_id: str


class VesselTypeComparisonRow(BaseModel):
    type: str
    score: float
    why: str


class VesselTypeResponse(BaseModel):
    recommended_type: str  # handysize | panamax | capesize | ...
    comparison: list[VesselTypeComparisonRow]
    candidate_vessel_ids: list[str] = []
