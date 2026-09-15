# NAUGATI — Backend System Design

**Version 2.0** — revised to match the founder's notes: two roles (Shipowner / User), a single merged "Shipment" flow for Users, Shipowner-initiated Deadheading, and a new Alternative Employment model. Companion to `PRD.md` and `ARCHITECTURE.md`. Stack: **Node.js** (transactional/API/real-time) + **FastAPI** (ML/optimization/scoring), nothing else.

---

## 1. Service Boundaries

| Service | Owner | Responsibility |
|---|---|---|
| `core-api` | Node.js (NestJS/Express) | Auth, users (shipowner/shipper), ports, Shipment (cargo) CRUD, contracts, vessel-availability declarations, alerts, extended-scope dashboards/reports/admin |
| `realtime-gateway` | Node.js | WebSocket/SSE for alerts push, live position/ETA-change push |
| `ingestion-service` | Node.js | Two distinct pipelines — **live API polling** (weather, global market/trade, congestion zones, vessel position) and **periodic dataset loads** (port master data, historic turnaround, distances between ports, commodity price if dataset-sourced) |
| `prediction-service` | FastAPI | The three models that require offline training: Freight Rate, Route Alternatives/Voyage Time, Alternative Employment |
| `recommendation-service` | FastAPI | ETA computation, risk scoring, deadheading optimization, Shipment orchestration (freight → vessel-type → contract) |
| `model-registry` | FastAPI internal module | Tracks model versions/metrics for the three trained models above |

Node services own **all data of record** (Postgres). FastAPI services are stateless compute, reading from shared DB (read replicas) or payloads passed directly by `core-api`, writing back only prediction/recommendation result rows.

## 2. Role Model

```
User(id, role[shipowner|shipper], org_id NULLABLE, email, created_at)
```

- `shipper` → uses the **Shipment** flow (§3) plus the six Common Features.
- `shipowner` → uses **Vessel Availability Declaration → Deadheading Optimization → (optionally) Alternative Employment** (§4) plus the six Common Features.
- The six Common Features (Freight Rate Prediction, Route Optimization, ETA Prediction, Risk Dashboard, Port Details, Alerts) are role-agnostic services; both roles call the same endpoints.
- Extended-scope roles (`org_admin`, `internal_admin`) are additive and out of scope for the core data model below.

## 3. Request Flow — Shipment (User role, merged flow)

The key design constraint from the founder's notes: **cargo details are entered once** and power three outputs. This is implemented as one `CargoRequirement`/`Shipment` row that three downstream calls read from — never re-collected per output.

```
Client (shipper)
  │  POST /shipments   { cargo_type, quantity, unit, origin, destination,
  │                       loading_port_id, discharge_port_id,
  │                       preferred_loading_date, required_delivery_date }
  ▼
core-api ── persists Shipment (=CargoRequirement), returns shipment_id
  │
  │  1) POST /internal/predict/freight-rate  { shipment_id, ... }
  ▼
prediction-service (FastAPI) → FreightPrediction { predicted_rate, range,
        confidence, trend, action: "wait"|"book_now", factors, model_version }
  │
  │  2) POST /internal/recommend/vessel-type  { shipment_id }
  ▼
recommendation-service → { recommended_type[handysize|panamax|capesize|...],
        comparison: [{type, score, why}], candidate_vessels[] }
  │
  │  3) POST /internal/recommend/contract  { shipment_id, freight_prediction_id }
  ▼
recommendation-service → ContractRecommendation
        (MUST take freight_prediction_id as input — contract recommendation
         is explicitly "on the basis of future predicted freight rate",
         so step 3 is sequenced after step 1, not parallel to it)
  ▼
core-api composes all three into one Shipment response, persists each result
  row against the same shipment_id, returns to client
```

Steps 1 and 2 may run in parallel; step 3 has a hard dependency on step 1's output (PRD FR-S.3).

## 4. Request Flow — Deadheading & Alternative Employment (Shipowner role)

Reversed direction from a generic vessel search: the **shipowner** initiates by declaring a vessel and confirming availability.

