# CSHRK Product Domain Entities

## 1. Domain Taxonomy

### Organizational Structure
- **Federation**: State-level apex cooperative governing multiple local societies.
- **Cooperative**: Local primary labour cooperative society registered with jurisdiction over a geographic service boundary.

### Workforce & Membership
- **User**: Centralized authentication identity with unique email, hashed password, and role.
- **Worker**: Member worker tied to a cooperative society, holding real-time availability and PostGIS GPS location.
- **Skill**: Standardized trade or craft skill (e.g., Electrical, Plumbing, Carpentry).
- **WorkerSkill**: Relational verification record certifying worker proficiency and verified credentials.
- **Certification**: Formal diploma, government certification, or cooperative training accreditation.
- **Availability**: Weekly recurring or ad-hoc timeslot definition for a worker.

### Marketplace & Fulfillment
- **Customer**: Profile record for service consumers.
- **Service**: Catalog entry defining base rate, billing unit (e.g. per hour, per job), and trade category.
- **ServiceRequest**: Customer demand record containing GPS coordinates and target schedule.
- **Booking**: Active contract assignment linking a Customer, Worker, and Cooperative Society.

### Financial, Trust & Operations
- **Payment**: Transaction record tracking gateway status and customer settlement.
- **Invoice**: Formal tax invoice detailing subtotal, platform fee, and cooperative breakdown.
- **Settlement**: Cooperative remittance ledger to member workers.
- **Rating**: Mutual evaluation score (1-5) and feedback comment.
- **Complaint / Dispute**: Customer or worker dispute escalation record.
- **WelfareRecord**: Cooperative welfare scheme contributions, health coverage, or retirement ledger.
- **AuditLog**: Immutable action log capturing user actions, IP addresses, and payload diffs.
