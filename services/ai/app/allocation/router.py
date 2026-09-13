from fastapi import APIRouter, HTTPException
from app.allocation.schemas import WorkforceAllocationRequest, WorkforceAllocationResponse
from app.allocation.optimizer import optimize_allocation

router = APIRouter()


@router.post("/workforce-allocation", response_model=WorkforceAllocationResponse)
def allocate_workforce(request: WorkforceAllocationRequest):
    try:
        return optimize_allocation(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workforce allocation error: {str(e)}")
