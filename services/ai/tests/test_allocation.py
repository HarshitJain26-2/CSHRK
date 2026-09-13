from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_workforce_allocation_optimizer():
    payload = {
        "cooperative_id": "coop-south-delhi",
        "target_date": "2026-09-15T09:00:00Z",
        "jobs": [
            {"job_id": "job-urgent-1", "skill_id": "skill-plumb", "duration_hours": 4.0, "priority": "URGENT"},
            {"job_id": "job-standard-2", "skill_id": "skill-elec", "duration_hours": 4.0, "priority": "STANDARD"},
            {"job_id": "job-unfulfillable", "skill_id": "skill-carpentry", "duration_hours": 8.0, "priority": "STANDARD"},
        ],
        "workers": [
            {
                "worker_id": "wrk-plumber",
                "verified_skill_ids": ["skill-plumb"],
                "available_hours": 8.0,
                "hourly_rating": 4.8,
            },
            {
                "worker_id": "wrk-electrician",
                "verified_skill_ids": ["skill-elec"],
                "available_hours": 8.0,
                "hourly_rating": 4.7,
            },
        ],
        "max_assignments_per_worker": 2,
    }

    response = client.post("/api/v1/ai/workforce-allocation", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["requires_cooperative_approval"] is True
    assert data["status"] == "RECOMMENDED"

    assignments = data["assignments"]
    assert len(assignments) == 2
    assigned_jobs = {a["job_id"] for a in assignments}
    assert "job-urgent-1" in assigned_jobs
    assert "job-standard-2" in assigned_jobs

    unassigned = data["unassigned_jobs"]
    assert "job-unfulfillable" in unassigned
