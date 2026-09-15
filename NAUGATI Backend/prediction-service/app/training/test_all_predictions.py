"""
Unit and integration test for all 5 ML prediction endpoints.
"""
from fastapi.testclient import TestClient
from app.main import app
from app.model_registry import registry

# Load models into registry for testing
registry.load_all()
client = TestClient(app)


def test_health():
    res = client.get("/healthz")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "freight_rate" in data["models_loaded"]
    assert "market_direction" in data["models_loaded"]
    assert "port_congestion" in data["models_loaded"]
    assert "voyage_eta" in data["models_loaded"]
    print(" [OK] /healthz passed:", data["models_loaded"])


def test_freight_rate():
    payload = {
        "origin": "Australia",
        "destination": "Dhamra Port",
        "vessel_type": "Panamax",
        "cargo_qty": 75000.0,
        "loading_date": "2026-09-20"
    }
    res = client.post("/internal/predict/freight-rate", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert "predicted_rate" in data
    assert "forecast_1m" in data
    assert "forecast_3m" in data
    assert "forecast_6m" in data
    assert "recommended_action" in data
    assert "time_series" in data
    assert len(data["time_series"]) > 0
    print(f" [OK] /internal/predict/freight-rate: 1M=${data['forecast_1m']}, 3M=${data['forecast_3m']}, 6M=${data['forecast_6m']} | Action: {data['recommended_action']}")


def test_market_direction():
    payload = {
        "commodity": "Iron ore fines",
        "price_usd": 112.5,
        "return_7d": 0.021
    }
    res = client.post("/internal/predict/market-direction", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["direction"] in ["UP", "DOWN", "STABLE"]
    assert "probabilities" in data
    assert "confidence" in data
    print(f" [OK] /internal/predict/market-direction: {data['commodity']} -> {data['direction']} (Conf: {data['confidence']})")


def test_port_congestion():
    payload = {
        "port_name": "Dhamra",
        "vessels_waiting": 5,
        "historic_tat_hours": 36.0
    }
    res = client.post("/internal/predict/port-congestion", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["congestion_level"] in ["Low", "Medium", "High", "Severe"]
    assert "average_waiting_hours" in data
    assert "congestion_score" in data
    print(f" [OK] /internal/predict/port-congestion: {data['port_name']} -> Level: {data['congestion_level']}, Wait: {data['average_waiting_hours']} hrs, Score: {data['congestion_score']}")


def test_voyage_eta():
    payload = {
        "origin": "Gladstone, Australia",
        "destination": "Dhamra Port, India",
        "distance_remaining_nm": 4120.0,
        "vessel_speed_knots": 12.8,
        "vessel_delay_hist_hours": 4.0,
        "destination_waiting_hours": 24.0,
        "vessel_class": "Capesize"
    }
    res = client.post("/internal/predict/voyage-eta", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert "estimated_ocean_arrival" in data
    assert "estimated_berthing" in data
    assert "transit_days" in data
    assert len(data["milestones"]) > 0
    print(f" [OK] /internal/predict/voyage-eta: Transit: {data['transit_days']} days, Total: {data['total_voyage_days']} days, Arrival: {data['estimated_ocean_arrival']}")


def test_weather_risk():
    payload = {
        "corridor_or_port": "Bay of Bengal (Central Corridor)",
        "vessel_class": "Panamax",
        "wave_height_m": 2.4,
        "swell_wave_height_m": 1.9,
        "wind_speed_knots": 19.5
    }
    res = client.post("/internal/predict/weather-risk", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["risk_level"] in ["Low", "Moderate", "High", "Severe"]
    assert "weather_risk_score" in data
    assert "navigation_status" in data
    print(f" [OK] /internal/predict/weather-risk: Level: {data['risk_level']}, Score: {data['weather_risk_score']}, Status: {data['navigation_status']}")


if __name__ == "__main__":
    print("==========================================================")
    print("       RUNNING PREDICTION SERVICE VERIFICATION            ")
    print("==========================================================")
    test_health()
    test_freight_rate()
    test_market_direction()
    test_port_congestion()
    test_voyage_eta()
    test_weather_risk()
    print("\nALL PREDICTION SERVICE TESTS PASSED SUCCESSFULLY!")
