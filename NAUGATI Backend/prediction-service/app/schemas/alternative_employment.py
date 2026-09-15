from typing import Optional, Literal
from pydantic import BaseModel


class AlternativeEmploymentRequest(BaseModel):
    vessel_id: str


class AlternativeEmploymentSuggestion(BaseModel):
    suggestion_type: Literal[
        "nearby_cargo", "backhaul", "triangulation", "spot_market", "alternative_port"
    ]
    cargo_ref: Optional[str] = None
    port_ref: Optional[str] = None
    score: float
    model_version: str
