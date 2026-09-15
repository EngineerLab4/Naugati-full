from datetime import datetime, timedelta, timezone
from fastapi import APIRouter
from app.schemas.eta import EtaRequest, EtaResponse, EtaFactors

router = APIRouter()

# DESIGN.md §8: "ETA math ... can be computed from live inputs without a
# trained model." v1 factors (position/speed/distance/route) are
# user-entered per DESIGN.md §7 — not yet sourced from VesselState directly.
# "model_version" is still returned for consistency with the
# every-score-has-a-version rule, even though this isn't ML-trained.


@router.post("/eta", response_model=EtaResponse)
def predict_eta(req: EtaRequest):
    distance_nm = req.distance or 0.0
    speed_knots = req.speed or 12.0  # conservative bulk-carrier default
    hours_remaining = distance_nm / speed_knots if speed_knots else 0.0

    eta = datetime.now(timezone.utc) + timedelta(hours=hours_remaining)

    return EtaResponse(
        eta_timestamp=eta.isoformat(),
        confidence=0.7 if req.position else 0.4,
        delay_probability=0.2,
        expected_delay_hrs=2.5,
        factors=EtaFactors(weather=0.2, port_congestion=0.3, historic_turnaround=0.1),
        model_version="eta-geometry-v1",  # not a trained model, versioned for API consistency
    )
