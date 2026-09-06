from pydantic import BaseModel
from typing import List


class SkillGapAnalysisRequest(BaseModel):
    """Input contract for future Phase 4 regional skill gap analysis"""
    district_code: str
    lookback_days: int = 30


class SkillDeficit(BaseModel):
    skill_name: str
    skill_code: str
    unfulfilled_request_count: int
    recommended_trainees: int


class SkillGapAnalysisResponse(BaseModel):
    district_code: str
    deficits: List[SkillDeficit]
    analysis_engine: str = "phase-4-placeholder"
