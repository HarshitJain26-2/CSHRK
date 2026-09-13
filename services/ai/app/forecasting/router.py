from fastapi import APIRouter, HTTPException
from app.forecasting.schemas import DemandForecastRequest, DemandForecastResponse
from app.forecasting.model import generate_demand_forecast

router = APIRouter()


@router.post("/demand-forecast", response_model=DemandForecastResponse)
def get_demand_forecast(request: DemandForecastRequest):
    try:
        return generate_demand_forecast(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demand forecasting error: {str(e)}")
