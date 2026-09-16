from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, Literal

class FreightPredictRequest(BaseModel):
    origin_port: str = Field(..., description="Origin port name (e.g., 'Newcastle', 'Abbot Point')", example="Newcastle")
    destination_port: str = Field(..., description="Destination port name (e.g., 'Paradip', 'Dhamra')", example="Paradip")
    cargo_type: str = Field(..., description="Cargo commodity type (e.g., 'Thermal coal', 'Iron ore')", example="Thermal coal")
    cargo_quantity_mt: float = Field(..., description="Cargo shipment quantity in metric tons", gt=0, example=75000)
    vessel_type: str = Field(..., description="Vessel class: Capesize, Panamax, Supramax, Handysize", example="Panamax")
    trade_direction: str = Field("IMPORT_TO_INDIA", description="'IMPORT_TO_INDIA' or 'EXPORT_FROM_INDIA'", example="IMPORT_TO_INDIA")
    
    # Optional calendar parameters (auto-derived from current/loading date if omitted)
    year: Optional[int] = Field(None, example=2026)
    month: Optional[int] = Field(None, ge=1, le=12, example=9)
    quarter: Optional[int] = Field(None, ge=1, le=4, example=3)
    month_sin: Optional[float] = None
    month_cos: Optional[float] = None

    # Optional explicit macro lags (auto-assembled from live FRED/Alpha Vantage if omitted)
    igrea_lag_1m: Optional[float] = None
    igrea_lag_3m: Optional[float] = None
    igrea_lag_6m: Optional[float] = None
    brent_usd_per_bbl_lag_1m: Optional[float] = None
    brent_usd_per_bbl_lag_3m: Optional[float] = None
    inr_per_usd_lag_1m: Optional[float] = None
    coal_australia_usd_per_mt_lag_1m: Optional[float] = None
    iron_ore_usd_per_mt_lag_1m: Optional[float] = None
    india_industrial_production_index_lag_1m: Optional[float] = None

class FreightPredictResponse(BaseModel):
    origin_port: str
    destination_port: str
    cargo_type: str
    cargo_quantity_mt: float
    vessel_type: str
    trade_direction: str
    predicted_freight_rate_usd_per_mt: float
    unit: str = "USD/MT"
    status: Literal["MVP_READY"] = "MVP_READY"
    model_version: str = "naugati_freight_rf_v1"
    feature_vector: Dict[str, Any]
