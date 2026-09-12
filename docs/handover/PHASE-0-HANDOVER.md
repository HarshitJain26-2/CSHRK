# CSHRK Phase 0 — Foundation Handover Document

```text
================================================================================
  PROJECT:                 CSHRK (Cooperative Labour & Service Marketplace)
  CURRENT PHASE:           PHASE 0 COMPLETE
  NEXT PHASE:              PHASE 1 — WORKER & WORKFORCE
  DEVELOPMENT MODEL:       Strict Sequential Handoff
  STATUS:                  FOUNDATION VERIFIED & OPERATIONAL
================================================================================
```

---

## 1. Project Identity

**CSHRK** is a digital platform designed for Labour Cooperative Federations, Primary Labour Cooperative Societies, unorganized and skilled workers, individual consumers, businesses, and government/institutional clients. 

CSHRK establishes a transparent, equitable, cooperative-first marketplace that replaces predatory middlemen with formal worker cooperative structures, verified skill credentials, fair wage protection, safety nets, and AI-assisted workforce dispatching.

### Development Model
The platform is being engineered through a strict **sequential phase handoff model**:
```text
PHASE 0 — FOUNDATION (All 5 Members) — [COMPLETED & VERIFIED]
        ↓
PHASE 1 — WORKER & WORKFORCE (Member 1) — [NEXT STARTING POINT]
        ↓
PHASE 2 — CUSTOMER & MARKETPLACE (Member 2)
        ↓
PHASE 3 — COOPERATIVE & FEDERATION (Member 3)
        ↓
PHASE 4 — PAYMENTS & AI INTELLIGENCE (Member 4)
        ↓
PHASE 5 — OPERATIONS, TRUST & COMPLETION (Member 5)
        ↓
PHASE FINAL — POLISHING & PRODUCTION READINESS (All 5 Members)
```

---

## 2. Current Phase Status

```text
PHASE 0 STATUS: FOUNDATION VERIFIED
```

### Comprehensive Verification Checklist
| Component | Status | Verification Detail |
| :--- | :---: | :--- |
| **Repository & Workspaces** | ✅ PASS | npm workspaces (`apps/*`, `services/*`, `packages/*`) configured and linking cleanly |
| **Backend API** | ✅ PASS | NestJS 10 modular monolith on Fastify, listening on port 3000, Swagger active |
| **Database** | ✅ PASS | PostgreSQL 16 active in Docker, healthy connection, TypeORM initialized |
| **PostGIS Spatial** | ✅ PASS | PostGIS 3.4.3 active with SRID 4326 geometries on 4 core spatial entities |
| **Authentication** | ✅ PASS | Centralized JWT auth (`/register`, `/login`, `/me`) with bcrypt password hashing |
| **RBAC Enforcement** | ✅ PASS | 5 standard user roles verified with `RolesGuard` (403 Forbidden on role mismatch) |
| **Customer Mobile Foundation** | ✅ PASS | Expo SDK 54, React Native 0.81.5, React 19.1.0, 18/18 expo-doctor checks passed |
| **Worker Mobile Foundation** | ✅ PASS | Expo SDK 54, React Native 0.81.5, React 19.1.0, 18/18 expo-doctor checks passed |
| **Admin Web Foundation** | ✅ PASS | React 19 + TypeScript + Vite 5 admin shell, builds production bundle with zero errors |
| **AI Service Foundation** | ✅ PASS | Python 3.13 + FastAPI 0.141 + Pydantic 2.13 skeleton with typed contracts & pytest |
| **Docker Infrastructure** | ✅ PASS | `docker-compose.yml`, `Dockerfile.api`, `Dockerfile.ai` established |
| **CI Pipeline** | ✅ PASS | `.github/workflows/ci.yml` with lint, type-check, test, and build matrix |
| **Unit Tests** | ✅ PASS | Jest 29 passing 3/3 test suites (13/13 tests) in backend; pytest passing 2/2 tests in AI |
| **TypeScript Type Check** | ✅ PASS | `npm run type-check` passes with zero errors across all 7 workspaces |
| **Production Build** | ✅ PASS | `npm run build` compiles all shared libraries, NestJS backend, and Vite admin web |
| **Documentation** | ✅ PASS | Architecture, API conventions, directory layouts, and setup guides complete |
| **Security Foundation** | ✅ PASS | `.env` ignored, bcrypt hashing (salt 10), JWT bearer auth, no hardcoded secrets |
| **Phase Boundary** | ✅ PASS | Schemas and contracts exist; business workflows strictly deferred to future phases |

