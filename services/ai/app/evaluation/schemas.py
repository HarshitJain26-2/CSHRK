from pydantic import BaseModel


class ModelEvaluationMetric(BaseModel):
    """Schema for future Phase 4 model evaluation benchmarks"""
    model_name: str
    metric_name: str
    value: float
    evaluated_at: str
