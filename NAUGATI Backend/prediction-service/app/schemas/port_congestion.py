from typing import Optional, Literal, Dict, Any, List
from pydantic import BaseModel


class PortCongestionRequest(BaseModel):
    port_name: str = "Dhamra"
    vessels_waiting: Optional[float] = None
    historic_tat_hours: Optional[float] = None
    observation_date: Optional[str] = None


class PortCongestionResponse(BaseModel):
    port_name: str
    congestion_level: Literal["Low", "Medium", "High", "Severe"]
    average_waiting_hours: float
    average_waiting_days: float
    vessels_in_queue: int
    congestion_score: float # 0 to 100
    berth_turnaround_hours: float
    delay_risk: str
    historical_benchmark_hours: float
    confidence: float
    model_version: str
    timestamp: str