---

## 3. Exact Technology Stack and Versions

*Values reflect exact package manifests and runtime verifications.*

### Root Monorepo
- **Node.js**: `>= 20.12.0` (active runtime verified on Node `22.x`)
- **npm**: `>= 10.5.0`
- **Workspaces**: npm workspaces spanning `packages/*`, `services/*`, and `apps/*`
- **Dependency Overrides**: `"react": "19.1.0"`, `"react-dom": "19.1.0"` (guarantees monorepo single-version hoisting)

### Customer Mobile (`apps/customer-mobile`)
- **Expo SDK**: `~54.0.37`
- **React**: `19.1.0`
- **React DOM**: `19.1.0`
- **React Native**: `0.81.5`
- **React Native Web**: `^0.21.0`
- **TypeScript**: `^5.4.5`
- **Expo Status Bar**: `~3.0.9`
- **Axios**: `^1.7.2`

### Worker Mobile (`apps/worker-mobile`)
- **Expo SDK**: `~54.0.37`
- **React**: `19.1.0`
- **React Native**: `0.81.5`
- **TypeScript**: `^5.4.5`
- **Expo Status Bar**: `~3.0.9`
- **Axios**: `^1.7.2`

### Admin Web (`apps/admin-web`)
- **Framework**: Pure React + Vite (NOT an Expo application)
- **React**: `19.1.0`
- **React DOM**: `19.1.0`
- **TypeScript**: `^5.4.5`
- **Vite**: `^5.2.11`
- **Icons**: `lucide-react@^0.379.0`
- **HTTP Client**: `axios@^1.7.2`

### Backend API (`services/api`)
- **Node.js Framework**: NestJS `^10.3.8` with Fastify adapter (`@nestjs/platform-fastify@^10.3.8`)
- **Language**: TypeScript `^5.4.5`
- **ORM**: TypeORM `^0.3.20`
- **Database Driver**: `pg@^8.11.5`
- **Authentication**: `@nestjs/jwt@^10.2.0`, `@nestjs/passport@^10.0.3`, `passport-jwt@^4.0.1`, `bcrypt@^5.1.1`
- **Documentation**: `@nestjs/swagger@^7.3.1`
- **Validation**: `class-validator@^0.14.1`, `class-transformer@^0.5.1`

### AI Labour Intelligence (`services/ai`)
- **Runtime**: Python `3.13.14` (also compatible with `3.11+`)
- **Framework**: FastAPI `0.141.1`
- **Data Modeling & Settings**: Pydantic `2.13.5`, Pydantic Settings `2.2.0`
- **ASGI Server**: Uvicorn `0.52.4`
- **Test Runner**: Pytest `9.1.1`, HTTPX `0.27.0`

### Infrastructure & Databases
- **Database Engine**: PostgreSQL `16`
- **Spatial Extension**: PostGIS `3.4.3` (`postgis/postgis:16-3.4` Docker container)
- **Containerization**: Docker Compose v2, multi-stage Alpine Node builder (`Dockerfile.api`), slim Python runner (`Dockerfile.ai`)
- **Continuous Integration**: GitHub Actions (`.github/workflows/ci.yml`) on `ubuntu-latest` with PostgreSQL+PostGIS service container

---

## 4. Repository Structure

