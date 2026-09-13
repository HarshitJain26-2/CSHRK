from pydantic import BaseModel, Field
from typing import List, Optional


class TradeSkillDemandSupply(BaseModel):
    skill_id: str
    skill_name: str
    skill_code: str
    forecast_demand: int = Field(..., ge=0)
    active_certified_workers: int = Field(..., ge=0)
    unfulfilled_demand_history: int = Field(default=0, ge=0)


class SkillDeficit(BaseModel):
    skill_id: str
    skill_name: str
    skill_code: str
    forecast_demand: int
    active_workers: int
    deficit_count: int
    recommended_trainees: int
    severity: str  # 'CRITICAL' | 'MODERATE' | 'ADEQUATE'
    recommended_action: str


class SkillGapAnalysisRequest(BaseModel):
    district_code: str
    lookback_days: int = Field(default=30, ge=7, le=180)
    trade_data: List[TradeSkillDemandSupply]


class SkillGapAnalysisResponse(BaseModel):
    district_code: str
    deficits: List[SkillDeficit]
    analysis_engine: str = "cshrk-skillgap-v1.0.0"
    summary: str
