import json
import os
from pathlib import Path
from typing import Any, Dict

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
FAVORITES_ML_DIR = Path("/Users/sachinkumarchauhan/Desktop/ML ")

def _resolve_ml_dir(folder_name: str) -> Path:
    fav = FAVORITES_ML_DIR / folder_name
    if fav.exists() and fav.is_dir():
        return fav
    return ARTIFACTS_DIR / folder_name

# Artifact subdirectories (resolves directly from Finder Favorites ML folders)
FREIGHT_DIR = _resolve_ml_dir("Naugati_Freight_Model_V1")
WEATHER_DIR = _resolve_ml_dir("Naugati_Weather_Model")
CHARTER_DIR = _resolve_ml_dir("Naugati_Charter_Optimization_Engine")
BUNKER_DIR = _resolve_ml_dir("Naugati_Bunker_MVP")
COMMODITY_DIR = _resolve_ml_dir("Naugati_Commodity_MVP")

# Load metadata configurations once
def _load_json(file_path: Path) -> Dict[str, Any]:
    if file_path.exists():
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

WEATHER_METADATA = _load_json(WEATHER_DIR / "weather_metadata.json")
CHARTER_METADATA = _load_json(CHARTER_DIR / "metadata.json")
BUNKER_METADATA = _load_json(BUNKER_DIR / "bunker_metadata.json")
COMMODITY_METADATA = _load_json(COMMODITY_DIR / "commodity_metadata.json")

# Configurable Charter Optimization assumptions (named constants per specification)
CONGESTION_DELAY_DAYS_MAP = {
    "LOW": 0.5,
    "MEDIUM": 1.5,
    "HIGH": 3.0,
    "SEVERE": 5.0,
}

WEATHER_RISK_THRESHOLDS = [
    {"max_wave_height_m": 1.5, "risk": "LOW", "delay_days": 0.0},
    {"max_wave_height_m": 2.5, "risk": "MEDIUM", "delay_days": 0.5},
    {"max_wave_height_m": 4.0, "risk": "HIGH", "delay_days": 1.5},
    {"max_wave_height_m": float("inf"), "risk": "SEVERE", "delay_days": 3.0},
]

# Commercial & operational parameters
MULTI_VOYAGE_PENALTY_USD = 25000.0  # Per additional voyage required
DELAY_BUNKER_CONSUMPTION_FACTOR = 0.60  # Fuel consumption during idle/waiting as % of sea consumption
DEFAULT_PORT_DAYS_PER_VOYAGE = 2.0
ROUND_TRIP_FACTOR = 2.0  # Nautical voyage distance factor for ballast leg