```text
CSHRK/
├── apps/                               # Client frontends
│   ├── admin-web/                      # React + TypeScript + Vite 5 Admin Web Portal
│   ├── customer-mobile/                # Expo SDK 54 Customer Mobile Application
│   └── worker-mobile/                  # Expo SDK 54 Worker Mobile Application
├── services/                           # Microservices / Monolithic core services
│   ├── api/                            # NestJS 10 Modular Monolith REST Backend
│   │   ├── src/
│   │   │   ├── common/                 # Guards, interceptors, filters, decorators
│   │   │   ├── config/                 # Environment & TypeORM configuration
│   │   │   ├── database/               # Migrations, seed scripts, entity index
│   │   │   └── modules/                # Domain modules: auth, users, health, etc.
│   │   └── test/                       # E2E test suites
│   └── ai/                             # Python FastAPI Labour Intelligence Service
│       ├── app/
│       │   ├── api/                    # Health & future intelligence endpoints
│       │   ├── matching/               # Pydantic contracts for worker matching
│       │   ├── forecasting/            # Pydantic contracts for demand forecasting
│       │   ├── allocation/             # Pydantic contracts for workforce allocation
│       │   └── skill_gap/              # Pydantic contracts for skill-gap analysis
│       └── tests/                      # Pytest test cases
├── packages/                           # Shared internal TypeScript libraries
│   ├── config/                         # Centralized environment tokens and defaults
│   ├── types/                          # Domain models, enums (roles, statuses), DTOs
│   └── validation/                     # Shared Zod / class-validator schemas
├── infrastructure/                     # Deployment and container orchestration
│   ├── docker/
│   │   ├── docker-compose.yml          # PostgreSQL 16 + PostGIS 3.4 container
│   │   ├── Dockerfile.api              # Multi-stage container for NestJS API
│   │   └── Dockerfile.ai               # Slim container for Python FastAPI
│   └── deployment/                     # Staging & production deployment notes
├── docs/                               # Architecture and product design documentation
│   ├── api/CONVENTIONS.md              # RFC 7807 error format, status codes, conventions
│   ├── architecture/                   # High-level architecture, schemas, and diagrams
│   ├── product/                        # Phase maps, personas, product requirements
│   └── handover/
│       └── PHASE-0-HANDOVER.md         # THIS OFFICIAL HANDOVER DOCUMENT
├── .github/workflows/ci.yml            # CI validation workflow (lint, typecheck, test, build)
├── .env.example                        # Template environment variables
├── package.json                        # Monorepo root manifest with scripts & overrides
└── tsconfig.base.json                  # Root TypeScript shared compiler configuration
```

---

## 5. Architecture

CSHRK employs a **modular monolith** backend design for the core transactional platform, complemented by a specialized Python intelligence service for future ML workloads.

```text
       ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
       │   Customer Mobile    │   │    Worker Mobile     │   │      Admin Web       │
       │   (Expo SDK 54)      │   │    (Expo SDK 54)     │   │ (React 19 + Vite 5)  │
       └──────────┬───────────┘   └──────────┬───────────┘   └──────────┬───────────┘
                  │                          │                          │
                  └──────────────────────────┼──────────────────────────┘
                                             │ HTTP / REST / JSON
                                             ▼
                               ┌───────────────────────────┐
                               │     CSHRK Backend API     │
                               │   (NestJS 10 + Fastify)   │
                               └─────────────┬─────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      │ TypeORM                                     │ HTTP (Internal RPC)
                      ▼                                             ▼
       ┌─────────────────────────────┐               ┌─────────────────────────────┐
       │     PostgreSQL 16 +         │               │      AI Intelligence        │
       │      PostGIS 3.4.3          │               │      (Python FastAPI)       │
       │  (Spatial, SRID 4326)       │               │ (Contracts ready for Ph 4)  │
       └─────────────────────────────┘               └─────────────────────────────┘
```

