# NAUGATI — Backend Product Requirements Document (PRD)

**Version:** 2.0 (revised against founder's handwritten notes — role model, merged flows, and data-source sourcing corrected)
**Scope:** Backend only (API, data, ML/recommendation services).
**Stack constraint:** FastAPI (Python) for prediction/recommendation/optimization services. Node.js (Express/NestJS) for core transactional API, auth, real-time, and orchestration. No other backend languages.

**What changed in v2.0 (cross-checked against notes):**
- The product is organized around **two roles — Shipowner and User (shipper/charterer)** — sharing six **Common Features**, each with additional role-specific features. This replaces the earlier flat "org admin / standard user" framing as the primary axis.
- The old separate "Cargo Requirement Intake → Vessel Availability → Vessel Details → Contract Recommendation" screens are replaced by a single **User-only merged flow called "Shipment"**: the user enters cargo details **once**, and that one entry fans out to Freight Rate Recommendation, Vessel (type-level) Recommendation, and Contract Recommendation — explicitly to avoid re-entering cargo data three times.
- **Deadheading Optimization is Shipowner-only** and is initiated by the shipowner declaring a vessel's availability (with a Yes/No confirmation), not by a shipper matching against vessels.
- A new **Shipowner-only module: Alternative Employment** (an ML recommendation model) suggests nearby cargo, backhaul cargo, triangulation, spot-market employment, or an alternative port/cargo for an underused or repositioning vessel.
- Every factor in every module is now tagged with its real source — **API, Dataset, or Model** — per the founder's own mapping, which materially changes the ingestion vs. ML-training design (see ARCHITECTURE.md).
- The Landing Page requires **no backend logic or ML model** — static content plus auth only.
- Screens from the original wireframe not mentioned in the founder's notes (Vessel Availability/Details as standalone screens, Live Maritime Dashboard, Compare Options, User Dashboard, Reports/Export, Admin Dashboard) are kept as **Extended Scope** — still useful, but secondary to the core flow below and explicitly flagged as such.

---

## 1. Product Summary

NAUGATI is a B2B maritime freight decision-support platform serving two distinct roles:
- **User (Shipper/Charterer):** has cargo to move, wants freight rate prediction, vessel-type recommendation, and contract recommendation from a single cargo entry ("Shipment").
- **Shipowner:** has a vessel, wants to avoid/minimize deadheading (empty repositioning) and find alternative employment (cargo) for an idle or repositioning vessel.

Both roles share six **Common Features**: Freight Rate Prediction, Route Optimization, ETA Prediction, Geopolitical & Risk Dashboard, Port Details, and Alerts & Notifications.

## 2. Goals

- Let a **User** enter cargo details once and receive freight rate, vessel-type, and contract recommendations from that single entry — no repeated data entry (this was the explicit design reason given for merging these into "Shipment").
- Let a **Shipowner** declare a vessel's availability and receive deadheading-cost analysis, better-match alternatives, and — when a vessel would otherwise deadhead — alternative-employment suggestions (nearby cargo, backhaul, triangulation, spot market, alternative port/cargo).
- Serve the six Common Features to both roles from shared services, with per-factor sourcing (API / Dataset / Model) matching reality, not a generic "live data" assumption.
- Be modular enough that ML/optimization logic (Python-native, FastAPI) is cleanly separated from transactional/business logic (Node.js-native).

## 3. Non-Goals

- No support for stacks other than FastAPI/Python and Node.js.
- No payment/billing module in v1.
- No backend logic or ML model on the Landing Page — it is static content + auth only, by explicit design decision.
- Extended-scope screens (§7) are not required for a first backend release.

## 4. Users & Roles

| Role | Description |
|---|---|
| **Shipowner** | Owns/operates vessels. Uses the six Common Features plus Deadheading Optimization and Alternative Employment. |
| **User (Shipper/Charterer)** | Has cargo to move. Uses the six Common Features plus the merged "Shipment" flow (freight + vessel-type + contract recommendation from one cargo entry). |
| Org Admin *(extended scope)* | Manages users under an organization, views org-wide reports. |
| NAUGATI Admin *(extended scope, internal)* | Manages data source configuration, ML model versions, monitors ingestion. |
| Anonymous | Landing page only: logo, tagline, services overview, live market snapshot, "Predict → Recommend → Optimize" explainer, login/signup. No backend logic or model required for this page. |

A single `User` account has one primary `role` (`shipowner` or `shipper`); the six Common Features are role-agnostic services called by whichever role is active.

## 5. Common Features (both roles)

Each factor below is explicitly tagged with its real source per the founder's mapping: **[API]**, **[Dataset]**, or **[Model]** (ML-predicted). This tagging drives what belongs in live ingestion vs. offline model training (see ARCHITECTURE.md §2/§4).

### 5.1 Freight Rate Prediction — [FastAPI, Model]
- FR-1.1: ML model trained to predict freight rate, using:
  - Weather **[API]**
  - Global market conditions **[API]**
  - Vessel availability **[Dataset]**
  - Commodity price **[API/Dataset — provider to be confirmed]**
- FR-1.2: Input: cargo details (from the "Shipment" flow for Users, or ad hoc for either role). Output: predicted rate, plus supporting graphs (historical vs. predicted).
- FR-1.3: Output action affordance: "Wait" or "Book now" — i.e., the response must include a clear recommended action, not just a number.
- FR-1.4: Predictions must be versioned (model id + timestamp) for auditability.

### 5.2 Route Optimization — [FastAPI, mixed sourcing]
- FR-2.1: Map rendering requires a **Mapbox API** integration (explicit provider decision).
- FR-2.2: Inputs — origin port, destination port: **user input**. Vessel current location: **[API]** (AIS or equivalent — provider still being evaluated). Planned route: **user input**.
- FR-2.3: Alternative route(s): **[Model]** — generated by a trained model, not a plain shortest-path/geometry algorithm.
- FR-2.4: Distance between ports: **[Dataset]**. Estimated voyage time: **[Model]** (predicted, not computed from distance/speed alone).
- FR-2.5: Overlays — weather zones **[API]**, congestion zones **[API]**, risk zones **[API/Dataset]**.
- FR-2.6: Return route comparison (fastest/cheapest/safest/recommended) with the same metric set per option.

### 5.3 ETA Prediction — [FastAPI, mixed sourcing]
- FR-3.1: Estimated arrival time factors:
  - Current vessel position, speed, distance, route: **entered by user** (v1) — not yet API-sourced; flagged for future automation.
  - Weather: **[API]**
  - Port congestion: **[API]**
  - Historic port turnaround: **[Dataset]**
- FR-3.2: Output: ETA timestamp, confidence, delay probability, expected delay.
- FR-3.3: Recompute when any input factor changes; feed changes into Alerts (§5.6).

### 5.4 Geopolitical & Risk Dashboard — [FastAPI]
- FR-4.1: Risk categories: geopolitical risk, weather risk, port congestion, trade restrictions, sanctions, regional conflict, canal disruption, fuel price risk.
- FR-4.2: Sourcing: weather **[API]**, global trade/geopolitical conditions **[Global Trade API]**, port-related risk **[Port Dataset]**.
- FR-4.3: Produce an overall risk level (Low/Medium/High) with an explanation built from the contributing factors — reused by Route Optimization, ETA, Deadheading, and the Shipment flow's contract recommendation.

### 5.5 Port Details — [Node, primarily Dataset-driven]
- FR-5.1: Fields: port name, country, UN/LOCODE, latitude/longitude, port type, terminal type, max vessel size, draft restriction, current congestion, weather, average turnaround time, current arrivals/departures, port alerts.
- FR-5.2: Per the founder's notes, this is sourced **by the datasets** — treat port master data as a periodically-refreshed dataset load, not a live per-request API call, except where congestion/weather/arrivals need to be layered in from their own live sources (§5.2, §5.4 sourcing applies here too).

### 5.6 Alerts & Notifications — [Node, event-driven]
- FR-6.1: Alert types: freight price change, vessel availability, ETA change, port congestion, weather warning, geopolitical warning, contract expiry, better vessel match.
- FR-6.2: Alerts are generated **whenever any underlying data changes** — this is event-driven off data updates, not a scheduled poll from the client.
- FR-6.3: Each alert carries a structured payload (type, severity, message, recommended action, related entity ids).
- FR-6.4: Delivery: in-app (WebSocket/SSE) for v1.

## 6. User-Only Feature: Shipment (merged flow)

This replaces the earlier separate cargo-intake → vessel-search → contract-recommendation screens with **one shared cargo entry** that fans out to three outputs, because re-entering the same cargo details for each of freight check, vessel recommendation, and contract recommendation was explicitly identified as bad UX to avoid.

- FR-S.1: User enters complete cargo details **once** into a `Shipment` (this is the same underlying `CargoRequirement` entity as before — the UX requirement is "enter once," which the existing single-entity design already satisfies; no schema change needed, just a UI/flow guarantee that all three outputs read from the same entry).
- FR-S.2: From that one entry, expose three outputs read from the same input:
  - **Freight Rate Recommendation** — same model as §5.1.
  - **Vessel Recommendation** — recommends at the **vessel-type/class level** (Handysize vs. Panamax vs. Capesize — "which is better" for this cargo), in addition to (not instead of) individual vessel matches.
  - **Find Best Shipping Contracts** — contract recommendation, computed **on the basis of the future predicted freight rate** from §5.1's output, not independently.
- FR-S.3: The contract recommendation must consume the freight prediction's output as an input (predicted-rate-driven), making Freight Prediction a hard dependency of Contract Recommendation in the execution order, not a parallel/independent call.

## 7. Shipowner-Only Features

### 7.1 Deadheading Optimization — [FastAPI]
Initiated by the **shipowner** declaring a vessel and its availability — this is the reverse direction of the original wireframe's shipper-side matching.
- FR-7.1: Inputs: vessel current location, cargo loading port.
- FR-7.2: Outputs: empty repositioning distance, estimated deadheading cost, alternative nearby vessels, savings achievable through better matching.
- FR-7.3: The shipowner confirms vessel availability via an explicit **Yes/No "are you available?" action** — this confirmation is a required, persisted step, not just a display of computed numbers.
- FR-7.4: When a vessel would otherwise deadhead, this module is the entry point into §7.2 (Alternative Employment).

### 7.2 Alternative Employment — [FastAPI, Model — requires training]
A dedicated recommendation model (explicitly flagged by the founder as needing training, separate from the freight/route/ETA models) that suggests employment for an idle or repositioning vessel:
- FR-7.5: Suggestion types: alternative nearby cargo, backhaul cargo, triangulation (multi-leg cargo chaining), spot-market employment, alternative port/cargo.
- FR-7.6: Each suggestion returns a score/ranking and a model version, consistent with the explainability requirement applied elsewhere (NFR-7).
- FR-7.7: This model is trained offline against historical cargo/vessel utilization data; it is not a simple filter query, per the founder's note that a model needs to be trained for this specifically.

## 8. Extended Scope (from the original wireframe, not covered in the founder's latest notes)

Kept as secondary/future backend capability — build after the six Common Features + Shipment + Shipowner features above are solid:
- Standalone Vessel Availability / Vessel Details screens (browsing vessels outside the Shipment flow).
- Live Maritime Dashboard (map of all vessels/ports/routes, search-by-vessel/port/route).
- Compare Options (side-by-side comparison of 2–4 vessels/contracts).
- User Dashboard (active shipments, saved items, watchlists, recent recommendations).
- Reports / Export (PDF/Excel generation of recommendation, forecast, comparison, risk reports).
- Admin / Backend Dashboard (data source health, system status, model rollback — internal ops tooling).

## 9. Non-Functional Requirements

- **NFR-1 Performance:** The Shipment flow's three outputs (freight, vessel-type, contract) should return within a few seconds of the single cargo submission; if contract recommendation's dependency on freight prediction (§6/FR-S.3) makes this too slow synchronously, return freight + vessel-type first and stream/patch in the contract recommendation.
- **NFR-2 Scalability:** ML-heavy compute (freight prediction, route alternatives, ETA, alternative employment) stays in FastAPI, scaled independently from the Node transactional layer.
- **NFR-3 Reliability:** Alert generation and ETA recompute must be idempotent and retry-safe.
- **NFR-4 Auditability:** Every prediction/recommendation response persists model version + input snapshot.
- **NFR-5 Security:** Role-based access control (shipowner vs. shipper vs. extended-scope admin roles); inter-service calls authenticated via internal service tokens.
- **NFR-6 Data freshness SLAs:** vary genuinely by source type per §5 tagging — API-sourced factors (weather, global market, congestion) should be no more than ~1 hour stale; Dataset-sourced factors (port master data, historic TAT, distances) are refreshed on a periodic batch cadence (e.g., daily/weekly), not real-time; Model-sourced factors (route alternatives, voyage time, freight rate, alternative employment) are only as fresh as their last training/inference run.
- **NFR-7 Explainability:** Every score/recommendation returns a factor breakdown and model version, never a bare number.

## 10. Success Metrics

- % of Shipment submissions that result in a contract recommendation being viewed (validates the "one entry, three outputs" value proposition).
- Shipowner deadheading-optimization → alternative-employment conversion rate (how often a "not available"/high-deadheading vessel gets routed into an alternative-employment suggestion).
- Prediction accuracy (MAPE) for freight rate, ETA, and voyage-time models, tracked per model version.
- Alert-to-action rate.

## 11. Open Questions (carried over / new)

- Confirm actual provider for: Mapbox (route optimization — confirmed direction), vessel current-location API (AIS or alternative — still being evaluated per notes), commodity price source (API vs. dataset — still open), global trade/geopolitical risk API.
- Training data availability and retention window for the three models that need offline training: Freight Rate, Route Alternatives/Voyage Time, and Alternative Employment.
- Whether Org Admin / NAUGATI Admin (extended scope) are needed for MVP or can be deferred entirely.
