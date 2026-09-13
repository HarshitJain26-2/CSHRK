from fastapi import APIRouter, HTTPException
from app.matching.schemas import WorkerMatchRequest, WorkerMatchResponse
from app.matching.algorithm import rank_workers

router = APIRouter()


@router.post("/matching", response_model=WorkerMatchResponse)
def match_workers(request: WorkerMatchRequest):
    try:
        return rank_workers(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI matching error: {str(e)}")
