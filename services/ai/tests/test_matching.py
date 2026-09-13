from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_matching_hard_eligibility_filter():
    payload = {
        "service_request_id": "req-1",
        "required_skill_ids": ["skill-plumb"],
        "latitude": 28.6139,
        "longitude": 77.2090,
        "max_distance_km": 15.0,
        "limit": 5,
        "candidates": [
            {
                "worker_id": "wrk-eligible",
                "cooperative_id": "coop-1",
                "has_verified_skill": True,
                "has_mandatory_cert": True,
                "is_available": True,
                "coop_active": True,
                "distance_km": 3.2,
                "rating_avg": 4.8,
                "total_jobs": 25,
            },
            {
                "worker_id": "wrk-no-skill",
                "cooperative_id": "coop-1",
                "has_verified_skill": False,  # Ineligible
                "has_mandatory_cert": True,
                "is_available": True,
                "coop_active": True,
                "distance_km": 1.0,
                "rating_avg": 5.0,
                "total_jobs": 50,
            },
            {
                "worker_id": "wrk-no-cert",
                "cooperative_id": "coop-1",
                "has_verified_skill": True,
                "has_mandatory_cert": False,  # Ineligible
                "is_available": True,
                "coop_active": True,
                "distance_km": 2.0,
                "rating_avg": 4.9,
                "total_jobs": 30,
            },
            {
                "worker_id": "wrk-offline",
                "cooperative_id": "coop-1",
                "has_verified_skill": True,
                "has_mandatory_cert": True,
                "is_available": False,  # Ineligible
                "coop_active": True,
                "distance_km": 1.5,
                "rating_avg": 4.7,
                "total_jobs": 15,
            },
        ],
    }

    response = client.post("/api/v1/ai/matching", json=payload)
    assert response.status_code == 200
    data = response.json()

    candidates = data["candidates"]
    # Only 1 candidate satisfies all hard eligibility criteria
    assert len(candidates) == 1
    assert candidates[0]["worker_id"] == "wrk-eligible"
    assert candidates[0]["match_score"] > 0.5
    assert len(candidates[0]["explanations"]) >= 3
    assert any("km" in exp for exp in candidates[0]["explanations"])


def test_matching_ranking_order():
    payload = {
        "service_request_id": "req-2",
        "required_skill_ids": ["skill-elec"],
        "latitude": 28.6139,
        "longitude": 77.2090,
        "max_distance_km": 20.0,
        "candidates": [
            {
                "worker_id": "wrk-far",
                "cooperative_id": "coop-1",
                "has_verified_skill": True,
                "has_mandatory_cert": True,
                "is_available": True,
                "coop_active": True,
                "distance_km": 15.0,
                "rating_avg": 4.0,
                "total_jobs": 5,
            },
            {
                "worker_id": "wrk-near-expert",
                "cooperative_id": "coop-1",
                "has_verified_skill": True,
                "has_mandatory_cert": True,
                "is_available": True,
                "coop_active": True,
                "distance_km": 2.1,
                "rating_avg": 4.95,
                "total_jobs": 45,
                "proficiency_level": "EXPERT",
            },
        ],
    }

    response = client.post("/api/v1/ai/matching", json=payload)
    assert response.status_code == 200
    data = response.json()

    candidates = data["candidates"]
    assert len(candidates) == 2
    assert candidates[0]["worker_id"] == "wrk-near-expert"
    assert candidates[0]["match_score"] > candidates[1]["match_score"]
