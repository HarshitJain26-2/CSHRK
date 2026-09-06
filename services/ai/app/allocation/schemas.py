from pydantic import BaseModel, Field
from typing import List


class WorkforceAllocationRequest(BaseModel):
    """Input contract for future Phase 4 cooperative workforce allocation optimization"""
    cooperative_id: str
    target_date: str
    job_ids: List[str]
    available_worker_ids: List[str]


class AllocationAssignment(BaseModel):
    job_id: str
    assigned_worker_id: str
    optimization_metric_score: float


class WorkforceAllocationResponse(BaseModel):
    cooperative_id: str
    assignments: List[AllocationAssignment]
    unassigned_jobs: List[str]
    optimization_engine: str = "phase-4-placeholder"
