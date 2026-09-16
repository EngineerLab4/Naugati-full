from fastapi import HTTPException
from app.ml.config import COMMODITY_METADATA
from app.ml.commodity.schemas import CommodityForecastRequest, CommodityForecastResponse

class CommodityService:
    def __init__(self):
        self.metadata = COMMODITY_METADATA
        self.coal_meta = self.metadata.get("Australian_Thermal_Coal", {})
        self.iron_ore_meta = self.metadata.get("Iron_Ore", {})

    def predict(self, req: CommodityForecastRequest) -> CommodityForecastResponse:
        comm = req.commodity.lower().strip()
        price = round(float(req.current_price), 2)
        note = self.metadata.get("note", "Commodity baseline evaluation.")

        if comm in ["coal", "thermal coal", "australian thermal coal"]:
            return CommodityForecastResponse(
                commodity="Australian Thermal Coal",
                current_price_usd_per_mt=price,
                forecast_1m_usd_per_mt=price,
                expected_change_pct=0.0,
                forecast_horizon=self.coal_meta.get("forecast_horizon", "1 month"),
                forecast_method="persistence_baseline",
                validation_r2=self.coal_meta.get("validation_r2", 0.9563),
                test_r2=self.coal_meta.get("test_r2", 0.8750),
                expected_mae_usd_per_mt=self.coal_meta.get("test_mae_usd_per_mt", 13.97),
                status=self.coal_meta.get("status", "MVP_READY"),
                message="Australian Thermal Coal uses a validated 1-month persistence baseline.",
                note=note
            )

        elif comm in ["iron ore", "iron ore fines"]:
            # Per author's spec: Iron Ore did not meet generalization threshold (test R² = 0.5428)
            # Do NOT invent or return a fabricated forecast number
            return CommodityForecastResponse(
                commodity="Iron Ore",
                current_price_usd_per_mt=price,
                forecast_1m_usd_per_mt=None,
                expected_change_pct=None,
                forecast_horizon=self.iron_ore_meta.get("forecast_horizon", "1 month"),
                forecast_method="persistence_baseline",
                validation_r2=self.iron_ore_meta.get("best_validation_r2", 0.8379),
                test_r2=self.iron_ore_meta.get("test_r2", 0.5428),
                expected_mae_usd_per_mt=self.iron_ore_meta.get("test_mae_usd_per_mt", 6.49),
                status="EXPERIMENTAL",
                message="Current model did not meet the MVP generalization threshold (test R² 0.5428 < 0.80). No commercial forecast is generated.",
                note=note
            )

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported commodity '{req.commodity}'. Supported commodities: ['Thermal Coal', 'Iron Ore']"
            )

commodity_service = CommodityService()