### Why Modular Monolith?
- **Avoid Premature Distribution**: Microservices introduce network latency, distributed transactions, and deployment complexity that harm early-phase agility.
- **Single Source of Truth**: All shared domain entities (Users, Workers, Cooperatives, Bookings) remain strongly typed within the PostgreSQL transactional boundary.
- **Independent AI Service**: The Python AI service is isolated because data science/ML ecosystems (NumPy, PyTorch, Scikit-learn) thrive in Python, while transactional web APIs excel in Node.js/TypeScript.

---

## 6. User Roles

CSHRK establishes five non-overlapping user roles via the `UserRole` enum (`packages/types`):

1. **`CUSTOMER`**:
   - Individual consumers, households, or businesses requesting labour, trade, domestic, or seasonal services.
   - Primary client: Customer Mobile (`apps/customer-mobile`).
2. **`WORKER`**:
   - Primary wage earners, skilled tradespeople, and labour cooperative members providing physical and technical services.
   - Primary client: Worker Mobile (`apps/worker-mobile`).
3. **`COOPERATIVE_ADMIN`**:
   - Administrators of Primary Labour Cooperative Societies managing local rosters, member verification, job assignments, and local welfare.
   - Primary client: Admin Web Portal (`apps/admin-web`).
4. **`FEDERATION_ADMIN`**:
   - Regional or State Labour Cooperative Federation leaders managing inter-cooperative allocation, bulk enterprise contracts, policy compliance, and disputes.
   - Primary client: Admin Web Portal (`apps/admin-web`).
5. **`PLATFORM_ADMIN`**:
   - CSHRK system operators monitoring platform health, resolving cross-federation disputes, configuring global service categories, and managing infrastructure.
   - Primary client: Admin Web Portal (`apps/admin-web`).

---

## 7. Database Foundation

The database is built on PostgreSQL 16 with the PostGIS spatial extension enabled.

### Entities Currently Implemented (18 Tables)
1. **`users`**: Core credentials, contact info, hashed passwords, roles (`CUSTOMER`, `WORKER`, `COOPERATIVE_ADMIN`, `FEDERATION_ADMIN`, `PLATFORM_ADMIN`), and account statuses (`ACTIVE`, `PENDING_VERIFICATION`, `SUSPENDED`).
2. **`customers`**: Customer profile linking to `users`, holding `defaultLocation` (`geometry(Point, 4326)`).
3. **`workers`**: Worker master record linking to `users`, holding cooperative affiliation, KYC status, `currentLocation` (`geometry(Point, 4326)`), and hourly rates.
4. **`cooperatives`**: Primary Labour Cooperative Society entities with registration numbers, addresses, and `serviceBoundary` (`geometry(Polygon, 4326)`).
5. **`federations`**: Regional/Apex Cooperative Federation records governing groups of societies.
6. **`skills`**: Master taxonomy of certified and unorganized labour skills.
7. **`worker_skills`**: Many-to-many join table with proficiency levels and verification flags.
8. **`services`**: Standardized service catalog definitions.
9. **`service_requests`**: Customer demands with status, schedule, and `location` (`geometry(Point, 4326)`).
10. **`bookings`**: Confirmed assignments binding customer, worker, society, and service request.
11. **`invoices`**: Billing documents recording gross service amounts, cooperative commission, and platform fees.
12. **`payments`**: Payment records tracking transaction references, methods, and reconciliation statuses.
13. **`settlements`**: Cooperative member wage settlements and federation fund transfers.
14. **`ratings`**: Bilateral review records binding reviewer, target, booking, score, and remarks.
15. **`complaints`**: Grievance/dispute records raised by workers or customers.
16. **`welfare_records`**: Cooperative welfare fund contributions, insurance coverages, and worker claims.
17. **`audit_logs`**: System security and governance audit trail recording actor, action, and entity snapshots.
18. **`spatial_ref_sys`**: Standard PostGIS spatial reference system metadata.

### Spatial Foundation
- Coordinate Reference System: **WGS 84 (SRID 4326)**.
- Entities using geometries:
  - `cooperatives.serviceBoundary` (`POLYGON`)
  - `customers.defaultLocation` (`POINT`)
  - `workers.currentLocation` (`POINT`)
  - `service_requests.location` (`POINT`)

