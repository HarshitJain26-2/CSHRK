# CSHRK AI Contract Specifications

The Pydantic data transfer contracts for future AI modules are established in `services/ai/app/`:

## 1. Matching Contract (`app/matching/schemas.py`)
- **Request**: `WorkerMatchRequest` (`service_request_id`, `required_skill_ids`, `latitude`, `longitude`, `max_distance_km`, `limit`)
- **Response**: `WorkerMatchResponse` (`service_request_id`, `candidates: List[WorkerMatchCandidate]`, `algorithm_version`)

## 2. Demand Forecasting Contract (`app/forecasting/schemas.py`)
- **Request**: `DemandForecastRequest` (`district_code`, `category`, `forecast_days_ahead`)
- **Response**: `DemandForecastResponse` (`district_code`, `category`, `predictions: List[DailyDemandPrediction]`)

## 3. Workforce Allocation Contract (`app/allocation/schemas.py`)
- **Request**: `WorkforceAllocationRequest` (`cooperative_id`, `target_date`, `job_ids`, `available_worker_ids`)
- **Response**: `WorkforceAllocationResponse` (`cooperative_id`, `assignments`, `unassigned_jobs`)
