"""
Shared feature engineering pipeline and schema validation.
Ensures Train-Time Preprocessing == Inference-Time Preprocessing.
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple

# Constants & Categorical Dictionaries
VESSEL_CLASSES = ["Capesize", "Kamsarmax", "Panamax", "Supramax", "Handysize"]
VESSEL_DWT_MAP = {
    "Capesize": 180000.0,
    "Kamsarmax": 82000.0,
    "Panamax": 75000.0,
    "Supramax": 58000.0,
    "Handysize": 35000.0,
}
VESSEL_DEFAULT_SPEED = {
    "Capesize": 12.5,
    "Kamsarmax": 13.0,
    "Panamax": 13.0,
    "Supramax": 13.5,
    "Handysize": 13.5,
}
VESSEL_WAVE_LIMIT_M = {
    "Capesize": 5.5,
    "Kamsarmax": 4.5,
    "Panamax": 4.0,
    "Supramax": 3.5,
    "Handysize": 3.0,
}

COMMODITY_CATEGORIES = {
    "Iron ore fines": "Metals",
    "Aluminum": "Metals",
    "Thermal coal, Australian": "Energy",
    "Thermal coal, South African": "Energy",
    "Wheat, US hard red winter": "Agriculture",
    "Wheat, US soft red winter": "Agriculture",
    "Maize": "Agriculture",
    "Soybeans": "Agriculture",
    "Soybean meal": "Agriculture",
    "Rice, Thai 5% broken": "Agriculture",
    "DAP fertilizer": "Fertilizer",
    "TSP fertilizer": "Fertilizer",
    "Urea fertilizer": "Fertilizer",
    "Phosphate rock": "Fertilizer",
    "Potassium chloride": "Fertilizer",
}

PORT_NAME_MAP = {
    "dhamra": "Dhamra",
    "paradip": "Paradip",
    "visakhapatnam": "Visakhapatnam",
    "gangavaram": "Gangavaram",
    "chennai": "Chennai",
    "ennore": "Ennore",
    "haldia": "Haldia",
    "singapore": "Singapore",
    "rotterdam": "Rotterdam",
    "shanghai": "Shanghai",
    "los angeles": "Los Angeles",
    "long beach": "Long Beach",
    "antwerp": "Antwerp",
    "busan": "Busan",
}


def normalize_port_name(port_str: str) -> str:
    if not port_str:
        return "Dhamra"
    clean = port_str.strip().lower()
    for k, v in PORT_NAME_MAP.items():
        if k in clean:
            return v
    return port_str.title()


def extract_freight_features(
    origin: str,
    destination: str,
    vessel_class: str,
    cargo_quantity: float,
    loading_date: str,
    distance_nm: float,
    commodity_price_usd: float = 115.0,
    commodity_return_30d: float = 0.02,
    brent_crude_usd: float = 78.5,
    usd_index: float = 104.2,
) -> pd.DataFrame:
    """Extract and vectorize features for freight rate forecasting."""
    vessel_norm = "Panamax"
    for vc in VESSEL_CLASSES:
        if vc.lower() in (vessel_class or "").lower():
            vessel_norm = vc
            break

    try:
        dt = pd.to_datetime(loading_date)
        month = dt.month
        quarter = dt.quarter
    except Exception:
        month = 9
        quarter = 3

    dwt = VESSEL_DWT_MAP.get(vessel_norm, 75000.0)

    # One-hot / binary flags for vessel class
    vessel_cape = 1.0 if vessel_norm == "Capesize" else 0.0
    vessel_pan = 1.0 if vessel_norm in ["Panamax", "Kamsarmax"] else 0.0
    vessel_supra = 1.0 if vessel_norm == "Supramax" else 0.0
    vessel_handy = 1.0 if vessel_norm == "Handysize" else 0.0

    features = {
        "distance_nm": float(distance_nm if distance_nm > 0 else 4200.0),
        "vessel_dwt": float(dwt),
        "cargo_quantity": float(cargo_quantity if cargo_quantity > 0 else 75000.0),
        "commodity_price_usd": float(commodity_price_usd),
        "commodity_return_30d": float(commodity_return_30d),
        "brent_crude_usd": float(brent_crude_usd),
        "usd_index": float(usd_index),
        "month": int(month),
        "quarter": int(quarter),
        "vessel_is_cape": vessel_cape,
        "vessel_is_panamax": vessel_pan,
        "vessel_is_supra": vessel_supra,
        "vessel_is_handy": vessel_handy,
    }
    return pd.DataFrame([features])


def extract_market_direction_features(
    commodity_name: str,
    price_usd: float,
    return_7d: float,
    return_14d: float,
    return_30d: float,
    volatility_30d: float,
    sma_7_to_30: float,
) -> pd.DataFrame:
    """Extract features for 7-day market direction classification."""
    category = COMMODITY_CATEGORIES.get(commodity_name, "Metals")
    cat_energy = 1.0 if category == "Energy" else 0.0
    cat_metals = 1.0 if category == "Metals" else 0.0
    cat_agri = 1.0 if category == "Agriculture" else 0.0
    cat_fert = 1.0 if category == "Fertilizer" else 0.0

    features = {
        "price_usd": float(price_usd),
        "return_7d": float(return_7d),
        "return_14d": float(return_14d),
        "return_30d": float(return_30d),
        "volatility_30d": float(volatility_30d),
        "sma_ratio_7_30": float(sma_7_to_30),
        "cat_energy": cat_energy,
        "cat_metals": cat_metals,
        "cat_agri": cat_agri,
        "cat_fert": cat_fert,
    }
    return pd.DataFrame([features])


def extract_port_congestion_features(
    port_name: str,
    vessels_waiting: float,
    historic_tat_hours: float,
    date_str: str,
    port_encoded_val: int = 0,
) -> pd.DataFrame:
    """Extract features for port congestion prediction."""
    try:
        dt = pd.to_datetime(date_str)
        month = dt.month
        day = dt.day
        dayofweek = dt.dayofweek
        quarter = dt.quarter
        dayofyear = dt.dayofyear
        is_weekend = 1.0 if dayofweek in [5, 6] else 0.0
    except Exception:
        month, day, dayofweek, quarter, dayofyear, is_weekend = 9, 14, 0, 3, 257, 0.0

    features = {
        "vessels_waiting": float(vessels_waiting),
        "historic_tat_hours": float(historic_tat_hours if historic_tat_hours > 0 else 36.0),
        "month": int(month),
        "day": int(day),
        "dayofweek": int(dayofweek),
        "quarter": int(quarter),
        "dayofyear": int(dayofyear),
        "is_weekend": float(is_weekend),
        "port_encoded": int(port_encoded_val),
    }
    return pd.DataFrame([features])


def extract_voyage_eta_features(
    distance_remaining_nm: float,
    vessel_speed_knots: float,
    vessel_delay_hist_hours: float,
    destination_waiting_hours: float,
    vessel_class: str = "Panamax",
) -> pd.DataFrame:
    """Extract features for voyage ETA and duration prediction."""
    speed = vessel_speed_knots if vessel_speed_knots > 4.0 else VESSEL_DEFAULT_SPEED.get(vessel_class, 13.0)
    features = {
        "distance_remaining_nm": float(distance_remaining_nm),
        "vessel_speed_knots": float(speed),
        "vessel_delay_hist_hours": float(vessel_delay_hist_hours),
        "destination_waiting_hours": float(destination_waiting_hours),
        "nominal_transit_hours": float(distance_remaining_nm / speed),
    }
    return pd.DataFrame([features])