### Seed Process & Development Accounts
Running `npm run seed` populates clean test data with standard development password:
```text
Default Dev Password: DevPass123!
```
- Customer: `dev_customer@cshrk.local` (`CUSTOMER`)
- Worker: `dev_worker@cshrk.local` (`WORKER`)
- Cooperative Admin: `dev_coop@cshrk.local` (`COOPERATIVE_ADMIN`)
- Federation Admin: `dev_fed@cshrk.local` (`FEDERATION_ADMIN`)
- Platform Admin: `dev_admin@cshrk.local` (`PLATFORM_ADMIN`)

*Note: All development accounts are strictly segregated and clearly marked for development/testing only.*

---

## 8. Authentication & RBAC

The authentication system is centralized under `/api/v1/auth/`:

### Endpoints
- `POST /api/v1/auth/register`: Creates new user record with bcrypt-hashed password (cost factor 10), assigns role, returns created entity.
- `POST /api/v1/auth/login`: Validates credentials, checks account status, returns JWT access token (`7d` expiry in dev) and refresh token (`30d`).
- `GET /api/v1/auth/me`: Authenticated profile endpoint protected by `JwtAuthGuard` extracting current claims from `Bearer <token>`.

### RBAC Implementation
Role checks are enforced via declarative decorators and NestJS guards:
```typescript
@Get('admin-route')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PLATFORM_ADMIN, UserRole.FEDERATION_ADMIN)
async adminOnlyAction() { ... }
```
- Unauthorized access results in standard RFC 7807 **`403 Forbidden`** with explicit error detail.
- Unauthenticated access results in **`401 Unauthorized`**.

### Guidance for Future Developers
> **Do not replace or bypass this authentication system.** In subsequent phases, link new domain entities (e.g., `WorkerProfile`, `CustomerAddress`) directly to the authenticated `user.id` obtained via the `@CurrentUser()` decorator.

---

## 9. API Contract

- **Base URL Prefix**: `/api/v1/`
- **Swagger Documentation**: `http://localhost:3000/api/docs`
- **Global Validation**: Enforced via NestJS `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, and automatic type transformation.

### Standard Response Envelope
Successful responses conform to the standard `ApiResponse<T>` contract:
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "meta": {
    "timestamp": "2026-09-06T17:25:30.052Z"
  }
}
```

### Error Handling (RFC 7807 Specification)
Errors are caught by a global exception filter and formatted consistently:
```json
{
  "statusCode": 403,
  "message": "Access denied: required role in [PLATFORM_ADMIN], current role is CUSTOMER",
  "error": "Forbidden",
  "timestamp": "2026-09-06T17:26:11.228Z",
  "path": "/api/v1/auth/platform-admin-test"
}
```

---

## 10. Current UI Status

### Customer Mobile (`apps/customer-mobile`)
- **Status**: Foundation & Skeleton Shell only.
- **Provided**: Authentication forms, role validation, session storage, navigation tabs, base layout shell.

### Worker Mobile (`apps/worker-mobile`)
- **Status**: Foundation & Skeleton Shell only.
- **Provided**: Authentication forms, role validation, worker dashboard placeholder, profile screen shell.

### Admin Web (`apps/admin-web`)
- **Status**: Foundation & Admin Shell only.
- **Provided**: Responsive dashboard sidebar, topbar, role-based login gate, and stubbed navigation tabs (Cooperatives, Settings, Analytics).

> ⚠️ **CRITICAL NOTICE**: The current UI is NOT the final production UI. Visual polish, micro-animations, design tokens, complete form validations, edge cases, loading skeletons, and full responsive polish are intentionally deferred to their respective feature phases (Phase 1, Phase 2, Phase 3) and the final Polish Phase. The Phase 0 UI was strictly engineered as a functional architectural foundation.

---

## 11. Phase 0 Features Implemented

