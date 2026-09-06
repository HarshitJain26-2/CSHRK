# CSHRK System Architecture Overview

```mermaid
graph TD
    CM[Customer Mobile<br/>React Native Expo] -->|REST /api/v1| API[NestJS Modular Monolith API]
    WM[Worker Mobile<br/>React Native Expo] -->|REST /api/v1| API
    AW[Admin Web Portal<br/>Vite + React 18 + TS] -->|REST /api/v1| API

    API -->|TypeORM / PostGIS| DB[(PostgreSQL 16 + PostGIS 3.4)]
    API -.->|Future Phase 4 RPC / REST| AI[FastAPI AI Service Skeleton]

    subgraph "Monorepo Workspace"
        PKGT[packages/types]
        PKGC[packages/config]
        PKGV[packages/validation]
    end

    API --> PKGT
    API --> PKGC
    API --> PKGV
    CM --> PKGT
    WM --> PKGT
    AW --> PKGT
```

## 1. Architectural Style: Modular Monolith
CSHRK adopts a **Modular Monolith** pattern for the backend service (`services/api`). This avoids premature distributed microservices complexity while maintaining clean separation of concerns through NestJS domain modules.

## 2. Spatial Engine: PostgreSQL + PostGIS (SRID 4326)
- PostGIS enables native geographic queries:
  - Measuring exact geodesic distance between customer demand and available workers (`ST_DistanceSphere`).
  - Checking whether a job location falls within a Cooperative's registered district boundary (`ST_Contains`).
  - Spatial indexing using GiST indexes for millisecond query performance.

## 3. AI Service Boundary
- The AI service is decoupled into `services/ai` (Python FastAPI) to allow high-performance numerical computing (NumPy, Scikit-learn, PyTorch) in future Phase 4 without polluting the Node.js API runtime.
