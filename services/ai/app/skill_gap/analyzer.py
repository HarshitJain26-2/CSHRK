import math
from typing import List
from app.skill_gap.schemas import (
    SkillGapAnalysisRequest,
    SkillGapAnalysisResponse,
    SkillDeficit,
)


def analyze_skill_gaps(request: SkillGapAnalysisRequest) -> SkillGapAnalysisResponse:
    deficits: List[SkillDeficit] = []
    total_shortage = 0

    # Assume a full-time certified worker fulfills on average 15 jobs per 30-day window
    jobs_per_worker_factor = max(1.0, (request.lookback_days / 30.0) * 15.0)

    for item in request.trade_data:
        capacity_jobs = item.active_certified_workers * jobs_per_worker_factor
        raw_deficit = item.forecast_demand - capacity_jobs

        # Add unfulfilled historical demand requests
        effective_deficit = max(0, int(math.ceil(raw_deficit))) + item.unfulfilled_demand_history

        if effective_deficit > 0:
            recommended_trainees = max(1, int(math.ceil(effective_deficit / jobs_per_worker_factor)))
        else:
            recommended_trainees = 0

        if effective_deficit >= 15:
            severity = "CRITICAL"
            action = f"Initiate emergency cooperative apprenticeship intake for {item.skill_name}."
        elif effective_deficit > 0:
            severity = "MODERATE"
            action = f"Upskill allied trade cooperative members into {item.skill_name} certifications."
        else:
            severity = "ADEQUATE"
            action = f"Sufficient certified {item.skill_name} capacity across primary societies."

        deficits.append(
            SkillDeficit(
                skill_id=item.skill_id,
                skill_name=item.skill_name,
                skill_code=item.skill_code,
                forecast_demand=item.forecast_demand,
                active_workers=item.active_certified_workers,
                deficit_count=effective_deficit,
                recommended_trainees=recommended_trainees,
                severity=severity,
                recommended_action=action,
            )
        )
        total_shortage += recommended_trainees

    critical_count = sum(1 for d in deficits if d.severity == "CRITICAL")
    summary = (
        f"District {request.district_code} Skill Gap Assessment ({request.lookback_days}-day horizon): "
        f"{critical_count} critical trade deficit(s) identified. Total {total_shortage} trainee apprentices recommended."
    )

    return SkillGapAnalysisResponse(
        district_code=request.district_code,
        deficits=deficits,
        analysis_engine="cshrk-skillgap-v1.0.0",
        summary=summary,
    )