1. **Monorepo Architecture**: Clean workspace orchestration across apps, services, and packages.
2. **Centralized Authentication**: JWT bearer tokens, bcrypt hashing, and `/me` profile introspection.
3. **Role-Based Access Control**: 5 distinct roles protected by `RolesGuard`.
4. **Relational & Spatial Database**: 18 tables with PostGIS geometric columns and SRID 4326 indexing.
5. **REST API Foundation**: Fastify-backed NestJS API with Swagger OpenAPI documentation.
6. **Liveness & Health Checks**: Comprehensive health monitoring endpoints on API and AI services.
7. **Mobile Client Foundations**: Clean Expo SDK 54 setups with React Native 0.81.5 and Android bundle exports.
8. **Web Client Foundation**: Pure React 19 + TypeScript + Vite 5 admin portal.
9. **AI Service Skeleton**: FastAPI ASGI server with typed Pydantic contracts for future ML inference.
10. **Containerization**: Local Docker Compose stack with PostgreSQL 16 + PostGIS 3.4.3.
11. **CI Pipeline**: Automated lint, type-check, test, and build workflows.

---

## 12. Features Intentionally NOT Implemented (Deferred Scope)

- **Phase 1 — Worker & Workforce**:
  - Worker KYC submission and document uploading.
  - Cooperative member verification and physical badge generation.
  - Skill taxonomy assignment and Skill Passport generation.
  - Dynamic availability calendar and active shift toggles.
- **Phase 2 — Customer & Marketplace**:
  - Service catalog browsing and instant geolocation search.
  - Spatial worker radius matching and dispatching.
  - Booking engine state machine (`PENDING` → `CONFIRMED` → `IN_PROGRESS` → `COMPLETED`).
  - Bilateral rating and review submission forms.
- **Phase 3 — Cooperative & Federation**:
  - Society membership approval workflows and member rosters.
  - Federation inter-cooperative resource reallocation.
  - Public works enterprise contract bidding and tracking.
  - Cooperative welfare fund allocations and death/disability benefit claims.
- **Phase 4 — Payments & AI Intelligence**:
  - Payment gateway SDK integration (Razorpay / UPI / Stripe).
  - Escrow release, society commission splits, and automated payouts.
  - Real-time ML dispatch ranking, dynamic pricing, and skill-gap recommendations.
- **Phase 5 — Operations, Trust & Completion**:
  - Push notifications, SMS OTP verification, and in-app chat.
  - Formal dispute arbitration and grievance resolution workflows.
  - Panic SOS / emergency dispatch workflows.
- **Phase Final — Production Polish**:
  - Complete theme design consistency, micro-interactions, accessibility audit (WCAG AA).

---

## 13. Phase 1 — Where to Start

```text
================================================================================
  STARTING POINT FOR PHASE 1: WORKER & WORKFORCE
================================================================================
```

The next developer (Member 1) must begin Phase 1 following this strict order of implementation:

1. **Worker Profile & KYC Module (`services/api`)**:
   - Extend the existing `WorkerEntity` to support government IDs (Aadhaar/Voter ID hash), emergency contacts, and bank account/UPI details.
   - Implement worker profile endpoints: `GET /api/v1/workers/profile`, `PUT /api/v1/workers/profile`.
2. **Worker Onboarding Workflow**:
   - Create multi-step onboarding wizard in `apps/worker-mobile`.
   - Implement document upload and pending verification status handling.
3. **Cooperative Affiliation Module**:
   - Allow workers to select and affiliate with a local Primary Labour Cooperative Society (`cooperatives` table).
   - Implement cooperative membership request flow.
4. **Skills & Certifications**:
   - Bind skills from the `skills` master table via `worker_skills`.
   - Implement certification photo uploads and verification flags.
5. **Service Areas & Geolocation**:
   - Configure worker preferred operating radii around `workers.currentLocation`.
6. **Availability Calendar & Shifts**:
   - Implement availability state machine (`AVAILABLE`, `ON_DUTY`, `OFFLINE`).
7. **Skill Passport**:
   - Generate verified digital worker credential summarising verified skills, cooperative membership, and safety training.

