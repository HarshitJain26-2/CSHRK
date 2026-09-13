from typing import List, Dict, Set
from app.allocation.schemas import (
    WorkforceAllocationRequest,
    WorkforceAllocationResponse,
    AllocationAssignment,
)


def optimize_allocation(request: WorkforceAllocationRequest) -> WorkforceAllocationResponse:
    assignments: List[AllocationAssignment] = []
    unassigned_jobs: List[str] = []

    # Track worker remaining hours and assignment count
    worker_hours: Dict[str, float] = {w.worker_id: w.available_hours for w in request.workers}
    worker_counts: Dict[str, int] = {w.worker_id: 0 for w in request.workers}
    worker_map = {w.worker_id: w for w in request.workers}

    # Sort jobs by priority (URGENT/EMERGENCY first)
    priority_order = {"EMERGENCY": 0, "URGENT": 1, "STANDARD": 2}
    sorted_jobs = sorted(request.jobs, key=lambda j: priority_order.get(j.priority.upper(), 2))

    for job in sorted_jobs:
        best_candidate = None
        best_score = -1.0

        for worker in request.workers:
            wid = worker.worker_id

            # 1. Skill constraint: Worker MUST possess the verified required skill
            if job.skill_id not in worker.verified_skill_ids:
                continue

            # 2. Capacity constraint: Available hours must cover duration
            if worker_hours[wid] < job.duration_hours:
                continue

            # 3. Maximum assignment constraint
            if worker_counts[wid] >= request.max_assignments_per_worker:
                continue

            # Optimization metric: Rating weighted by available remaining capacity
            score = (worker.hourly_rating / 5.0) * (worker_hours[wid] / worker.available_hours)

            if score > best_score:
                best_score = score
                best_candidate = worker

        if best_candidate:
            wid = best_candidate.worker_id
            worker_hours[wid] -= job.duration_hours
            worker_counts[wid] += 1

            assignments.append(
                AllocationAssignment(
                    job_id=job.job_id,
                    assigned_worker_id=wid,
                    optimization_metric_score=round(best_score, 4),
                    matched_skill_id=job.skill_id,
                )
            )
        else:
            unassigned_jobs.append(job.job_id)

    return WorkforceAllocationResponse(
        cooperative_id=request.cooperative_id,
        assignments=assignments,
        unassigned_jobs=unassigned_jobs,
        optimization_engine="cshrk-alloc-bipartite-v1.0.0",
        requires_cooperative_approval=True,
        status="RECOMMENDED",
        notes="AI recommendation requiring explicit cooperative approval before operational assignment.",
    )
