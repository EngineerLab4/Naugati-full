from pydantic import BaseModel


class EtaRequest(BaseModel):
    vessel_id: str
    position: dict | None = None  # v1: user-entered per DESIGN.md §7
    speed: float | None = None
    distance: float | None = None
    route: dict | None = None


class EtaFactors(BaseModel):
    weather: float
    port_congestion: float
    historic_turnaround: float


class EtaResponse(BaseModel):
    eta_timestamp: str
    confidence: float
    delay_probability: float
    expected_delay_hrs: float
    factors: EtaFactors
    model_version: str
