from fastapi import HTTPException
from app.ml.config import BUNKER_METADATA
from app.ml.bunker.schemas import BunkerForecastRequest, BunkerForecastResponse

class BunkerService:
    def __init__(self):
        self.metadata = BUNKER_METADATA
        self.fuels = self.metadata.get("fuels", {})

    def predict(self, req: BunkerForecastRequest) -> BunkerForecastResponse:
        fuel_key = req.fuel_type.strip().upper()
        if fuel_key not in self.fuels:
            supported = list(self.fuels.keys())
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported fuel type '{req.fuel_type}'. Supported types: {supported}"
            )

        fuel_meta = self.fuels[fuel_key]
        price = round(float(req.current_price), 2)

        return BunkerForecastResponse(
            fuel_type=fuel_key,
            current_price_usd_per_mt=price,
            forecast_7d_usd_per_mt=price,
            expected_change_pct=0.0,
            forecast_horizon_days=self.metadata.get("forecast_horizon_days", 7),
            forecast_method="persistence_baseline",
            validation_r2=fuel_meta.get("validation_r2", 0.0),
            expected_mae_usd_per_mt=fuel_meta.get("validation_mae_usd_per_mt", 0.0),
            status=fuel_meta.get("status", "EXPERIMENTAL"),
            note=self.metadata.get("note", "Persistence baseline forecast.")
        )

bunker_service = BunkerService()
