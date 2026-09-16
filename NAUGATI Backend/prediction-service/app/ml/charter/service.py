import math
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from fastapi import HTTPException

from app.ml.config import (
    CHARTER_DIR,
    CHARTER_METADATA,
    CONGESTION_DELAY_DAYS_MAP,
    WEATHER_RISK_THRESHOLDS,
    MULTI_VOYAGE_PENALTY_USD,
    DELAY_BUNKER_CONSUMPTION_FACTOR,
    DEFAULT_PORT_DAYS_PER_VOYAGE,
    ROUND_TRIP_FACTOR,
)
from app.ml.charter.schemas import (
    CharterOptimizeRequest,
    CharterOptimizeResponse,
    CharterRecommendation,
    CharterCandidate,
)
from app.ml.freight.service import freight_service
from app.ml.freight.schemas import FreightPredictRequest
from app.ml.weather.service import weather_service
from app.ml.weather.schemas import WaveHeightRequest
from app.ml.bunker.service import bunker_service
from app.ml.bunker.schemas import BunkerForecastRequest

class CharterService:
    def __init__(self):
        self.metadata = CHARTER_METADATA
        self.vessel_master_df = None
        self.is_loaded = False

    def load(self):
        csv_path = CHARTER_DIR / "vessel_master.csv"
        if csv_path.exists():
            self.vessel_master_df = pd.read_csv(csv_path)
        else:
            # Fallback to standard 4-vessel table defined in spec
            self.vessel_master_df = pd.DataFrame([
                {"vessel_type": "Handysize", "typical_dwt": 35000, "min_cargo_mt": 15000, "max_cargo_mt": 35000, "typical_draft_m": 10.0, "speed_knots": 13.0, "fuel_consumption_tpd": 20},
                {"vessel_type": "Supramax", "typical_dwt": 58000, "min_cargo_mt": 35000, "max_cargo_mt": 60000, "typical_draft_m": 12.5, "speed_knots": 13.0, "fuel_consumption_tpd": 27},
                {"vessel_type": "Panamax", "typical_dwt": 75000, "min_cargo_mt": 60000, "max_cargo_mt": 82000, "typical_draft_m": 13.5, "speed_knots": 13.5, "fuel_consumption_tpd": 32},
                {"vessel_type": "Capesize", "typical_dwt": 175000, "min_cargo_mt": 120000, "max_cargo_mt": 200000, "typical_draft_m": 17.5, "speed_knots": 14.0, "fuel_consumption_tpd": 48},
            ])
        self.is_loaded = True
        print(f"[CharterService] Vessel master loaded ({len(self.vessel_master_df)} vessel classes).")

    def _determine_weather_risk(self, wave_height_m: float):
        for bracket in WEATHER_RISK_THRESHOLDS:
            if wave_height_m < bracket["max_wave_height_m"]:
                return bracket["risk"], bracket["delay_days"]
        return "SEVERE", 3.0

    def optimize(self, req: CharterOptimizeRequest) -> CharterOptimizeResponse:
        if not self.is_loaded:
            self.load()

        df = self.vessel_master_df.copy()
        cargo_qty = float(req.cargo_quantity_mt)
        distance = float(req.route_distance_nm)
        draft_limit = float(req.port_draft_limit_m)
        port_days = float(req.port_days_per_voyage if req.port_days_per_voyage is not None else DEFAULT_PORT_DAYS_PER_VOYAGE)
        congestion = str(req.congestion_level or "MEDIUM").upper()

        # -------------------------------------------------------------
        # 1. Wire Bunker Price (from Bunker Baseline or explicit input)
        # -------------------------------------------------------------
        if req.bunker_price_usd_mt is not None:
            bunker_price = float(req.bunker_price_usd_mt)
        else:
            bunker_res = bunker_service.predict(BunkerForecastRequest(fuel_type="VLSFO", current_price=585.50))
            bunker_price = bunker_res.forecast_7d_usd_per_mt

        # -------------------------------------------------------------
        # 2. Wire Wave Height (from Weather Model or explicit input)
        # -------------------------------------------------------------
        if req.wave_height_m is not None:
            wave_h = float(req.wave_height_m)
        else:
            try:
                w_res = weather_service.predict(WaveHeightRequest(loc=req.destination_port or "Paradip Port"))
                wave_h = w_res.predicted_wave_height_m
            except Exception:
                wave_h = 2.0  # safe default

        weather_risk, weather_delay_per_voyage = self._determine_weather_risk(wave_h)

        # -------------------------------------------------------------
        # 3. Wire Freight Rates (from Freight Model or explicit input)
        # -------------------------------------------------------------
        freight_rates = req.freight_rates or {}
        for v_type in df["vessel_type"]:
            if v_type not in freight_rates:
                try:
                    f_res = freight_service.predict(FreightPredictRequest(
                        origin_port=req.origin_port or "Newcastle",
                        destination_port=req.destination_port or "Paradip",
                        cargo_type=req.cargo_type or "Thermal coal",
                        cargo_quantity_mt=cargo_qty,
                        vessel_type=v_type,
                        trade_direction="IMPORT_TO_INDIA"
                    ))
                    freight_rates[v_type] = f_res.predicted_freight_rate_usd_per_mt
                except Exception as e:
                    print(f"[CharterService] Freight rate predict failed for {v_type}: {e}")
                    freight_rates[v_type] = np.nan

        # -------------------------------------------------------------
        # 4. Operations Research Optimization Calculation
        # -------------------------------------------------------------
        df["freight_rate_usd_mt"] = df["vessel_type"].map(freight_rates)
        df["draft_margin_m"] = draft_limit - df["typical_draft_m"]
        df["draft_feasible"] = df["draft_margin_m"] >= 0

        df["effective_intake_mt"] = np.minimum(cargo_qty, df["max_cargo_mt"])
        df["cargo_suitable"] = df["effective_intake_mt"] >= df["min_cargo_mt"]

        df["voyages_required"] = np.ceil(cargo_qty / df["max_cargo_mt"]).astype(int)

        df["feasible"] = (
            df["draft_feasible"]
            & df["cargo_suitable"]
            & df["freight_rate_usd_mt"].notna()
        )

        df["sailing_days_per_voyage"] = (distance * ROUND_TRIP_FACTOR) / df["speed_knots"] / 24.0
        df["operating_days_per_voyage"] = df["sailing_days_per_voyage"] + port_days
        df["total_operating_days"] = df["operating_days_per_voyage"] * df["voyages_required"]

        df["estimated_bunker_mt"] = df["fuel_consumption_tpd"] * df["total_operating_days"]
        df["estimated_bunker_cost_usd"] = df["estimated_bunker_mt"] * bunker_price

        df["freight_cost_usd"] = df["freight_rate_usd_mt"] * cargo_qty

        congestion_delay = CONGESTION_DELAY_DAYS_MAP.get(congestion, 1.5)
        df["congestion_delay_days"] = congestion_delay * df["voyages_required"]
        df["weather_delay_days"] = weather_delay_per_voyage * df["voyages_required"]
        df["extra_delay_days"] = df["congestion_delay_days"] + df["weather_delay_days"]

        df["delay_bunker_mt"] = df["extra_delay_days"] * df["fuel_consumption_tpd"] * DELAY_BUNKER_CONSUMPTION_FACTOR
        df["delay_cost_usd"] = df["delay_bunker_mt"] * bunker_price

        df["multi_voyage_penalty_usd"] = np.where(
            df["voyages_required"] > 1,
            (df["voyages_required"] - 1) * MULTI_VOYAGE_PENALTY_USD,
            0.0
        )

        df["final_decision_cost_usd"] = (
            df["freight_cost_usd"]
            + df["delay_cost_usd"]
            + df["multi_voyage_penalty_usd"]
        )
        df["final_cost_per_mt"] = df["final_decision_cost_usd"] / cargo_qty

        def get_status(row):
            if not row["draft_feasible"]:
                return "DRAFT_LIMIT"
            if not row["cargo_suitable"]:
                return "CARGO_UNSUITABLE"
            if pd.isna(row["freight_rate_usd_mt"]):
                return "FREIGHT_RATE_MISSING"
            return "FEASIBLE"

        df["status"] = df.apply(get_status, axis=1)

        ranking = df[df["feasible"]].sort_values(["final_decision_cost_usd", "voyages_required"]).reset_index(drop=True)

        candidates: List[CharterCandidate] = []
        for _, row in df.iterrows():
            c = CharterCandidate(
                vessel_type=str(row["vessel_type"]),
                feasible=bool(row["feasible"]),
                status=str(row["status"]),
                voyages_required=int(row["voyages_required"]),
                draft_margin_m=round(float(row["draft_margin_m"]), 2),
                freight_rate_usd_mt=round(float(row["freight_rate_usd_mt"]), 2) if not pd.isna(row["freight_rate_usd_mt"]) else None,
                estimated_bunker_cost_usd=round(float(row["estimated_bunker_cost_usd"]), 2) if row["feasible"] else None,
                delay_cost_usd=round(float(row["delay_cost_usd"]), 2) if row["feasible"] else None,
                final_decision_cost_usd=round(float(row["final_decision_cost_usd"]), 2) if row["feasible"] else None,
                final_cost_per_mt=round(float(row["final_cost_per_mt"]), 2) if row["feasible"] else None,
            )
            candidates.append(c)

        recommendation = None
        if len(ranking) > 0:
            best = ranking.iloc[0]
            recommendation = CharterRecommendation(
                vessel_type=str(best["vessel_type"]),
                voyages_required=int(best["voyages_required"]),
                freight_rate_usd_mt=round(float(best["freight_rate_usd_mt"]), 2),
                final_decision_cost_usd=round(float(best["final_decision_cost_usd"]), 2),
                final_cost_per_mt=round(float(best["final_cost_per_mt"]), 2),
                draft_margin_m=round(float(best["draft_margin_m"]), 2),
            )

        return CharterOptimizeResponse(
            status="SUCCESS" if recommendation else "NO_FEASIBLE_VESSEL",
            charter_mode="VOYAGE_CHARTER",
            input={
                "cargo_quantity_mt": cargo_qty,
                "route_distance_nm": distance,
                "port_draft_limit_m": draft_limit,
                "bunker_price_usd_mt": bunker_price,
            },
            market_conditions={
                "congestion_level": congestion,
                "wave_height_m": round(wave_h, 2),
                "weather_risk": weather_risk,
            },
            recommendation=recommendation,
            candidates=candidates,
            operational_assumptions={
                "multi_voyage_penalty_usd": MULTI_VOYAGE_PENALTY_USD,
                "delay_bunker_factor": DELAY_BUNKER_CONSUMPTION_FACTOR,
                "congestion_delay_days": congestion_delay,
                "weather_delay_days": weather_delay_per_voyage,
            }
        )

charter_service = CharterService()
