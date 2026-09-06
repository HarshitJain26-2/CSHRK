# CSHRK User Roles & Permissions

CSHRK operates on a single centralized authentication system with strict Role-Based Access Control (RBAC).

## 1. The 5 Core System Roles

### `CUSTOMER`
- **Definition**: Individual citizen, business client, or institutional procurer seeking skilled services.
- **Client App**: Customer Mobile (`apps/customer-mobile`).
- **Core Rights**: Browse services, submit service requests, review bookings, make payments, rate completed work.

### `WORKER`
- **Definition**: Skilled or semi-skilled labourer affiliated with a registered Labour Cooperative Society.
- **Client App**: Worker Mobile (`apps/worker-mobile`).
- **Core Rights**: View assigned bookings, update availability status, submit work completion confirmations, view personal Skill Passport.

### `COOPERATIVE_ADMIN`
- **Definition**: Administrator or secretary of a primary Labour Cooperative Society.
- **Client App**: Admin Web (`apps/admin-web`).
- **Core Rights**: Manage society workers, verify worker skills, assign jobs, review member welfare records, monitor settlement distributions.

### `FEDERATION_ADMIN`
- **Definition**: Executive or supervisory officer of an apex state or regional Labour Cooperative Federation.
- **Client App**: Admin Web (`apps/admin-web`).
- **Core Rights**: Oversee member cooperative societies, review inter-district workforce allocations, audit compliance, monitor state tenders.

### `PLATFORM_ADMIN`
- **Definition**: Technical systems operator and platform governance administrator.
- **Client App**: Admin Web (`apps/admin-web`).
- **Core Rights**: System configuration, global health monitoring, audit trail review, developer oversight.
