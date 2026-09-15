# NAUGATI — Backend Architecture

**Version 2.0** — revised against the founder's handwritten notes: explicit external provider list (Mapbox, Weather, Global Market/Trade, Commodity Price), a clear split between **live API ingestion** and **periodic dataset loads**, and only three models that actually require offline training. Companion to `PRD.md` and `DESIGN.md`. Defines deployment topology, tech stack, data flow, and infra for a **FastAPI + Node.js only** backend.

---

## 1. Architecture Style

Hybrid: a Node.js-owned **system of record + API gateway layer**, and a Python/FastAPI-owned **compute layer** for prediction, scoring, and optimization. No other language runtimes are introduced anywhere in the stack.

```
                         ┌─────────────────────────┐
                         │        Clients            │
                         │  Web (shipowner / shipper) │
                         └────────────┬──────────────┘
                                      │ HTTPS
                          ┌───────────▼────────────┐
                          │   API Gateway / BFF     │  Node.js (NestJS)
                          │  - authZ/authN (role:    │
                          │    shipowner|shipper)    │
                          └───┬───────────┬─────────┘
                              │           │
              ┌───────────────┘           └───────────────┐
              ▼                                            ▼
   ┌─────────────────────┐                     ┌───────────────────────┐
   │   core-api (Node)     │  internal HTTP     │ recommendation-service │  FastAPI
   │  users/shipments/     │◄───────────────────►│  ETA calc, risk score, │
   │  vessels/ports/       │                     │  deadheading, Shipment │
   │  contracts/alerts     │                     │  orchestration          │
   └──────────┬────────────┘                     └──────────┬────────────┘
              │                                              │ internal HTTP
              │                                              ▼
              │                                   ┌───────────────────────┐
              │                                   │  prediction-service    │  FastAPI
              │                                   │  (3 TRAINED models):    │
              │                                   │  - Freight Rate         │
              │                                   │  - Route Alternatives /│
              │                                   │    Voyage Time          │
              │                                   │  - Alternative          │
              │                                   │    Employment           │
              │                                   └──────────┬────────────┘
              ▼                                              │
   ┌─────────────────────┐                     ┌───────────────────────┐
   │  realtime-gateway     │  Node.js (WS/SSE)  │   model-registry        │  FastAPI module
   │  alerts push, ETA push│                     │  version + metrics      │
   └──────────┬────────────┘                     └───────────────────────┘
              │
              ▼
   ┌─────────────────────┐        ┌────────────────────────────────────┐
   │  ingestion-service    │◄──────┤ LIVE APIs:                           │
   │  (Node) — two lanes:  │       │  Mapbox (routing/map), Weather API,  │
   │                        │       │  Global Market API, Global Trade/    │
   │  (a) live API polling │       │  Geopolitical API, Congestion API,   │
   │  (b) periodic dataset │       │  Vessel Position API (AIS or alt —   │
   │      loads             │       │  provider still being evaluated)    │
   └──────────┬────────────┘       ├────────────────────────────────────┤
              │                    │ DATASETS (periodic/bulk load):       │
              │                    │  Port master data, Historic port     │
              │                    │  turnaround, Distance between ports, │
              ▼                    │  Vessel availability, Commodity price│
   ┌─────────────────────┐        │  (dataset vs API — TBD)              │
   │   Message Queue        │      └────────────────────────────────────┘
   │  (Redis Streams)       │
   │  - data-updated events │
   │  - alert jobs           │
   └──────────┬────────────┘
              │
   ┌──────────▼────────────┐      ┌───────────────────────┐
   │   PostgreSQL (primary)│      │  PostGIS extension       │  for geo queries
   │   + read replicas      │      │  (ports, routes, zones) │
   └─────────────────────┘      └───────────────────────┘
              │
   ┌──────────▼────────────┐
   │   Redis (cache)         │  market snapshot, session cache
   └─────────────────────┘
```

## 2. External Providers (explicit, per founder's notes)

| Need | Source | Status |
|---|---|---|
| Map rendering / route geometry | **Mapbox API** | Confirmed |
| Weather (route zones, ETA, risk, freight factor) | Weather API | Confirmed direction, provider TBD |
| Global market conditions (freight factor) | Global Market API | Confirmed direction, provider TBD |
| Geopolitical / trade risk | Global Trade API | Confirmed direction, provider TBD |
| Port congestion zones | Congestion API | Confirmed direction, provider TBD |
| Vessel current location | Vessel Position API (AIS or alternative) | **Still being evaluated** — do not hard-couple ingestion-service to one AIS vendor's schema |
| Commodity price | API or Dataset | **Open question** — founder noted both as possible |
| Port master data, historic turnaround, distance between ports, vessel availability | Internal/licensed **datasets** | Periodic bulk load, not live polling |

This table should be kept in sync with `PRD.md` §11 (Open Questions) — provider selection directly changes `ingestion-service`'s connector list, not the rest of the architecture.

## 3. Tech Stack

| Layer | Choice |
|---|---|
| Transactional API / gateway | **Node.js** — NestJS (RBAC guards for shipowner/shipper) or Express |
| Real-time | **Node.js** — `ws` or Socket.IO; SSE fallback |
| Prediction & optimization | **FastAPI** (Python 3.11+), Pydantic v2 |
| ML frameworks | scikit-learn / XGBoost / Prophet for the three trained models (freight rate, route alternatives/voyage time, alternative employment); plain Python + PostGIS for deadheading/ETA geometry math (not a trained model, per notes) |
| Primary datastore | PostgreSQL + PostGIS |
| Cache | Redis |
| Queue / event bus | Redis Streams |
| Object storage | S3-compatible (trained model artifacts; extended-scope report exports) |
| Auth | JWT (access + refresh) from `core-api`; internal service-to-service via separate signed service tokens |
| Containerization | Docker; one image per service |
| Orchestration | Docker Compose (dev); Kubernetes/ECS (staging/prod) |
| API docs | OpenAPI — native FastAPI, NestJS Swagger module |