```
Client (shipowner)
  │  POST /vessels/{id}/availability  { available: true|false, loading_port_id }
  ▼
core-api ── persists VesselAvailabilityDeclaration
  │  POST /internal/optimize/deadheading { vessel_id, loading_port_id }
  ▼
recommendation-service → { empty_repositioning_nm, estimated_cost,
        alternative_nearby_vessels: [...], savings_via_better_matching }
  ▼
core-api returns deadheading analysis to client

If the vessel would otherwise deadhead (high empty_repositioning_nm / no
good match) → client may request:
  │  POST /internal/recommend/alternative-employment { vessel_id }
  ▼
prediction-service (Alternative Employment model) → [{ suggestion_type
        [nearby_cargo|backhaul|triangulation|spot_market|alternative_port],
        cargo_ref / port_ref, score, model_version }]
```

## 5. Core Data Models (Postgres, owned by `core-api`)

```
Organization(id, name, plan, created_at)                       -- extended scope
User(id, org_id NULLABLE, email, role[shipowner|shipper|org_admin|internal_admin], created_at)

Port(id, unlocode, name, country, lat, lng, port_type, terminal_type,
     max_vessel_size, draft_restriction)                        -- dataset load
PortStatus(port_id, congestion_level, weather_json, avg_turnaround_hrs,
           arrivals_count, departures_count, updated_at)        -- API-refreshed layer on top of dataset

Vessel(id, imo, name, vessel_type[handysize|supramax|panamax|capesize],
       dwt, dimensions_json, draft, built_year, owner_user_id)
VesselState(vessel_id, current_lat, current_lng, current_voyage,
            next_port_id, eta, speed_knots, updated_at)         -- from vessel-position API
VesselPerformance(vessel_id, avg_delay_hist, incident_count, fuel_efficiency_json)  -- dataset

VesselAvailabilityDeclaration(id, vessel_id, shipowner_user_id, available_bool,
            loading_port_id, declared_at)                        -- the shipowner's Yes/No confirmation

Shipment(id, user_id, cargo_type, quantity, unit, origin, destination,
         loading_port_id, discharge_port_id, preferred_loading_date,
         required_delivery_date, priority, created_at)
         -- single entry powering all three Shipment outputs below

FreightPrediction(id, shipment_id NULLABLE, origin, destination,
                   vessel_type, cargo_qty, loading_date,
                   predicted_rate, current_rate, range_low, range_high,
                   confidence, trend, recommended_action[wait|book_now],
                   factors_json, model_version, created_at)

VesselTypeRecommendation(id, shipment_id, recommended_type, comparison_json,
                          candidate_vessel_ids, model_version, created_at)

Contract(id, shipment_id, freight_prediction_id, contract_type[spot|short|medium|long],
         reasons_json, comparison_json, status[recommended|accepted], created_at)
         -- freight_prediction_id enforces the "based on predicted rate" dependency

Route(id, origin_port_id, destination_port_id, vessel_id NULLABLE,
      geometry_json, distance_nm, est_duration_hrs,
      route_kind[fastest|cheapest|safest|recommended], risk_level,
      alternative_bool, model_version, created_at)
      -- alternative routes and est_duration_hrs are model-generated per notes

EtaPrediction(id, vessel_id, eta_timestamp, confidence, delay_probability,
              expected_delay_hrs, factors_json, created_at)
              -- v1 factors (position/speed/distance/route) are user-entered per notes

RiskScore(id, scope[route|region|port], scope_ref_id, geopolitical, weather,
          port_congestion, trade_restrictions, sanctions, regional_conflict,
          canal_disruption, fuel_price_risk, overall_level[low|medium|high],
          explanation, computed_at)

DeadheadingAnalysis(id, vessel_id, loading_port_id, empty_repositioning_nm,
                     estimated_cost, alternative_vessel_ids, savings_estimate,
                     computed_at)

AlternativeEmploymentSuggestion(id, vessel_id, suggestion_type
        [nearby_cargo|backhaul|triangulation|spot_market|alternative_port],
        cargo_ref NULLABLE, port_ref NULLABLE, score, model_version, created_at)

Alert(id, user_id, type[freight_change|vessel_availability|eta_change|
      congestion|weather|geopolitical|contract_expiry|better_match],
      severity, message, recommended_action, related_entity_json, read_bool, created_at)

ModelVersion(id, model_name[freight|route_alternatives|voyage_time|
             alternative_employment], version, trained_at, metrics_json, active_bool)

DataSourceHealth(id, source[weather_api|global_market_api|commodity_price|
                  congestion_api|vessel_position_api|global_trade_api|
                  port_dataset|historic_tat_dataset|distance_dataset],
                  kind[api|dataset], last_sync_at, status[ok|degraded|failed],
                  error_message)
```

## 6. API Contracts — `core-api` (Node.js)

