import math
from datetime import datetime, timedelta
from typing import List, Tuple
from app.forecasting.schemas import (
    DemandForecastRequest,
    DemandForecastResponse,
    DailyDemandPrediction,
    EvaluationMetrics,
)


def holt_winters_additive(
    series: List[float],
    season_length: int = 7,
    alpha: float = 0.3,
    beta: float = 0.1,
    gamma: float = 0.2,
    horizon: int = 7,
) -> Tuple[List[float], float]:
    """
    Additive Holt-Winters Triple Exponential Smoothing.
    Returns (forecast_values, residual_std_dev)
    """
    n = len(series)
    if n < season_length * 2:
        # Fallback to simple exponential smoothing if history is short but >= 14
        level = series[0]
        for val in series:
            level = alpha * val + (1.0 - alpha) * level
        forecasts = [level] * horizon
        residuals = [series[i] - level for i in range(n)]
        var = sum(r * r for r in residuals) / max(1, n)
        return forecasts, math.sqrt(var)

    # Initialize level and trend
    level = sum(series[:season_length]) / season_length
    trend = (sum(series[season_length : 2 * season_length]) - sum(series[:season_length])) / (season_length ** 2)

    # Initialize seasonal indices
    seasonals = [series[i] - level for i in range(season_length)]

    fitted = []
    for i in range(n):
        val = series[i]
        season_idx = i % season_length
        prev_level = level
        level = alpha * (val - seasonals[season_idx]) + (1.0 - alpha) * (prev_level + trend)
        trend = beta * (level - prev_level) + (1.0 - beta) * trend
        seasonals[season_idx] = gamma * (val - level) + (1.0 - gamma) * seasonals[season_idx]
        fitted.append(level + trend + seasonals[season_idx])

    # Forecast into future
    forecasts = []
    for m in range(1, horizon + 1):
        season_idx = (n + m - 1) % season_length
        f = level + (m * trend) + seasonals[season_idx]
        forecasts.append(max(0.0, f))

    # Calculate residual standard error
    residuals = [series[i] - fitted[i] for i in range(n)]
    variance = sum(r * r for r in residuals) / max(1, n - 1)
    std_err = math.sqrt(variance)

    return forecasts, std_err


def generate_demand_forecast(request: DemandForecastRequest) -> DemandForecastResponse:
    # Strict check: Insufficient data handling
    if not request.history or len(request.history) < 14:
        return DemandForecastResponse(
            district_code=request.district_code,
            category=request.category,
            status="INSUFFICIENT_DATA",
            predictions=[],
            model_version="cshrk-demand-hw-v1.0.0",
            evaluation_metrics=None,
            notes=(
                f"Insufficient historical transaction volume for statistical forecasting in district '{request.district_code}' "
                f"for category '{request.category}'. Minimum 14 daily observation points required; received {len(request.history or [])}."
            ),
        )

    # Sort history chronologically
    sorted_history = sorted(request.history, key=lambda x: x.date)
    series = [float(item.request_count) for item in sorted_history]
    n = len(series)

    # 1. Walk-forward cross-validation on holdout set of last 7 observations
    val_split = n - 7
    train_series = series[:val_split]
    actual_holdout = series[val_split:]

    val_forecasts, _ = holt_winters_additive(train_series, season_length=7, horizon=7)

    # Compute genuine evaluation metrics on holdout
    abs_errors = [abs(actual_holdout[i] - val_forecasts[i]) for i in range(7)]
    sq_errors = [(actual_holdout[i] - val_forecasts[i]) ** 2 for i in range(7)]
    pct_errors = [
        abs(actual_holdout[i] - val_forecasts[i]) / max(1.0, actual_holdout[i])
        for i in range(7)
    ]

    mae = round(sum(abs_errors) / 7.0, 3)
    rmse = round(math.sqrt(sum(sq_errors) / 7.0), 3)
    mape = round((sum(pct_errors) / 7.0) * 100.0, 2)

    # 2. Fit model on complete series to forecast forward
    horizon = request.forecast_days_ahead
    forecasts, std_err = holt_winters_additive(series, season_length=7, horizon=horizon)

    # Generate future daily predictions with 90% confidence intervals (z = 1.645)
    last_date = datetime.strptime(sorted_history[-1].date, "%Y-%m-%d")
    predictions: List[DailyDemandPrediction] = []

    for idx, expected in enumerate(forecasts):
        target_date = (last_date + timedelta(days=idx + 1)).strftime("%Y-%m-%d")
        exp_int = max(0, int(round(expected)))
        margin = max(1.0, 1.645 * std_err)
        ci_lower = max(0, int(round(expected - margin)))
        ci_upper = max(ci_lower, int(round(expected + margin)))

        predictions.append(
            DailyDemandPrediction(
                date=target_date,
                expected_requests=exp_int,
                confidence_interval_lower=ci_lower,
                confidence_interval_upper=ci_upper,
            )
        )

    return DemandForecastResponse(
        district_code=request.district_code,
        category=request.category,
        status="SUCCESS",
        predictions=predictions,
        model_version="cshrk-demand-hw-v1.0.0",
        evaluation_metrics=EvaluationMetrics(
            mae=mae,
            rmse=rmse,
            mape=mape,
            evaluated_samples=7,
        ),
        notes="Holt-Winters seasonal model with walk-forward validation on 7-day holdout.",
    )
