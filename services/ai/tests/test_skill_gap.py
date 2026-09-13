from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_skill_gap_analysis():
    payload = {
        "district_code": "DL-NORTH",
        "lookback_days": 30,
        "trade_data": [
            {
                "skill_id": "skill-1",
                "skill_name": "Solar Panel Technician",
                "skill_code": "SOL-01",
                "forecast_demand": 60,
                "active_certified_workers": 1,  # Capacity ~15 jobs -> deficit ~45
                "unfulfilled_demand_history": 5,
            },
            {
                "skill_id": "skill-2",
                "skill_name": "Plumber",
                "skill_code": "PLU-01",
                "forecast_demand": 30,
                "active_certified_workers": 4,  # Capacity ~60 jobs -> adequate
                "unfulfilled_demand_history": 0,
            },
        ],
    }

    response = client.post("/api/v1/ai/skill-gap", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["district_code"] == "DL-NORTH"
    deficits = data["deficits"]
    assert len(deficits) == 2

    solar = next(d for d in deficits if d["skill_code"] == "SOL-01")
    assert solar["severity"] == "CRITICAL"
    assert solar["recommended_trainees"] >= 3
    assert "apprenticeship" in solar["recommended_action"].lower()

    plumb = next(d for d in deficits if d["skill_code"] == "PLU-01")
    assert plumb["severity"] == "ADEQUATE"
    assert plumb["recommended_trainees"] == 0