---

## 14. Instructions for the Next AI Coding Agent

If you are an AI coding agent inheriting this repository, adhere strictly to these rules:

1. **Do NOT assume the repository is empty or broken**: A complete, working, and verified Phase 0 foundation already exists.
2. **Inspect before modifying**: Always run tests and inspect active files before editing. Never guess paths.
3. **Read this handover document**: Follow the architectural conventions and directory layouts documented here.
4. **Preserve existing architectural boundaries**:
   - Do NOT introduce unnecessary microservices.
   - Do NOT convert `admin-web` into an Expo project.
   - Do NOT downgrade mobile apps from Expo SDK 54 or React 19.
5. **Work ONLY on Phase 1**: If you are assigned Phase 1, implement Worker & Workforce features only. Do not build booking state machines (Phase 2), payment gateways (Phase 4), or chat features (Phase 5).
6. **Validate continuously**:
   - Run `npm run type-check` across the workspaces after modifying TypeScript code.
   - Run `npx expo-doctor` if modifying mobile dependencies.
   - Run unit tests with `npm run test`.
7. **Never commit secrets**: Respect `.gitignore`. Do not commit `.env` files or API keys.
8. **Report verifiable facts**: Never claim a feature works without running the verification command.

---

## 15. Development Commands

### Installation & Clean Setup
```powershell
# Install all monorepo dependencies
npm install

# Deduplication check
npm ls react react-dom
```

### Local Infrastructure
```powershell
# Start PostgreSQL 16 + PostGIS container in background
npm run docker:up

# Stop containers
npm run docker:down

# Seed database with development accounts
npm run seed --workspace=@cshrk/api
```

### Starting Applications
```powershell
# Start Backend API (Fastify / NestJS on http://localhost:3000)
npm run start:api

# Start Admin Web Portal (Vite on http://localhost:5173)
npm run start:admin

# Start Customer Mobile (Expo Metro on http://localhost:8081)
npm run start:customer

# Start Worker Mobile (Expo Metro on http://localhost:8081)
npm run start:worker

# Start Python AI Service (Uvicorn on http://localhost:8000)
npm run start:ai
```

### Quality Assurance & Verification
```powershell
# Run TypeScript compilation checks across all workspaces
npm run type-check

# Run unit tests
npm run test

# Run production build
npm run build

# Expo Doctor checks (run inside apps/customer-mobile or apps/worker-mobile)
npx expo-doctor

# Android Hermes bundle export verification
npx expo export -p android
```

---

## 16. Troubleshooting Notes & Lessons Learned

1. **React 19 Monorepo Deduplication**:
   - Problem: Expo SDK 54 uses React 19.1.0 and React Native 0.81.x, while legacy web templates default to React 18. Having mixed React versions creates nested duplicate copies under `apps/*/node_modules`, triggering `npx expo-doctor` duplicate native module failures.
   - Solution: Root `package.json` includes `"overrides": { "react": "19.1.0", "react-dom": "19.1.0" }`, and `admin-web` is upgraded to React 19.1.0. All packages share the single hoisted copy at root `node_modules`.
2. **Metro Resolution on Expo 54**:
   - Both mobile apps extend `"expo/tsconfig.base"` with `"moduleResolution": "bundler"`.
3. **Expo Asset Icons**:
   - Android bundling via `npx expo export -p android` requires valid PNG files at `assets/icon.png` (1024x1024 px). Valid placeholder icons are maintained in both mobile apps.
4. **Fastify on Windows**:
   - When running the NestJS API with Fastify on Windows, ensure port 3000 is free before starting.
5. **PostgreSQL Connectivity in Docker**:
   - The PostgreSQL container maps to `localhost:5432`. Ensure `cshrk_postgres` is running via `docker ps` before starting the backend or running migrations.

---

## 17. Git Handover Status

