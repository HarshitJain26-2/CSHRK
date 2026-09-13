from pydantic import BaseModel, Field
from typing import List, Optional


class WorkerCandidateInput(BaseModel):
    worker_id: str
    cooperative_id: str
    has_verified_skill: bool = True
    has_mandatory_cert: bool = True
    is_available: bool = True
    coop_active: bool = True
    distance_km: float = Field(..., ge=0.0)
    rating_avg: float = Field(default=4.5, ge=1.0, le=5.0)
    total_jobs: int = Field(default=10, ge=0)
    current_active_jobs: int = Field(default=0, ge=0)
    proficiency_level: str = Field(default="INTERMEDIATE")


class WorkerMatchRequest(BaseModel):
    service_request_id: str
    required_skill_ids: List[str]
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    max_distance_km: float = Field(default=25.0, gt=0.0)
    limit: int = Field(default=10, ge=1, le=50)
    candidates: Optional[List[WorkerCandidateInput]] = None


class WorkerMatchCandidate(BaseModel):
    worker_id: str
    cooperative_id: str
    match_score: float = Field(..., ge=0.0, le=1.0)
    distance_km: float
    skill_fit_score: float
    reliability_score: float
    explanations: List[str]


class WorkerMatchResponse(BaseModel):
    service_request_id: str
    candidates: List[WorkerMatchCandidate]
    algorithm_version: str = "cshrk-match-v1.2.0"
    fallback_used: bool = False
