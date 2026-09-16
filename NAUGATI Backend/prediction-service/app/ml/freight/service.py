import math
import os
import time
from datetime import datetime, date
from pathlib import Path
from typing import Dict, Any, Optional
import httpx
import joblib
import pandas as pd
from fastapi import HTTPException

from app.ml.config import FREIGHT_DIR
from app.ml.freight.schemas import FreightPredictRequest, FreightPredictResponse

class FreightService:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.feature_names = []
        self.is_loaded = False
        self._macro_cache: Dict[str, Any] = {}
        self._macro_cache_time: float = 0
        self._cache_ttl_sec: float = 3600.0  # 1 hour in-memory TTL

    def load(self):
        model_path = FREIGHT_DIR / "naugati_freight_rf_v1.pkl"
        preprocessor_path = FREIGHT_DIR / "naugati_preprocessor_v1.pkl"
        features_path = FREIGHT_DIR / "naugati_features_v1.pkl"

        if not (model_path.exists() and preprocessor_path.exists() and features_path.exists()):
            raise RuntimeError(f"Freight model artifacts missing in {FREIGHT_DIR}")

        print("[FreightService] Loading Random Forest freight rate model & preprocessor...")
        self.model = joblib.load(model_path)
        self.preprocessor = joblib.load(preprocessor_path)
        self.feature_names = joblib.load(features_path)
        self.is_loaded = True
        print(f"[FreightService] Freight model loaded successfully ({len(self.feature_names)} features).")

    def _match_category(self, input_val: str, category_list: list) -> str:
        clean = input_val.strip().lower()
        for c in category_list:
            if c.lower() == clean:
                return c
        for c in category_list:
            if clean in c.lower() or c.lower() in clean:
                return c
        # If no match, return cleaned title (OneHotEncoder uses handle_unknown='ignore')
        return input_val.strip()

    def _fetch_live_macro_features(self) -> Dict[str, float]:
        """Fetch fresh lagged indicators from FRED and Alpha Vantage."""
        now = time.time()
        if self._macro_cache and (now - self._macro_cache_time < self._cache_ttl_sec):
            return self._macro_cache

        fred_key = os.getenv("FRED_API_KEY", "86e39f2ebd8e31e94c909d867ee6d0b7")
        alpha_key = os.getenv("ALPHA_VANTAGE_API_KEY", "WWPE9QK1QL1ZSBAV")

        brent_lag_1m = 91.08
        brent_lag_3m = 85.40
        inr_per_usd = 95.55
        india_iip = 125.6
        coal_aus = 138.40
        iron_ore = 112.50
        igrea_lag_1m = 110.5
        igrea_lag_3m = 108.2
        igrea_lag_6m = 105.0

        try:
            with httpx.Client(timeout=7.0) as client:
                # 1. Fetch Brent from FRED or Alpha Vantage
                if fred_key:
                    brent_res = client.get(
                        "https://api.stlouisfed.org/fred/series/observations",
                        params={
                            "series_id": "DCOILBRENTEU",
                            "api_key": fred_key,
                            "file_type": "json",
                            "sort_order": "desc",
                            "limit": 10
                        }
                    )
                    if brent_res.status_code == 200:
                        obs = [float(o["value"]) for o in brent_res.json().get("observations", []) if o.get("value") not in (None, ".")]
                        if len(obs) >= 1:
                            brent_lag_1m = obs[0]
                        if len(obs) >= 3:
                            brent_lag_3m = obs[2]

                    # 2. Fetch INR/USD from FRED (DEXINUS)
                    inr_res = client.get(
                        "https://api.stlouisfed.org/fred/series/observations",
                        params={
                            "series_id": "DEXINUS",
                            "api_key": fred_key,
                            "file_type": "json",
                            "sort_order": "desc",
                            "limit": 5
                        }
                    )
                    if inr_res.status_code == 200:
                        inr_obs = [float(o["value"]) for o in inr_res.json().get("observations", []) if o.get("value") not in (None, ".")]
                        if len(inr_obs) >= 1:
                            inr_per_usd = inr_obs[0]

                    # 3. Fetch India IIP from FRED (INDPROINDMISMEI)
                    iip_res = client.get(
                        "https://api.stlouisfed.org/fred/series/observations",
                        params={
                            "series_id": "INDPROINDMISMEI",
                            "api_key": fred_key,
                            "file_type": "json",
                            "sort_order": "desc",
                            "limit": 5
                        }
                    )
                    if iip_res.status_code == 200:
                        iip_obs = [float(o["value"]) for o in iip_res.json().get("observations", []) if o.get("value") not in (None, ".")]
                        if len(iip_obs) >= 1:
                            india_iip = iip_obs[0]
        except Exception as e:
            print(f"[FreightService] Warning: Could not refresh macro feeds: {e}. Utilizing baseline.")

        self._macro_cache = {
            "igrea_lag_1m": igrea_lag_1m,
            "igrea_lag_3m": igrea_lag_3m,
            "igrea_lag_6m": igrea_lag_6m,
            "brent_usd_per_bbl_lag_1m": brent_lag_1m,
            "brent_usd_per_bbl_lag_3m": brent_lag_3m,
            "inr_per_usd_lag_1m": inr_per_usd,
            "coal_australia_usd_per_mt_lag_1m": coal_aus,
            "iron_ore_usd_per_mt_lag_1m": iron_ore,
            "india_industrial_production_index_lag_1m": india_iip,
        }
        self._macro_cache_time = now
        return self._macro_cache

    def predict(self, req: FreightPredictRequest) -> FreightPredictResponse:
        if not self.is_loaded:
            raise HTTPException(status_code=503, detail="Freight model is not loaded.")

        # Match categorical variables
        cat_transformers = self.preprocessor.named_transformers_['cat'].named_steps['encoder']
        origin_cats = cat_transformers.categories_[0]
        dest_cats = cat_transformers.categories_[1]
        cargo_cats = cat_transformers.categories_[2]
        vessel_cats = cat_transformers.categories_[3]
        direction_cats = cat_transformers.categories_[4]

        origin_matched = self._match_category(req.origin_port, origin_cats)
        dest_matched = self._match_category(req.destination_port, dest_cats)
        cargo_matched = self._match_category(req.cargo_type, cargo_cats)
        vessel_matched = self._match_category(req.vessel_type, vessel_cats)
        direction_matched = self._match_category(req.trade_direction, direction_cats)

        # Calendar features
        now = datetime.utcnow()
        yr = req.year if req.year is not None else now.year
        mo = req.month if req.month is not None else now.month
        qtr = req.quarter if req.quarter is not None else ((mo - 1) // 3 + 1)
        m_sin = req.month_sin if req.month_sin is not None else math.sin(2 * math.pi * mo / 12)
        m_cos = req.month_cos if req.month_cos is not None else math.cos(2 * math.pi * mo / 12)

        # Macro lags (fetch real values if not provided by caller)
        live_macro = self._fetch_live_macro_features()

        igrea_1m = req.igrea_lag_1m if req.igrea_lag_1m is not None else live_macro["igrea_lag_1m"]
        igrea_3m = req.igrea_lag_3m if req.igrea_lag_3m is not None else live_macro["igrea_lag_3m"]
        igrea_6m = req.igrea_lag_6m if req.igrea_lag_6m is not None else live_macro["igrea_lag_6m"]
        brent_1m = req.brent_usd_per_bbl_lag_1m if req.brent_usd_per_bbl_lag_1m is not None else live_macro["brent_usd_per_bbl_lag_1m"]
        brent_3m = req.brent_usd_per_bbl_lag_3m if req.brent_usd_per_bbl_lag_3m is not None else live_macro["brent_usd_per_bbl_lag_3m"]
        inr_1m = req.inr_per_usd_lag_1m if req.inr_per_usd_lag_1m is not None else live_macro["inr_per_usd_lag_1m"]
        coal_1m = req.coal_australia_usd_per_mt_lag_1m if req.coal_australia_usd_per_mt_lag_1m is not None else live_macro["coal_australia_usd_per_mt_lag_1m"]
        iron_1m = req.iron_ore_usd_per_mt_lag_1m if req.iron_ore_usd_per_mt_lag_1m is not None else live_macro["iron_ore_usd_per_mt_lag_1m"]
        iip_1m = req.india_industrial_production_index_lag_1m if req.india_industrial_production_index_lag_1m is not None else live_macro["india_industrial_production_index_lag_1m"]

        # Assemble exact 20 features in training order
        feature_dict = {
            "origin_port": origin_matched,
            "destination_port": dest_matched,
            "cargo_type": cargo_matched,
            "cargo_quantity_mt": float(req.cargo_quantity_mt),
            "vessel_type": vessel_matched,
            "trade_direction": direction_matched,
            "year": int(yr),
            "month": int(mo),
            "quarter": int(qtr),
            "month_sin": float(m_sin),
            "month_cos": float(m_cos),
            "igrea_lag_1m": float(igrea_1m),
            "igrea_lag_3m": float(igrea_3m),
            "igrea_lag_6m": float(igrea_6m),
            "brent_usd_per_bbl_lag_1m": float(brent_1m),
            "brent_usd_per_bbl_lag_3m": float(brent_3m),
            "inr_per_usd_lag_1m": float(inr_1m),
            "coal_australia_usd_per_mt_lag_1m": float(coal_1m),
            "iron_ore_usd_per_mt_lag_1m": float(iron_1m),
            "india_industrial_production_index_lag_1m": float(iip_1m),
        }

        # Build DataFrame with the exact feature names
        df = pd.DataFrame([feature_dict])[self.feature_names]

        # Transform and predict
        try:
            X_prep = self.preprocessor.transform(df)
            pred = self.model.predict(X_prep)
            predicted_rate = round(float(pred[0]), 2)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Freight model inference error: {str(e)}")

        return FreightPredictResponse(
            origin_port=origin_matched,
            destination_port=dest_matched,
            cargo_type=cargo_matched,
            cargo_quantity_mt=float(req.cargo_quantity_mt),
            vessel_type=vessel_matched,
            trade_direction=direction_matched,
            predicted_freight_rate_usd_per_mt=predicted_rate,
            unit="USD/MT",
            status="MVP_READY",
            model_version="naugati_freight_rf_v1",
            feature_vector=feature_dict
        )

freight_service = FreightService()
