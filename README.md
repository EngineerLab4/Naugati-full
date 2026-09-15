# NAUGATI Logistics & Shipping Intelligence Platform

Welcome to the **NAUGATI** platform workspace. This repository contains the full shipping intelligence platform, integrating the frontend web application, core API gateway, machine learning prediction microservice, and background data ingestion.

---

## 📁 Project Structure

This workspace is organized into modular services:

```text
NAUGATI/
├── NAUGATI_Frontend/              # Web Portal (React 18 + Vite, Port 5173)
│   ├── src/                       # UI components, dashboards, API services
│   └── package.json
│
├── NAUGATI Backend/               # Backend Microservices & ML
│   ├── core-api/                  # API Gateway & Business Logic (NestJS, Port 3000)
│   ├── prediction-service/        # ML Inference & Training (Python FastAPI, Port 8000)
│   │   ├── app/training/          # ML Training & feature engineering scripts
│   │   └── models/v1/             # Trained .joblib model artifacts
│   ├── ingestion-service/         # Background data sync & scrapers
│   └── docker-compose.yml         # Database infrastructure (MongoDB, Redis)
│
└── README.md                      # This guide
```

> **Note**: Because this is a multi-project workspace, running `npm run dev` directly in the root folder without pointing to a specific service will result in an `ENOENT: no such file or directory, open 'package.json'` error. Follow the commands below to run each service.

---

## 🚀 Quick Start: How to Run the Complete Application

To run the entire system locally, open separate terminal tabs and execute the commands in the order shown below:

---

### Step 1: Start Databases (MongoDB & Redis)

The platform requires MongoDB (port `27017`) and Redis (port `6380`). If using Docker:

```bash
# Start MongoDB and Redis containers:
docker start naugati2-mongodb-1 naugati2-redis-1

# OR start them via docker-compose:
cd "/Users/sachinkumarchauhan/Documents/NAUGATI/NAUGATI Backend"
docker compose up -d mongodb redis
```

---

### Step 2: Start the ML Prediction Service (FastAPI)

The prediction microservice serves the 5 trained ML models (freight rate, market direction, port congestion, voyage ETA, weather risk).

```bash
# Terminal Tab 1
cd "/Users/sachinkumarchauhan/Documents/NAUGATI/NAUGATI Backend/prediction-service"

# Activate Python virtual environment
source .venv/bin/activate

# Start FastAPI server on port 8000
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
- **Service URL**: `http://localhost:8000`
- **Health Check**: `http://localhost:8000/health`

---

### Step 3: Start the Core API Gateway (NestJS)

The Core API handles authentication, connects to MongoDB/Redis, queries external APIs (Alpha Vantage, FRED, AISStream, Open-Meteo), and routes predictions to the ML service.

```bash
# Terminal Tab 2
cd "/Users/sachinkumarchauhan/Documents/NAUGATI/NAUGATI Backend/core-api"

# Install dependencies (first time only)
npm install

# Build the project
npm run build

# Start the NestJS API server on port 3000
node dist/main.js
# OR for development mode with hot-reload:
# npm run start:dev
```
- **Gateway URL**: `http://localhost:3000`
- **Health Check**: `http://localhost:3000/api/predictions/health`

---

### Step 4: Start the Frontend Portal (React + Vite)

The frontend web interface displays the dashboards, interactive maps, Recharts visualizations, and live predictions.

```bash
# Terminal Tab 3
cd "/Users/sachinkumarchauhan/Documents/NAUGATI/NAUGATI_Frontend"

# Install dependencies (first time only)
npm install

# Start Vite development server on port 5173
npm run dev
```
- **Web App URL**: `http://localhost:5173`

---

## ⚡ Root Convenience Commands

A root `package.json` is provided so you can run frontend and backend shortcuts directly from the root `/Users/sachinkumarchauhan/Documents/NAUGATI` directory:

```bash
# Start the Frontend from root:
npm run dev
# OR:
npm run dev:frontend

# Start the Core API Gateway from root:
npm run dev:backend
```

---

## 🧠 Machine Learning: Training & Retraining

All models are trained strictly offline on historical shipping datasets with chronological splits to prevent future data leakage.

```bash
cd "/Users/sachinkumarchauhan/Documents/NAUGATI/NAUGATI Backend/prediction-service"
source .venv/bin/activate

# Run complete training pipeline for all 5 models:
python app/training/train_all_models.py

# Run prediction verification test suite:
python app/training/test_all_predictions.py
```

### Models Included:
1. **`freight_rate_v1`**: Multi-horizon 1M, 3M, 6M freight fixture forecaster (MAPE: 4.2%).
2. **`market_direction_v1`**: 7-day UP/DOWN/STABLE classifier (Test Accuracy: 86.2%).
3. **`port_congestion_v1`**: Dual queue classifier + waiting hour regressor.
4. **`voyage_eta_v1`**: Maritime transit duration & ETA predictor.
5. **`weather_risk_live_v1`**: Calibrated marine weather risk & Beaufort scale evaluator.

---

## 🌐 Summary of Active Ports

| Service | Technology | Port | Purpose |
| :--- | :--- | :--- | :--- |
| **NAUGATI Frontend** | React / Vite | `5173` | Web portal and dashboards |
| **Core API Gateway** | NestJS | `3000` | Gateway, integrations & MongoDB logging |
| **Prediction Service** | FastAPI / Python | `8000` | ML inference engine |
| **MongoDB** | Database | `27017` | Persistent data storage |
| **Redis** | Cache / Queue | `6380` | In-memory caching & queues |

---

## 🔧 Troubleshooting

- **`npm error enoent Could not read package.json`**:
  Make sure to either use the root helper scripts (`npm run dev`) or `cd` into the specific subfolder (`cd NAUGATI_Frontend && npm run dev`).
- **`ECONNREFUSED 127.0.0.1:8000`**:
  Ensure the ML prediction service is running (Step 2).
- **`MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`**:
  Ensure MongoDB is running (Step 1).
# Naugati-full