```
POST   /auth/login | /auth/signup
GET    /market-snapshot                              # Landing page — no model, cached read

# Shipment flow (User/shipper role)
POST   /shipments                                     # single cargo entry
GET    /shipments/{id}/freight-prediction
GET    /shipments/{id}/vessel-recommendation
GET    /shipments/{id}/contract-recommendation        # requires freight-prediction to exist first

# Shipowner role
POST   /vessels/{id}/availability                     # Yes/No + loading port
GET    /vessels/{id}/deadheading?loading_port_id=
GET    /vessels/{id}/alternative-employment

# Common Features (either role)
GET    /routes?origin=&destination=&vessel_id=
GET    /vessels/{id}/eta
GET    /risk?scope=route&ref={route_id}
GET    /ports/{id}
GET    /alerts | PATCH /alerts/{id}/read

# Extended scope (secondary — see PRD §8)
GET    /maritime/live?bbox=
POST   /compare
GET    /dashboard
POST   /reports
GET    /admin/data-sources | /admin/system-status | /admin/models
```

## 7. API Contracts — FastAPI services

```
POST /internal/predict/freight-rate
  in:  { shipment_id NULLABLE, origin, destination, vessel_type, cargo_qty, loading_date }
  out: { predicted_rate, current_rate, range_low, range_high, confidence,
         trend, historical_series[], forecast_short[], forecast_mid[],
         recommended_action: "wait"|"book_now",
         factors: {weather, global_market, vessel_availability, commodity_price},
         model_version }

POST /internal/recommend/vessel-type
  in:  { shipment_id }
  out: { recommended_type, comparison: [{type, score, why}], candidate_vessel_ids[] }

POST /internal/recommend/contract
  in:  { shipment_id, freight_prediction_id }     # hard dependency, not optional
  out: { recommended_type, reasons: {freight_trend, volatility, demand,
         vessel_availability, geopolitical_risk, port_conditions},
         comparison: [{type, score}] }

POST /internal/optimize/route
  in:  { origin_port_id, destination_port_id, vessel_id }
  out: { planned_route, alternatives: [{kind, geometry, distance_nm,
         duration_hrs, risk_level}], zones: {weather[], congestion[], risk[]} }
         # alternatives + duration_hrs are model output, not geometry-only

POST /internal/predict/eta
  in:  { vessel_id, position, speed, distance, route }   # v1: user-entered inputs
  out: { eta_timestamp, confidence, delay_probability, expected_delay_hrs,
         factors: {weather, port_congestion, historic_turnaround}, model_version }

GET  /internal/risk?scope=&ref=
  out: { geopolitical, weather, port_congestion, trade_restrictions,
         sanctions, regional_conflict, canal_disruption, fuel_price_risk,
         overall_level, explanation }

POST /internal/optimize/deadheading
  in:  { vessel_id, loading_port_id }
  out: { empty_repositioning_nm, estimated_cost,
         alternative_nearby_vessels: [{vessel_id, distance_nm, cost}],
         savings_estimate }

POST /internal/recommend/alternative-employment
  in:  { vessel_id }
  out: [{ suggestion_type, cargo_ref, port_ref, score, model_version }]
```

## 8. Cross-Cutting Design Decisions

- **One cargo entry, three reads.** `Shipment` is written once; `FreightPrediction`, `VesselTypeRecommendation`, and `Contract` are all keyed off `shipment_id` — the API layer must never prompt for cargo details a second time within one Shipment flow.
- **Contract recommendation has a hard input dependency on freight prediction** (`Contract.freight_prediction_id` is NOT NULL) — this is a deliberate ordering constraint, not just a suggestion, per the founder's note that contract advice is "on the basis of future predicted freight rate."
- **Deadheading is shipowner-initiated.** `VesselAvailabilityDeclaration` is the entry point; deadheading analysis is a response to a declared vessel, never a background scan of "all vessels near a shipper's cargo."
- **Three models require offline training** (Freight Rate, Route Alternatives/Voyage Time, Alternative Employment) — these live in `prediction-service` with a training pipeline separate from runtime inference; everything else in `recommendation-service` (ETA math, risk scoring, deadheading distance/cost) can be computed from live inputs without a trained model, per the founder's own API/Dataset/Model tagging.
- **Every score/prediction returns a factor breakdown and model_version** — no bare numbers.
- **Alerts are event-driven off data changes**, not client polling; pushed via `realtime-gateway`.
