"""
Model Registry for NAUGATI Prediction Service.
Loads and manages artifacts for all five core ML systems:
  1. freight_rate (Multi-horizon forecasting: 1M, 3M, 6M)
  2. market_direction (7-Day direction classification: UP, DOWN, STABLE)
  3. port_congestion (Congestion level classification & waiting hours regression)
  4. voyage_eta (Voyage duration & ETA regression)
  5. weather_risk (Marine weather risk assessment engine & metadata)
"""
import os
import joblib
from pathlib import Path
from typing import Optional, Any, Dict, List

# Primary search path: models/v1, fallback to models/dev or env override
ENV_DIR = os.getenv("MODEL_DIR")
CANDIDATE_DIRS = [
    Path(ENV_DIR) if ENV_DIR else None,
    Path("models/v1"),
    Path(__file__).resolve().parent.parent / "models" / "v1",
    Path("models/dev"),
    Path(__file__).resolve().parent.parent / "models" / "dev",
]

MODEL_FILES = {
    "freight_rate": "freight_rate.joblib",
    "market_direction": "market_direction.joblib",
    "port_congestion": "port_congestion.joblib",
    "voyage_eta": "voyage_eta.joblib",
    "weather_risk": "weather_risk.joblib",
    "route_alternatives": "route_alternatives.joblib",
    "alternative_employment": "alternative_employment.joblib",
}


class ModelRegistry:
    def __init__(self):
        self._artifacts: Dict[str, Any] = {}
        self._versions: Dict[str, str] = {}
        self._resolved_dir: Optional[Path] = None

    def _find_model_dir(self) -> Path:
        for p in CANDIDATE_DIRS:
            if p and p.exists() and (p / "freight_rate.joblib").exists():
                return p
        for p in CANDIDATE_DIRS:
            if p and p.exists():
                return p
        return Path("models/v1")

    def load_all(self):
        self._resolved_dir = self._find_model_dir()
        print(f"[ModelRegistry] Loading models from: {self._resolved_dir}")

        for name, filename in MODEL_FILES.items():
            path = self._resolved_dir / filename
            if path.exists():
                try:
                    artifact = joblib.load(path)
                    self._artifacts[name] = artifact
                    version = "v1"
                    if isinstance(artifact, dict):
                        version = artifact.get("version", "v1")
                    elif hasattr(artifact, "version"):
                        version = getattr(artifact, "version")
                    self._versions[name] = version
                    print(f"  [OK] Loaded {name} ({version}) from {filename}")
                except Exception as e:
                    print(f"  [ERR] Failed to load {name} from {filename}: {e}")
                    self._artifacts[name] = None
                    self._versions[name] = "error_loading"
            else:
                self._artifacts[name] = None
                self._versions[name] = "unset (no artifact found)"

    def get(self, name: str) -> Optional[Any]:
        return self._artifacts.get(name)

    def version(self, name: str) -> str:
        return self._versions.get(name, "unknown")

    def loaded_model_names(self) -> List[str]:
        return [n for n, m in self._artifacts.items() if m is not None]

    def get_metrics(self, name: str) -> Dict[str, Any]:
        art = self._artifacts.get(name)
        if isinstance(art, dict) and "metrics" in art:
            return art["metrics"]
        return {}


registry = ModelRegistry()