```text
Current branch:    develop
Remote:            origin/develop (https://github.com/HarshitJain26-2/CSHRK.git)
Working tree:      Clean (all Phase 0 foundation changes committed and pushed)
Latest commit:     1c22626 chore(deps): unify react 19 across monorepo and deduplicate dependencies
Tags:              No tags created (tags intentionally deferred until formal release)
```

### Phase 0 Commit Chain on `develop`
1. `5999ea4` feat(phase-0): add shared types config and validation
2. `5377c8d` feat(phase-0): establish backend api foundation
3. `fbfff7e` feat(phase-0): establish database and postgis foundation
4. `c0e0246` feat(phase-0): implement authentication and rbac foundation
5. `28dcc48` feat(phase-0): add health checks and api documentation
6. `960881c` feat(phase-0): add ai service foundation and contracts
7. `eb4e9b8` feat(phase-0): add customer mobile foundation
8. `30e51c0` feat(phase-0): add worker mobile foundation
9. `f9e8889` feat(phase-0): add admin web foundation
10. `44b6f73` chore(phase-0): add docker and local infrastructure
11. `02c6951 ci(phase-0): add lint typecheck test and build pipeline
12. `2b500aa` docs(phase-0): document product architecture and handover
13. `0bba439` fix(customer-mobile): upgrade to expo sdk 54 and configure bundler resolution
14. `8be2586` fix(worker-mobile): upgrade to expo sdk 54 and configure bundler resolution
15. `1c22626` chore(deps): unify react 19 across monorepo and deduplicate dependencies

---

## 18. Phase 0 Final Verification Results

- **`npm run type-check`**: **0 errors** across all 7 workspaces.
- **`npm run test`**: **3 passed, 3 total suites (13 passed, 13 total tests)**.
- **`npm run build`**: **0 errors**; compiles `@cshrk/types`, `@cshrk/config`, `@cshrk/validation`, `@cshrk/api`, and `@cshrk/admin-web`.
- **Backend Health (`/api/v1/health`)**: HTTP 200, `status: 'healthy'`, `database: 'connected'`.
- **Swagger Docs (`/api/docs`)**: HTTP 200, OpenAPI v3 documentation rendered.
- **Database & PostGIS**: PostgreSQL 16 + PostGIS 3.4.3 confirmed running in Docker with SRID 4326.
- **Authentication**: Registration (201), Login (200, returns JWT), and `/auth/me` (200) verified.
- **RBAC**: Customer accessing Platform Admin test endpoint returns **403 Forbidden**; Platform Admin returns **200 OK**.
- **Customer Mobile `expo-doctor`**: **18/18 checks passed**.
- **Worker Mobile `expo-doctor`**: **18/18 checks passed**.
- **Customer Android Export**: `AppEntry-fbeed95981fc9d6f2b5d7c6ee1adad16.hbc` (1.85 MB) generated successfully.
- **Worker Android Export**: `AppEntry-15bfd78b55264592b0bbf0754d73a4e9.hbc` (1.85 MB) generated successfully.
- **Admin Web Production Build**: Vite 5 transforms 97 modules and builds `dist/` in 766ms.
- **AI Service Pytest**: 2 passed in 0.26s (`test_health.py`).

---

## 19. Known Limitations

1. **UI is Foundation/Skeleton**: Mobile apps and Admin Web contain architectural shells and authentication flows; production visual styling and animations are deferred.
2. **Business Logic Deferred**: Marketplace bookings, worker dispatching, payments, and ratings have schema definitions only; active state machines will be created in Phases 1–5.
3. **AI Inference Placeholder**: AI contracts are typed using Pydantic; ML models and training pipelines will be integrated in Phase 4.
4. **Mock Payment Gateways**: Real external payment webhooks are not yet connected.

---

## 20. Final Handover Rule

```text
PHASE 0 IS COMPLETE AS A FOUNDATION.

The next developer or AI agent must continue from this exact repository state.

- Do not restart the project.
- Do not redesign the foundation without a demonstrated blocker.
- Do not skip reading this document.
- Begin PHASE 1 — WORKER & WORKFORCE only.
```
