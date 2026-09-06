# Phase 0 to Phase 1 Handover Protocol

## Welcome Member 1!
You are responsible for **Phase 1 — Worker & Workforce Management**.

### 1. What Phase 0 Has Built for You
- **Monorepo Structure**: Fully configured npm workspaces linking `@cshrk/types`, `@cshrk/config`, `@cshrk/validation`, and applications.
- **Worker Database Foundation**:
  - `WorkerEntity` in `services/api/src/database/entities/worker.entity.ts` with cooperative linkage, availability status, and PostGIS location.
  - `SkillEntity` and `WorkerSkillEntity` for skill verification.
  - Development seed account: `dev_worker@cshrk.local` (Password: `DevPass123!`).
- **Worker Mobile App**:
  - Skeleton located at `apps/worker-mobile`.
  - Configured with `AuthContext` enforcing `WORKER` role.
  - Dashboard placeholder pointing to Phase 1.
- **Centralized Authentication & RBAC**:
  - Backend `AuthService` and `RolesGuard` ready to protect worker endpoints.

### 2. How to Begin Phase 1
1. Pull the latest `develop` branch or checkout the `PHASE-0-COMPLETE` tag:
   ```bash
   git pull origin develop
   git checkout tags/PHASE-0-COMPLETE -b feature/phase-1-worker
   ```
2. Run `npm install` and verify existing tests:
   ```bash
   npm test --workspace=@cshrk/api
   ```
3. Begin building the Phase 1 features:
   - Worker onboarding & profile completion.
   - Skill Passport and certification verification endpoints.
   - Real-time availability management.
   - Job assignment acceptance flows.
