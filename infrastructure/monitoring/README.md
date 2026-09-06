# CSHRK Monitoring & Observability Baseline

## 1. Structured Logging
- The backend API utilizes NestJS `Logger` with structured contextual tags (`[AuthService]`, `[HealthController]`).
- The AI service utilizes Python standard `logging` configured in JSON format for production ingestion.

## 2. Health Check Endpoints
- **Backend API**: `GET /api/v1/health`
  - Validates active database connectivity via `SELECT 1`.
  - Reports uptime and memory RSS/heap metrics.
  - Returns HTTP 200 (OK) when operational, HTTP 503 (Service Unavailable) when degraded.
- **AI Service**: `GET /api/v1/health`
  - Returns service status, version, and UTC timestamp.

## 3. Future Observability (Phase Final)
- Prometheus metrics scraping (`/metrics`) and Grafana dashboards are deferred to Phase Final to maintain a lightweight foundation.
