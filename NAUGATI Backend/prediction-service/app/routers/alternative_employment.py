from fastapi import APIRouter
from app.schemas.alternative_employment import AlternativeEmploymentRequest, AlternativeEmploymentSuggestion
from app.model_registry import registry

router = APIRouter()

# DESIGN.md §4/§7 — POST /internal/recommend/alternative-employment
# Called by core-api only after a deadheading analysis shows the vessel
# would otherwise deadhead (client-triggered follow-up, not automatic).


@router.post("/alternative-employment", response_model=list[AlternativeEmploymentSuggestion])
def recommend_alternative_employment(req: AlternativeEmploymentRequest):
    model = registry.get("alternative_employment")
    version = registry.version("alternative_employment")

    if model is None:
        return [
            AlternativeEmploymentSuggestion(
                suggestion_type="nearby_cargo", cargo_ref="mock-cargo-1", score=0.81, model_version=version
            ),
            AlternativeEmploymentSuggestion(
                suggestion_type="backhaul", cargo_ref="mock-cargo-2", score=0.67, model_version=version
            ),
            AlternativeEmploymentSuggestion(
                suggestion_type="alternative_port", port_ref="mock-port-1", score=0.55, model_version=version
            ),
        ]

    features = req.model_dump()
    return model.predict(features)
