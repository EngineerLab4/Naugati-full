"""
Offline training pipeline — separate from runtime inference, per
DESIGN.md §8: "Three models require offline training... these live in
prediction-service with a training pipeline separate from runtime inference."

Run manually or via a scheduled job (NOT part of the FastAPI request path):
    python -m app.training.train_freight_rate
    python -m app.training.train_route_alternatives
    python -m app.training.train_alternative_employment

Each script should:
  1. Pull historical features from MongoDB (weather, market,
     trade, congestion, vessel-position history + the dataset tables).
  2. Train with scikit-learn / XGBoost / Prophet (per ARCHITECTURE.md §3).
  3. Save the artifact to models/dev/<name>.joblib locally, or upload to
     S3-compatible object storage in staging/prod (ARCHITECTURE.md §3).
  4. Write a ModelVersion row (version, trained_at, metrics_json) so
     model-registry can report MAPE/calibration (ARCHITECTURE.md §8).

This file intentionally contains no real training logic yet — it's the
scaffold the ML engineer fills in once historical data access is wired up.
"""
EOF_MARKER = None  # placeholder so this file is valid, non-empty Python
