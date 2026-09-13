from fastapi import APIRouter, HTTPException
from app.skill_gap.schemas import SkillGapAnalysisRequest, SkillGapAnalysisResponse
from app.skill_gap.analyzer import analyze_skill_gaps

router = APIRouter()


@router.post("/skill-gap", response_model=SkillGapAnalysisResponse)
def get_skill_gap_analysis(request: SkillGapAnalysisRequest):
    try:
        return analyze_skill_gaps(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill gap analysis error: {str(e)}")
