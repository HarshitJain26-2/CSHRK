from pydantic import BaseModel, Field
from typing import List, Optional


class HistoricalDataPoint(BaseModel):
    date: str
    request_count: int = Field(..., ge=0)


class DailyDemandPrediction(BaseModel):
    date: str
    expected_requests: int
    confidence_interval_lower: int
    confidence_interval_upper: int


class EvaluationMetrics(BaseModel):
    mae: float
    rmse: float
    mape: float
    evaluated_samples: int


class DemandForecastRequest(BaseModel):
    district_code: str
    category: str
    forecast_days_ahead: int = Field(default=7, ge=1, le=90)
    history: Optional[List[HistoricalDataPoint]] = None


class DemandForecastResponse(BaseModel):
    district_code: str
    category: str
    status: str = "SUCCESS"  # 'SUCCESS' or 'INSUFFICIENT_DATA'
    predictions: List[DailyDemandPrediction]
    model_version: str = "cshrk-demand-hw-v1.0.0"
    evaluation_metrics: Optional[EvaluationMetrics] = None
    notes: Optional[str] = None
