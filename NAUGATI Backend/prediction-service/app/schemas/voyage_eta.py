from typing import Optional, Literal, Dict, Any, List
from pydantic import BaseModel


class VoyageEtaRequest(BaseModel):
    origin: str = "Hay Point"
    destination: str = "Dhamra"
    distance_remaining_nm: Optional[float] = None
    vessel_speed_knots: Optional[float] = None
    vessel_delay_hist_hours: Optional[float] = None
    destination_waiting_hours: Optional[float] = None
    vessel_class: Optional[str] = "Panamax"
    departure_date: Optional[str] = None


class DelayFactor(BaseModel):
    factor: str
    impact: str
    severity: Literal["low", "medium", "high"]


class Milestone(BaseModel):
    name: str
    date: str
    status: Literal["completed", "in_progress", "scheduled"]


class VoyageEtaResponse(BaseModel):
    origin: str
    destination: str
    estimated_ocean_arrival: str
    estimated_berthing: str
    estimated_completion: str
    transit_days: float
    total_voyage_days: float
    delay_probability_percent: int
    expected_delay_days: float
    primary_delay_factors: List[DelayFactor]
    milestones: List[Milestone]
    model_version: str
    timestamp: str
