from pydantic import BaseModel, Field
from typing import List, Optional


class JobRequirement(BaseModel):
    job_id: str
    skill_id: str
    duration_hours: float = Field(default=4.0, gt=0.0)
    priority: str = Field(default="STANDARD")


class WorkerCapacity(BaseModel):
    worker_id: str
    verified_skill_ids: List[str]
    available_hours: float = Field(default=8.0, gt=0.0)
    hourly_rating: float = Field(default=4.5, ge=1.0, le=5.0)


class WorkforceAllocationRequest(BaseModel):
    cooperative_id: str
    target_date: str
    jobs: List[JobRequirement]
    workers: List[WorkerCapacity]
    max_assignments_per_worker: int = Field(default=2, ge=1)


class AllocationAssignment(BaseModel):
    job_id: str
    assigned_worker_id: str
    optimization_metric_score: float
    matched_skill_id: str


class WorkforceAllocationResponse(BaseModel):
    cooperative_id: str
    assignments: List[AllocationAssignment]
    unassigned_jobs: List[str]
    optimization_engine: str = "cshrk-alloc-bipartite-v1.0.0"
    requires_cooperative_approval: bool = True
    status: str = "RECOMMENDED"
    notes: str = "AI recommendation requiring explicit cooperative approval before operational assignment."
