from typing import List, Dict, Any
from pydantic import BaseModel


class AIModelRegistryEntry(BaseModel):
    model_name: str
    version: str
    task_type: str
    feature_schema: Dict[str, Any]
    training_data_ref: str
    evaluation_metrics: Dict[str, Any]
    status: str
    created_at: str


REGISTERED_MODELS: List[AIModelRegistryEntry] = [
    AIModelRegistryEntry(
        model_name="CSHRK Worker Matching Ranker",
        version="cshrk-match-v1.2.0",
        task_type="MATCHING",
        feature_schema={
            "distance_km": "float (geodesic distance in km)",
            "rating_avg": "float [1.0, 5.0]",
            "total_jobs": "int (completed verified contracts)",
            "current_active_jobs": "int (active concurrent assignments)",
            "proficiency_level": "enum [BEGINNER, INTERMEDIATE, ADVANCED, EXPERT]",
        },
        training_data_ref="cshrk_ops_dispatch_2026_q3",
        evaluation_metrics={
            "candidate_precision_at_5": 0.92,
            "acceptance_alignment": 0.88,
        },
        status="ACTIVE",
        created_at="2026-09-01T00:00:00Z",
    ),
    AIModelRegistryEntry(
        model_name="CSHRK Holt-Winters Demand Forecaster",
        version="cshrk-demand-hw-v1.0.0",
        task_type="FORECASTING",
        feature_schema={
            "date": "ISO 8601 date string",
            "request_count": "daily demand volume aggregate",
        },
        training_data_ref="cshrk_bookings_timeseries_2026",
        evaluation_metrics={
            "benchmark_mae": 1.84,
            "benchmark_rmse": 2.21,
            "benchmark_mape_pct": 8.5,
            "min_history_required_days": 14,
        },
        status="ACTIVE",
        created_at="2026-09-01T00:00:00Z",
    ),
    AIModelRegistryEntry(
        model_name="CSHRK Constrained Workforce Allocator",
        version="cshrk-alloc-bipartite-v1.0.0",
        task_type="ALLOCATION",
        feature_schema={
            "skill_id": "UUID",
            "available_hours": "float",
            "duration_hours": "float",
            "priority": "enum [STANDARD, URGENT, EMERGENCY]",
        },
        training_data_ref="cshrk_cooperative_capacity_v3",
        evaluation_metrics={
            "capacity_violation_rate": 0.0,
            "skill_constraint_adherence": 1.0,
        },
        status="ACTIVE",
        created_at="2026-09-01T00:00:00Z",
    ),
    AIModelRegistryEntry(
        model_name="CSHRK Regional Skill Gap Analyzer",
        version="cshrk-skillgap-v1.0.0",
        task_type="SKILL_GAP",
        feature_schema={
            "forecast_demand": "int (projected 30-day requests)",
            "active_certified_workers": "int (verified society members)",
            "unfulfilled_demand_history": "int",
        },
        training_data_ref="cshrk_federation_workforce_census",
        evaluation_metrics={
            "deficit_detection_accuracy": 0.95,
        },
        status="ACTIVE",
        created_at="2026-09-01T00:00:00Z",
    ),
]


def get_registered_models() -> List[AIModelRegistryEntry]:
    return REGISTERED_MODELS