## 4. Service Deployment Units

1. **core-api** (Node) — stateless, horizontally scaled; owns write access to Postgres.
2. **realtime-gateway** (Node) — needs sticky sessions or shared Redis pub/sub so alert/ETA pushes fan out correctly across instances.
3. **ingestion-service** (Node) — runs **two distinct job types**, not one undifferentiated pipeline:
   - **Live pollers** (frequent, e.g. every 15–60 min): Mapbox routing cache refresh where applicable, Weather API, Global Market API, Global Trade/Geopolitical API, Congestion API, Vessel Position API.
   - **Dataset loaders** (infrequent, e.g. daily/weekly or on-demand): port master data, historic port turnaround, distance-between-ports table, vessel availability dataset, commodity price if dataset-sourced.
   - This split matters because dataset loaders can run as simple batch jobs with no freshness SLA pressure, while live pollers need retry/backoff and feed `DataSourceHealth`.
4. **prediction-service** (FastAPI) — loads the **three trained model artifacts** (freight rate, route alternatives/voyage time, alternative employment) from object storage at startup; scaled independently from `core-api` due to CPU cost.
5. **recommendation-service** (FastAPI) — stateless; hosts ETA calculation, risk scoring, deadheading optimization, and the Shipment orchestration sequence (freight → vessel-type → contract, per DESIGN.md §3); calls `prediction-service` for the freight-prediction step.
6. **model-registry** — module inside `prediction-service` for v1; tracks version/metrics for exactly the three trained models.

## 5. Data Flow: Ingestion → Compute → Alerts

```
[Live APIs] --(poll)--> ingestion-service (Node, live-poller jobs)
        │ writes VesselState, PortStatus (congestion/weather layer), market/trade inputs
        │ publishes "vessel.position.updated" / "port.congestion.changed" /
        │           "freight.factor.updated" / "weather.updated" events
        ▼
   Message Queue (Redis Streams)
        │
        ├──► recommendation-service consumer: recomputes RiskScore / ETA
        │     for vessels or shipments with an open, active Shipment
        │
        ├──► prediction-service consumer: only the Freight Rate model needs
        │     near-real-time factor refresh; Route Alternatives/Voyage Time
        │     and Alternative Employment are recomputed on-demand (per
        │     request), not on every data tick
        │
        └──► alert-rules consumer (Node): compares new values to user alert
              preferences, inserts Alert rows, pushes via realtime-gateway

[Datasets] --(batch load, daily/weekly)--> ingestion-service (Node, dataset-loader jobs)
        │ writes/refreshes Port, VesselPerformance, distance tables, historic TAT
        │ no downstream event fan-out required — these feed queries directly,
        │ not real-time recompute triggers
```

## 6. Internal Service Communication

- **Node → FastAPI:** synchronous REST over internal network, service-token authenticated, carrying `shipment_id`/`vessel_id`/`user_id` for traceability.
- **FastAPI → FastAPI** (`recommendation-service` → `prediction-service`, for the Shipment flow's freight-prediction step): same pattern.
- **Node → Node** (`core-api` → `realtime-gateway`): Redis pub/sub fan-out.
- No service writes to another service's schema directly; FastAPI services read from replicas only.

## 7. Security & Access

- `core-api` is the only publicly exposed service; all others sit in a private network reachable only internally.
- RBAC enforced in `core-api` for `shipowner` / `shipper` (plus extended-scope `org_admin`/`internal_admin`).
- Service-to-service auth via short-lived signed service tokens, separate from user JWTs.
- Secrets (DB creds, Mapbox/Weather/Market/Trade/Congestion/Position API keys) via a secrets manager, never checked into source.

## 8. Observability

- Structured JSON logs correlated via `shipment_id`/`vessel_id`/`request_id` across Node→FastAPI calls.
- Request latency/error metrics per endpoint (`prometheus-fastapi-instrumentator` for FastAPI; `@willsoto/nestjs-prometheus` for Node).
- Model performance (MAPE, calibration) tracked per the three trained models in `ModelVersion.metrics_json`.
- `DataSourceHealth` distinguishes `kind: api` (needs freshness/retry monitoring) from `kind: dataset` (needs load-success monitoring only) — these have different alerting thresholds and should not share one health check.

## 9. Scaling Considerations

- `prediction-service` (3 trained models) and `recommendation-service` (ETA/risk/deadheading compute) are the most CPU/memory-intensive — scale independently (HPA on CPU) from `core-api`.
- Cache the public market snapshot (Landing Page) in Redis with a short TTL — it needs no backend logic per the founder's note, just a cached read of already-ingested data.
- The Shipment flow's three outputs should be requested as a small internal batch (freight + vessel-type in parallel, contract sequenced after) rather than three separate round-trips from the client, to keep the "one entry" UX fast.
- Use PostGIS spatial indexes for all distance/route queries (deadheading distance, port proximity).

## 10. Local Development

- `docker-compose.yml`: `core-api`, `realtime-gateway`, `ingestion-service`, `prediction-service`, `recommendation-service`, `postgres` (PostGIS image), `redis`.
- Seed scripts (Node) to populate sample vessels/ports/shipments for local testing without live API credentials for Mapbox/Weather/Market/Trade/Congestion/Position.
- `prediction-service` runs with small pre-trained/mock artifacts in dev (`models/dev/`) for the three trained models, so local runs don't require full historical training data.
