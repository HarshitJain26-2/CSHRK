# CSHRK Database Schema Specification

## 1. Primary Engine & Extensions
- **RDBMS**: PostgreSQL 16
- **Spatial Extension**: PostGIS 3.4
- **Spatial Reference System (SRID)**: `4326` (WGS 84 GPS standard)

## 2. Table Catalog (Phase 0 Foundation)

| Table | Primary Key | Description | Key Foreign Keys | Spatial Columns |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `id` (UUID) | Centralized authentication and identity | None | None |
| `federations` | `id` (UUID) | Apex state cooperative federations | None | None |
| `cooperatives` | `id` (UUID) | Primary labour cooperative societies | `federation_id` | `service_boundary` (Polygon, 4326) |
| `customers` | `id` (UUID) | Customer marketplace profiles | `user_id` | `default_location` (Point, 4326) |
| `workers` | `id` (UUID) | Society member workers | `user_id`, `cooperative_id` | `current_location` (Point, 4326) |
| `skills` | `id` (UUID) | Standardized trade and skill definitions | None | None |
| `worker_skills` | `id` (UUID) | Verified skills assigned to workers | `worker_id`, `skill_id` | None |
| `services` | `id` (UUID) | Standard marketplace service catalog | None | None |
| `service_requests` | `id` (UUID) | Customer booking demand orders | `customer_id`, `service_id` | `location` (Point, 4326) |
| `bookings` | `id` (UUID) | Contract assignment and dispatch | `service_request_id`, `worker_id` | None |
| `payments` | `id` (UUID) | Financial transaction records | `booking_id` | None |
| `invoices` | `id` (UUID) | Tax invoicing and fee records | `booking_id` | None |
| `settlements` | `id` (UUID) | Cooperative to worker payouts | `cooperative_id`, `worker_id` | None |
| `ratings` | `id` (UUID) | Dual-sided quality scores | `booking_id`, `reviewer_id` | None |
| `complaints` | `id` (UUID) | Grievance escalation records | `booking_id`, `raised_by_id` | None |
| `welfare_records` | `id` (UUID) | Cooperative worker welfare schemes | `worker_id`, `cooperative_id` | None |
| `audit_logs` | `id` (UUID) | System audit trails and event history | `user_id` | None |
