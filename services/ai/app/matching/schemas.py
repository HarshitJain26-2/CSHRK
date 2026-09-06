from pydantic import BaseModel, Field
from typing import List, Optional


class WorkerMatchRequest(BaseModel):
    """Input contract for future Phase 4 AI worker matching algorithm"""
    service_request_id: str
    required_skill_ids: List[str]
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    max_distance_km: float = Field(default=25.0, gt=0.0)
    limit: int = Field(default=10, ge=1, le=50)


class WorkerMatchCandidate(BaseModel):
    worker_id: str
    cooperative_id: str
    match_score: float = Field(..., ge=0.0, le=1.0)
    distance_km: float
    skill_fit_score: float
    reliability_score: float


class WorkerMatchResponse(BaseModel):
    service_request_id: str
    candidates: List[WorkerMatchCandidate]
    algorithm_version: str = "phase-4-placeholder"
