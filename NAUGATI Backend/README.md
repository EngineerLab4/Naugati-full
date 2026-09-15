# NAUGATI Backend — Monorepo

Implements `PRD.md` / `ARCHITECTURE.md` / `DESIGN.md` v2.0: a Node.js system-of-record
+ gateway layer, and a FastAPI compute layer, with two ingestion lanes (live API
polling vs. periodic dataset loads) and exactly three trained ML models.

```
naugati/
├── core-api/                 Node.js (NestJS) — auth, users, shipments, ports,
│                              vessels, contracts, alerts. Only public service.
├── realtime-gateway/         Node.js — WebSocket push (alerts, ETA/position)
├── ingestion-service/        Node.js — live pollers + dataset loaders
├── prediction-service/       FastAPI — 3 trained models (freight rate,
│                              route alternatives/voyage time, alt. employment)
├── recommendation-service/   FastAPI — ETA, risk scoring, deadheading,
│                              vessel-type & contract recommendation
├── infra/                    init.sql (raw-SQL tables) + shared infra notes
├── docs/                     PRD.md / ARCHITECTURE.md / DESIGN.md live here
├── docker-compose.yml        Spins up all 7 containers for local dev
└── naugati.code-workspace    VS Code multi-root workspace
```

## 0. Prerequisites

- Docker Desktop (or Docker Engine + Compose v2)
- Node.js 20+ and npm (only needed if you want to run a service outside Docker)
- Python 3.11+ (same — only needed for running a FastAPI service outside Docker)
- VS Code

## 1. Get the code into a real git repo

```bash
cd naugati
git init
git add .
git commit -m "Initial NAUGATI backend scaffold"
```

## 2. Create your local env files

Every service ships a `.env.example` — copy each to `.env` before running anything.
`.env` is gitignored on purpose; never commit real secrets.

```bash
cp core-api/.env.example                 core-api/.env
cp realtime-gateway/.env.example         realtime-gateway/.env
cp ingestion-service/.env.example        ingestion-service/.env
cp prediction-service/.env.example       prediction-service/.env
cp recommendation-service/.env.example   recommendation-service/.env
```

You can leave the external-API keys in `ingestion-service/.env` blank for now —
ARCHITECTURE.md §2 flags Weather/Global Market/Global Trade/Congestion/Vessel
Position as "provider TBD" or "still being evaluated." The pollers will just log
failures and record `data_source_health.status = 'failed'` until keys are added.

## 3. Bring the whole stack up with Docker Compose

```bash
docker compose build
docker compose up
```

This starts, in dependency order:
`mongodb` → `redis` → `core-api` (3000) → `realtime-gateway` (4000) →
`ingestion-service` (5000) → `prediction-service` (8000) → `recommendation-service` (8001).

Check everything is healthy:

```bash
curl http://localhost:3000/api/docs        # core-api Swagger UI (browser)
curl http://localhost:8000/healthz         # prediction-service
curl http://localhost:8001/healthz         # recommendation-service
curl http://localhost:5001/healthz         # ingestion-service
curl http://localhost:4000/healthz         # realtime-gateway
```

`core-api` uses Mongoose, so its collections (users, shipments, ports,
vessels, contracts, alerts, vessel_availability_declarations, port_status)
are created automatically on first write — Mongo has no fixed schema to
migrate. `infra/init-mongo.js` sets up indexes up front (uniqueness
constraints, plus the `2dsphere` geospatial index on `ports.location` that
replaces PostGIS) — it runs automatically the first time the `mongodb`
container initializes its volume.

## 4. Load sample dataset rows (optional, for local testing)

Sample CSVs are in `ingestion-service/seed-data/`. Trigger a loader manually:

```bash
curl -X POST http://localhost:5001/internal/load/port-master
curl -X POST http://localhost:5001/internal/load/distance-table
curl -X POST http://localhost:5001/internal/load/vessel-availability
curl -X POST http://localhost:5001/internal/load/commodity-price
```

In production these run on cron (`src/index.js` — daily at 02:00/03:00) instead
of being triggered by hand.

