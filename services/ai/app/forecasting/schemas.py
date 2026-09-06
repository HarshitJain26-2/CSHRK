from pydantic import BaseModel, Field
from typing import List, Dict


class DemandForecastRequest(BaseModel):
    """Input contract for future Phase 4 labour demand forecasting"""
    district_code: str
    category: str
    forecast_days_ahead: int = Field(default=7, ge=1, le=90)


class DailyDemandPrediction(BaseModel):
    date: str
    expected_requests: int
    confidence_interval_lower: int
    confidence_interval_upper: int


class DemandForecastResponse(BaseModel):
    district_code: str
    category: str
    predictions: List[DailyDemandPrediction]
    model_version: str = "phase-4-placeholder"
