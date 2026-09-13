from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_forecasting_insufficient_data():
    # Only 5 days provided (minimum required is 14)
    payload = {
        "district_code": "DL-SOUTH",
        "category": "PLUMBING",
        "forecast_days_ahead": 7,
        "history": [
            {"date": "2026-09-01", "request_count": 10},
            {"date": "2026-09-02", "request_count": 12},
            {"date": "2026-09-03", "request_count": 11},
            {"date": "2026-09-04", "request_count": 14},
            {"date": "2026-09-05", "request_count": 13},
        ],
    }

    response = client.post("/api/v1/ai/demand-forecast", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "INSUFFICIENT_DATA"
    assert len(data["predictions"]) == 0
    assert data["evaluation_metrics"] is None
    assert "Minimum 14 daily observation points required" in data["notes"]


def test_forecasting_sufficient_data():
    # Provide 21 days of daily demand observations
    history = [
        {"date": f"2026-08-{i:02d}", "request_count": 15 + (i % 7) * 3}
        for i in range(10, 32)
    ]
    payload = {
        "district_code": "DL-SOUTH",
        "category": "ELECTRICAL",
        "forecast_days_ahead": 7,
        "history": history,
    }

    response = client.post("/api/v1/ai/demand-forecast", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "SUCCESS"
    assert len(data["predictions"]) == 7
    for p in data["predictions"]:
        assert p["expected_requests"] >= 0
        assert p["confidence_interval_lower"] <= p["expected_requests"]
        assert p["confidence_interval_upper"] >= p["expected_requests"]

    metrics = data["evaluation_metrics"]
    assert metrics is not None
    assert metrics["mae"] >= 0.0
    assert metrics["rmse"] >= 0.0
    assert metrics["evaluated_samples"] == 7
