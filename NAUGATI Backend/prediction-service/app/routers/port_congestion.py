from datetime import datetime
from fastapi import APIRouter
from app.schemas.port_congestion import PortCongestionRequest, PortCongestionResponse
from app.model_registry import registry
from app.training.shared_features import extract_port_congestion_features, normalize_port_name

router = APIRouter()


@router.post("/port-congestion", response_model=PortCongestionResponse)
def predict_port_congestion(req: PortCongestionRequest):
    artifact = registry.get("port_congestion")
    model_version = registry.version("port_congestion")
    port_name = normalize_port_name(req.port_name)

    # Historical defaults per port
    port_defaults = {
        "Dhamra": {"waiting_vessels": 4, "tat_hrs": 36.0, "code_idx": 0},
        "Paradip": {"waiting_vessels": 7, "tat_hrs": 48.0, "code_idx": 1},
        "Visakhapatnam": {"waiting_vessels": 6, "tat_hrs": 42.0, "code_idx": 2},
        "Gangavaram": {"waiting_vessels": 3, "tat_hrs": 30.0, "code_idx": 3},
        "Chennai": {"waiting_vessels": 5, "tat_hrs": 38.0, "code_idx": 4},
        "Haldia": {"waiting_vessels": 8, "tat_hrs": 54.0, "code_idx": 5},
        "Singapore": {"waiting_vessels": 12, "tat_hrs": 28.0, "code_idx": 6},
        "Rotterdam": {"waiting_vessels": 9, "tat_hrs": 32.0, "code_idx": 7},
    }
    p_meta = port_defaults.get(port_name, {"waiting_vessels": 5, "tat_hrs": 36.0, "code_idx": 0})

    vessels_waiting = req.vessels_waiting if req.vessels_waiting is not None else p_meta["waiting_vessels"]
    tat_hrs = req.historic_tat_hours if req.historic_tat_hours is not None else p_meta["tat_hrs"]
    obs_date = req.observation_date or datetime.utcnow().strftime("%Y-%m-%d")

    port_encoded_val = p_meta["code_idx"]
    if artifact and isinstance(artifact, dict) and "port_mapping" in artifact:
        port_encoded_val = artifact["port_mapping"].get(port_name, p_meta["code_idx"])

    feat_df = extract_port_congestion_features(
        port_name=port_name,
        vessels_waiting=vessels_waiting,
        historic_tat_hours=tat_hrs,
        date_str=obs_date,
        port_encoded_val=port_encoded_val,
    )

    congestion_level = "Medium"
    waiting_hours = 24.0
    confidence = 0.85

    if artifact and isinstance(artifact, dict):
        classifier = artifact.get("classifier")
        regressor = artifact.get("regressor")
        feature_cols = artifact.get("feature_cols", list(feat_df.columns))

        if classifier is not None:
            congestion_level = str(classifier.predict(feat_df[feature_cols])[0])
        if regressor is not None:
            waiting_hours = float(regressor.predict(feat_df[feature_cols])[0])
    else:
        # Calibrated fallback
        if vessels_waiting <= 3:
            congestion_level = "Low"
            waiting_hours = 12.5
        elif vessels_waiting <= 6:
            congestion_level = "Medium"
            waiting_hours = 26.0
        elif vessels_waiting <= 10:
            congestion_level = "High"
            waiting_hours = 48.0
        else:
            congestion_level = "Severe"
            waiting_hours = 72.0

    waiting_days = round(waiting_hours / 24.0, 2)
    score_map = {"Low": 25.0, "Medium": 50.0, "High": 75.0, "Severe": 92.0}
    congestion_score = score_map.get(congestion_level, 45.0)

    if congestion_level in ["High", "Severe"]:
        delay_risk = f"High congestion at {port_name}: {int(vessels_waiting)} vessels in queue. Anticipate {waiting_days} days anchorage delay."
    elif congestion_level == "Medium":
        delay_risk = f"Moderate queue at {port_name}: standard turnaround expected within {waiting_days} days."
    else:
        delay_risk = f"Smooth operations at {port_name}: berths open, turnaround under 24 hours."

    return PortCongestionResponse(
        port_name=port_name,
        congestion_level=congestion_level,
        average_waiting_hours=round(waiting_hours, 1),
        average_waiting_days=waiting_days,
        vessels_in_queue=int(vessels_waiting),
        congestion_score=congestion_score,
        berth_turnaround_hours=tat_hrs,
        delay_risk=delay_risk,
        historical_benchmark_hours=tat_hrs,
        confidence=confidence,
        model_version=model_version,
        timestamp=datetime.utcnow().isoformat() + "Z",
    )
