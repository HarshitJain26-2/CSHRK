# CSHRK — Cooperative Labour & Service Marketplace

> A digital workforce and service marketplace empowering Labour Cooperative Federations, Labour Cooperative Societies, workers, customers, businesses, and institutions.

---

## 1. Project Philosophy & Sequential Strategy

CSHRK is engineered for real-world cooperative organizations, providing structured workforce management, verifiable skill credentials, ethical worker remuneration, and intelligent labour allocation.

Development follows a strict **Sequential Phase Model**:
```text
PHASE 0 — FOUNDATION (All 5 Members)
        ↓  [Tag: PHASE-0-COMPLETE]
PHASE 1 — WORKER & WORKFORCE (Member 1)
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

**Rule**: No member begins a subsequent phase until the current phase passes all Definition of Done criteria, completes the Handover Protocol, and is pushed with its release marker.

---

## 2. Monorepo Architecture

```text
CSHRK/
├── apps/
│   ├── customer-mobile/       # React Native Expo app for Customers
│   ├── worker-mobile/         # React Native Expo app for Cooperative Workers
│   └── admin-web/             # Vite + React 18 + TS Web Portal for Admins
│
├── services/
│   ├── api/                   # NestJS Modular Monolith API with PostgreSQL & PostGIS
│   └── ai/                    # Python FastAPI AI Service Skeleton
│
├── packages/
│   ├── types/                 # Shared TypeScript interfaces, enums, DTOs
│   ├── validation/            # Shared validation rules & Zod schemas
│   └── config/                # Shared constants, role permissions, routes
│
├── infrastructure/
│   ├── docker/                # Dockerfile and docker-compose configurations
│   ├── deployment/            # Staging and production environment guides
│   └── monitoring/            # Health checks and structured logging conventions
│
├── docs/                      # Architectural & Product Specifications
│   ├── product/               # Vision, roles, entities, service vs job vs project
│   ├── architecture/          # High-level architecture, security, data flows
│   ├── database/              # Schema, ERD, PostGIS spatial models
│   ├── api/                   # API conventions, JWT auth, status codes
│   ├── ai/                    # Phase 4 AI roadmap and contract definitions
│   └── operations/            # Setup, Docker, migrations, handover protocol
│
└── .github/
    └── workflows/             # CI pipeline (lint, type-check, test, build)
```

---

## 3. Quick Start for Developers

### Prerequisites
- Node.js >= 20 (Node 24 recommended)
- npm >= 10
- Python >= 3.11 (Python 3.13 recommended)
- Docker Desktop with Docker Compose

### ⚡ Instant All-in-One Start (Recommended)
You can launch the entire stack (Postgres container, package build, database seed, NestJS API, Vite Admin Web, and FastAPI AI Service) with a **single command**:

```bash
# Using npm
npm run dev

# Or with database seed enabled
npm run dev -- --seed

# Or with mobile dev servers included
npm run dev -- --seed --customer --worker
```

On Windows PowerShell:
```powershell
.\start-all.ps1 -Seed -Customer -Worker
```

---

### Step-by-Step Manual Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/HarshitJain26-2/CSHRK.git
   cd CSHRK
   git checkout develop
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Start infrastructure (PostgreSQL with PostGIS)**:
   ```bash
   docker compose -f infrastructure/docker/docker-compose.yml up -d postgres
   ```

4. **Install all dependencies**:
   ```bash
   npm install
   ```

5. **Build shared packages**:
   ```bash
   npm run build
   ```

6. **Run database migrations and seed development data**:
   ```bash
   npm run db:migrate --workspace=@cshrk/api
   npm run db:seed --workspace=@cshrk/api
   ```

7. **Start individual services manually**:
   - Backend API (`http://localhost:3000`):
     ```bash
     npm run start:api
     ```
   - AI Service (`http://localhost:8000`):
     ```bash
     npm run start:ai
     ```
   - Admin Web (`http://localhost:5173`):
     ```bash
     npm run start:admin
     ```


---

## 4. Default Development Credentials
*(Strictly for local testing only — never used in production)*

| Role | Email | Password |
| :--- | :--- | :--- |
| **Customer** | `dev_customer@cshrk.local` | `DevPass123!` |
| **Worker** | `dev_worker@cshrk.local` | `DevPass123!` |
| **Cooperative Admin** | `dev_coop@cshrk.local` | `DevPass123!` |
| **Federation Admin** | `dev_fed@cshrk.local` | `DevPass123!` |
| **Platform Admin** | `dev_admin@cshrk.local` | `DevPass123!` |

---

## 5. Phase 1 Handover
Refer to [`docs/operations/HANDOVER.md`](file:///c:/Users/Harshit/Desktop/Projects/CSHRK/docs/operations/HANDOVER.md) for complete instructions on beginning **Phase 1 — Worker & Workforce**.
