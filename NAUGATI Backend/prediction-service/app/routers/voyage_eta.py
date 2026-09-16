from datetime import datetime, timedelta
from fastapi import APIRouter
from app.schemas.voyage_eta import VoyageEtaRequest, VoyageEtaResponse, DelayFactor, Milestone
from app.model_registry import registry
from app.training.shared_features import extract_voyage_eta_features, VESSEL_DEFAULT_SPEED

router = APIRouter()


@router.post("/voyage-eta", response_model=VoyageEtaResponse)
def predict_voyage_eta(req: VoyageEtaRequest):
    artifact = registry.get("voyage_eta")
    model_version = registry.version("voyage_eta")

    dist = req.distance_remaining_nm
    if not dist or dist <= 0:
        dist = 4120.0
        orig_lower = (req.origin or "").lower()
        if "indonesia" in orig_lower: dist = 2250.0
        elif "south africa" in orig_lower: dist = 4680.0
        elif "hedland" in orig_lower or "australia" in orig_lower: dist = 3950.0

    speed = req.vessel_speed_knots if (req.vessel_speed_knots and req.vessel_speed_knots > 4.0) else 13.0
    delay_hist = req.vessel_delay_hist_hours if req.vessel_delay_hist_hours is not None else 3.5
    port_wait = req.destination_waiting_hours if req.destination_waiting_hours is not None else 24.0

    feat_df = extract_voyage_eta_features(
        distance_remaining_nm=dist,
        vessel_speed_knots=speed,
        vessel_delay_hist_hours=delay_hist,
        destination_waiting_hours=port_wait,
        vessel_class=req.vessel_class or "Panamax",
    )

    if not (artifact and isinstance(artifact, dict) and "model" in artifact):
        raise HTTPException(
            status_code=503,
            detail="Voyage ETA model artifact is not loaded. No synthetic predictions generated."
        )

    model = artifact["model"]
    feature_cols = artifact.get("feature_cols", list(feat_df.columns))
    total_duration_hours = float(model.predict(feat_df[feature_cols])[0])

    sea_transit_hours = dist / speed
    transit_days = round(sea_transit_hours / 24.0, 1)
    total_voyage_days = round(total_duration_hours / 24.0, 1)
    delay_prob = min(85, max(12, int(15 + (port_wait / 100.0) * 45 + (delay_hist * 2))))
    expected_delay_days = round((port_wait + delay_hist) / 24.0, 1)

    # Calculate arrival milestones
    base_dt = datetime.utcnow()
    ocean_arrival_dt = base_dt + timedelta(hours=sea_transit_hours)
    berthing_dt = ocean_arrival_dt + timedelta(hours=port_wait)
    completion_dt = berthing_dt + timedelta(hours=36.0)

    milestones = [
        Milestone(name="Ocean Departure", date="Departed", status="completed"),
        Milestone(name="Strait Transit Corridor", date=f"+{transit_days*0.35:.1f} Days", status="scheduled"),
        Milestone(name="Pilot Boarding Station", date=f"+{transit_days:.1f} Days", status="scheduled"),
        Milestone(name="Berthing & Discharge", date=f"+{transit_days + expected_delay_days:.1f} Days", status="scheduled"),
        Milestone(name="Cargo Handover Completed", date=f"+{total_voyage_days:.1f} Days", status="scheduled")
    ]

    delay_factors = [
        DelayFactor(factor="Regional Seasonal Swell", impact="+0.3 days", severity="low"),
        DelayFactor(factor=f"{req.destination} Anchorage Berth Queue", impact=f"+{port_wait/24.0:.1f} days", severity="medium" if port_wait <= 36 else "high"),
    ]

    return VoyageEtaResponse(
        origin=req.origin,
        destination=req.destination,
        estimated_ocean_arrival=ocean_arrival_dt.strftime("%b %d, %H:%M UTC"),
        estimated_berthing=berthing_dt.strftime("%b %d, %H:%M UTC"),
        estimated_completion=completion_dt.strftime("%b %d, %H:%M UTC"),
        transit_days=transit_days,
        total_voyage_days=total_voyage_days,
        delay_probability_percent=delay_prob,
        expected_delay_days=expected_delay_days,
        primary_delay_factors=delay_factors,
        milestones=milestones,
        model_version=model_version,
        timestamp=datetime.utcnow().isoformat() + "Z",
    )
