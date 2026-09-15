from pydantic import BaseModel


class ContractRequest(BaseModel):
    shipment_id: str
    freight_prediction_id: str  # hard dependency — NOT optional, per DESIGN.md §5/§7


class ContractReasons(BaseModel):
    freight_trend: str
    volatility: str
    demand: str
    vessel_availability: str
    geopolitical_risk: str
    port_conditions: str


class ContractComparisonRow(BaseModel):
    type: str
    score: float


class ContractResponse(BaseModel):
    recommended_type: str  # spot | short | medium | long
    reasons: ContractReasons
    comparison: list[ContractComparisonRow]
