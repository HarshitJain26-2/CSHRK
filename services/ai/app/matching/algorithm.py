from typing import List
from app.matching.schemas import (
    WorkerMatchRequest,
    WorkerMatchResponse,
    WorkerMatchCandidate,
    WorkerCandidateInput,
)

PROFICIENCY_WEIGHTS = {
    "BEGINNER": 0.75,
    "INTERMEDIATE": 0.90,
    "ADVANCED": 1.00,
    "EXPERT": 1.05,
}


def rank_workers(request: WorkerMatchRequest) -> WorkerMatchResponse:
    if not request.candidates:
        return WorkerMatchResponse(
            service_request_id=request.service_request_id,
            candidates=[],
            algorithm_version="cshrk-match-v1.2.0",
            fallback_used=False,
        )

    scored_candidates: List[WorkerMatchCandidate] = []

    for c in request.candidates:
        # 1. Mandatory Pre-ranking Hard Eligibility Filter
        if not c.has_verified_skill:
            continue
        if not c.has_mandatory_cert:
            continue
        if not c.is_available:
            continue
        if not c.coop_active:
            continue
        if c.distance_km > request.max_distance_km:
            continue

        # 2. Multi-factor Feature Extraction
        proximity_score = 1.0 / (1.0 + 0.08 * c.distance_km)
        job_experience_factor = min(1.0, 0.5 + (c.total_jobs / 40.0))
        reliability_score = (c.rating_avg / 5.0) * job_experience_factor
        prof_key = (c.proficiency_level or "INTERMEDIATE").upper()
        skill_fit_score = PROFICIENCY_WEIGHTS.get(prof_key, 0.90) / 1.05
        workload_score = max(0.6, 1.0 - (0.1 * c.current_active_jobs))

        # Composite Weighted Scoring
        raw_score = (
            0.35 * proximity_score
            + 0.35 * reliability_score
            + 0.20 * skill_fit_score
            + 0.10 * workload_score
        )
        match_score = round(min(1.0, max(0.0, raw_score)), 4)

        # 3. Explainability Generation (Human-Readable Reasons)
        explanations: List[str] = [
            "Verified trade skill credential on record",
            f"{round(c.distance_km, 1)} km from service location",
            f"Rated {round(c.rating_avg, 2)}/5.0 across {c.total_jobs} completed jobs",
        ]
        if c.current_active_jobs <= 1:
            explanations.append("Immediate availability with low weekly workload")
        if prof_key in ["ADVANCED", "EXPERT"]:
            explanations.append(f"{prof_key.capitalize()} trade proficiency level")

        scored_candidates.append(
            WorkerMatchCandidate(
                worker_id=c.worker_id,
                cooperative_id=c.cooperative_id,
                match_score=match_score,
                distance_km=round(c.distance_km, 2),
                skill_fit_score=round(skill_fit_score, 4),
                reliability_score=round(reliability_score, 4),
                explanations=explanations,
            )
        )

    # Sort descending by match score
    scored_candidates.sort(key=lambda x: x.match_score, reverse=True)
    top_candidates = scored_candidates[: request.limit]

    return WorkerMatchResponse(
        service_request_id=request.service_request_id,
        candidates=top_candidates,
        algorithm_version="cshrk-match-v1.2.0",
        fallback_used=False,
    )