## 5. Exercise the core Shipment flow end-to-end

```bash
# 1. Sign up a shipper
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"shipper@example.com","password":"pass1234","role":"shipper"}'

# 2. Create a shipment (use the access_token from step 1 as a Bearer token)
curl -X POST http://localhost:3000/api/shipments \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "<your-user-id>",
    "cargo_type": "iron_ore",
    "quantity": 75000,
    "unit": "mt",
    "origin": "Brazil",
    "destination": "China",
    "loading_port_id": "<port-uuid>",
    "discharge_port_id": "<port-uuid>",
    "preferred_loading_date": "2026-10-01",
    "required_delivery_date": "2026-11-01"
  }'
```

This single call fans out to `prediction-service` (freight rate) and
`recommendation-service` (vessel-type) in parallel, then `recommendation-service`
(contract) sequenced after — matching DESIGN.md §3 exactly.

## 6. Running one service outside Docker (fast iteration)

**A Node service (example: core-api):**
```bash
cd core-api
npm install
npm run start:dev
```

**A FastAPI service (example: prediction-service):**
```bash
cd prediction-service
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Keep the other services running via `docker compose up mongodb redis ...` so
the one you're iterating on has something to talk to.

## 7. What's mocked vs. real right now

- **prediction-service**: all three routers fall back to clearly-labeled mock
  responses when no `.joblib` artifact exists in `models/dev/` (see
  `app/model_registry.py` and `app/training/README_TRAINING.py` for how to
  wire up real training later).
- **recommendation-service**: vessel-type/contract/ETA/risk/deadheading use
  placeholder heuristics with `TODO` markers showing exactly what real query
  needs to replace them (PostGIS distance lookups, RiskScore joins, etc.).
- **ingestion-service pollers**: will fail gracefully and log to
  `data_source_health` until real API keys/URLs are filled into `.env` per
  ARCHITECTURE.md §2's "provider TBD" list.

## 8. Open questions to resolve before this goes further (from ARCHITECTURE.md §2)

| Item | Status |
|---|---|
| Weather / Global Market / Global Trade / Congestion API providers | Confirmed direction, provider TBD |
| Vessel Position provider (AIS or alternative) | Still being evaluated |
| Commodity price: API or dataset | Open question |

## 9. Database note — diverges from ARCHITECTURE.md

`ARCHITECTURE.md`/`DESIGN.md` (v2.0, in `docs/`) specify PostgreSQL + PostGIS.
This scaffold now runs on **MongoDB** instead — a deliberate divergence from
those docs, made after the original spec was written. Practical implications:

- **No fixed schema / no migrations.** Mongoose schemas in `core-api/src/**/*.schema.ts`
  define shape for the app's own benefit, but Mongo won't reject an
  unexpected field the way Postgres would with a missing column.
- **Geospatial queries** (port proximity, deadheading distance) use a Mongo
  `2dsphere` index + `$near`/`$geoNear` instead of PostGIS `ST_DWithin`/spatial
  indexes — see `ports.schema.ts` and `ports.service.ts#findNear`.
- **No cross-collection joins/transactions by default.** Where DESIGN.md
  implied a SQL join (e.g. Port + PortStatus), the service does two reads and
  merges them in code (see `ports.service.ts#getDetails`).
- **IDs are Mongo ObjectIds**, not Postgres UUIDs — `_id` (exposed as `.id` by
  Mongoose) replaces every `PrimaryGeneratedColumn('uuid')` from the original
  entity definitions.
- If you want the two ML services to actually query Mongo, use the
  `get_db()` helper in `prediction-service/app/db.py` /
  `recommendation-service/app/db.py` (Motor, async) — currently unused by the
  mock routers, wired up and ready for when real queries replace the TODOs.

None of these change the service boundaries — only `ingestion-service`'s
connector list (`src/pollers/` vs `src/loaders/`) — see the comments in
`vessel-position.poller.js` and `commodity-price.loader.js` for exactly where
to swap once decided.
