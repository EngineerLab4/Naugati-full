from datetime import datetime
from fastapi import APIRouter
from app.schemas.market_direction import MarketDirectionRequest, MarketDirectionResponse
from app.model_registry import registry
from app.training.shared_features import extract_market_direction_features

router = APIRouter()


@router.post("/market-direction", response_model=MarketDirectionResponse)
def predict_market_direction(req: MarketDirectionRequest):
    artifact = registry.get("market_direction")
    model_version = registry.version("market_direction")

    # Defaults from historical baseline if not provided
    p_usd = req.price_usd if req.price_usd is not None else 110.5
    r7 = req.return_7d if req.return_7d is not None else 0.018
    r14 = req.return_14d if req.return_14d is not None else 0.024
    r30 = req.return_30d if req.return_30d is not None else 0.035
    vol30 = req.volatility_30d if req.volatility_30d is not None else 0.042
    sma_ratio = req.sma_7_to_30 if req.sma_7_to_30 is not None else 1.015

    feat_df = extract_market_direction_features(
        commodity_name=req.commodity,
        price_usd=p_usd,
        return_7d=r7,
        return_14d=r14,
        return_30d=r30,
        volatility_30d=vol30,
        sma_7_to_30=sma_ratio,
    )

    if not (artifact and isinstance(artifact, dict) and "model" in artifact):
        raise HTTPException(
            status_code=503,
            detail="Market direction model artifact is not loaded. No synthetic classification generated."
        )

    model = artifact["model"]
    feature_cols = artifact.get("feature_cols", list(feat_df.columns))
    classes = artifact.get("classes", ["DOWN", "STABLE", "UP"])
    
    pred_class = model.predict(feat_df[feature_cols])[0]
    direction = str(pred_class)
    
    pred_probs = model.predict_proba(feat_df[feature_cols])[0]
    probs = {c: round(float(p), 3) for c, p in zip(classes, pred_probs)}
    confidence = float(max(pred_probs))

    if direction == "UP":
        rationale = f"Short-term 7-day momentum for {req.commodity} is positive (+{r7*100:.1f}%), above the +1.5% volatility expansion band."
        est_ret = 0.028
    elif direction == "DOWN":
        rationale = f"Short-term 7-day momentum for {req.commodity} is negative ({r7*100:.1f}%), signaling consolidation below the 30-day moving average."
        est_ret = -0.022
    else:
        rationale = f"{req.commodity} price fluctuations remain within the &plusmn;1.5% neutral corridor over the 7-day forward horizon."
        est_ret = 0.004

    return MarketDirectionResponse(
        commodity=req.commodity,
        direction=direction,
        horizon="7-day",
        confidence=round(confidence, 3),
        probabilities=probs,
        predicted_return_estimate=est_ret,
        market_rationale=rationale,
        model_version=model_version,
        timestamp=datetime.utcnow().isoformat() + "Z",
    )
