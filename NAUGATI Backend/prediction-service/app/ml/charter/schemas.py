from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any, Literal

class CharterCandidate(BaseModel):
    vessel_type: str
    feasible: bool
    status: str
    voyages_required: int
    draft_margin_m: float
    freight_rate_usd_mt: Optional[float] = None
    estimated_bunker_cost_usd: Optional[float] = None
    delay_cost_usd: Optional[float] = None
    final_decision_cost_usd: Optional[float] = None
    final_cost_per_mt: Optional[float] = None

class CharterRecommendation(BaseModel):
    vessel_type: str
    voyages_required: int
    freight_rate_usd_mt: float
    final_decision_cost_usd: float
    final_cost_per_mt: float
    draft_margin_m: float

class CharterOptimizeRequest(BaseModel):
    cargo_quantity_mt: float = Field(..., description="Cargo shipment quantity in metric tons", gt=0, example=75000)
    route_distance_nm: float = Field(..., description="One-way route nautical miles", gt=0, example=4120.0)
    port_draft_limit_m: float = Field(..., description="Maximum allowable port draft in meters", gt=0, example=14.5)
    
    # Optional origin/destination for auto-wiring upstream ML models
    origin_port: Optional[str] = Field("Newcastle", example="Newcastle")
    destination_port: Optional[str] = Field("Paradip", example="Paradip")
    cargo_type: Optional[str] = Field("Thermal coal", example="Thermal coal")

    # Optional manual overrides for integrated upstream inputs
    bunker_price_usd_mt: Optional[float] = Field(None, description="Bunker price (VLSFO). Auto-sourced if omitted.")
    freight_rates: Optional[Dict[str, float]] = Field(None, description="Per-vessel freight rates. Auto-predicted if omitted.")
    congestion_level: Optional[Literal["LOW", "MEDIUM", "HIGH", "SEVERE"]] = Field("MEDIUM", example="MEDIUM")
    wave_height_m: Optional[float] = Field(None, description="Route wave height in meters. Auto-predicted if omitted.")
    port_days_per_voyage: Optional[float] = Field(2.0, ge=0)

class CharterOptimizeResponse(BaseModel):
    status: str
    charter_mode: Literal["VOYAGE_CHARTER"] = "VOYAGE_CHARTER"
    input: Dict[str, Any]
    market_conditions: Dict[str, Any]
    recommendation: Optional[CharterRecommendation] = None
    candidates: List[CharterCandidate]
    operational_assumptions: Dict[str, Any]
