from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timezone

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: str


@router.get("/health", response_model=HealthResponse)
def get_health():
    """Returns AI Service health status and version"""
    return HealthResponse(
        status="healthy",
        service="cshrk-ai",
        version="0.1.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
