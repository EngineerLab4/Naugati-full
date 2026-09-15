Put small pre-trained/mock `.joblib` artifacts here for local dev, per
ARCHITECTURE.md §10:

  freight_rate.joblib
  route_alternatives.joblib
  alternative_employment.joblib

Until real artifacts exist, prediction-service's routers fall back to
clearly-labeled mock responses (see app/routers/*.py) so the rest of the
stack can be built and tested end-to-end without real training data.
