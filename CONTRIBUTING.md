# Contributing to CSHRK

## 1. Strict Sequential Phase Development Model

CSHRK is engineered sequentially. Each team member is assigned a specific phase.

| Phase | Focus Area | Owner | Prerequisites |
| :--- | :--- | :--- | :--- |
| **Phase 0** | Platform Foundation, Auth, PostGIS Schema, CI | All 5 Members | Clean Monorepo |
| **Phase 1** | Worker & Workforce Management, Skill Passport | Member 1 | Phase 0 Tagged & Pushed |
| **Phase 2** | Customer & Marketplace, Service Discovery | Member 2 | Phase 1 Tagged & Pushed |
| **Phase 3** | Cooperative & Federation Operations | Member 3 | Phase 2 Tagged & Pushed |
| **Phase 4** | Payments, Invoicing & AI Labour Intelligence | Member 4 | Phase 3 Tagged & Pushed |
| **Phase 5** | Operations, Trust, Verification & Auditing | Member 5 | Phase 4 Tagged & Pushed |
| **Phase Final** | Production Hardening, Load Testing & Polish | All 5 Members | Phase 5 Tagged & Pushed |

---

## 2. Git & Branching Rules

- Primary branches:
  - `main`: Production-ready releases only.
  - `develop`: Integration branch for active phase development.
- Feature branches:
  - Format: `feature/<phase-number>-<feature-name>` (e.g. `feature/p1-worker-skills`)
- Commit message convention (Conventional Commits):
  - `feat(worker): add skill verification endpoint`
  - `fix(auth): correct token expiry window`
  - `chore(repo): update dependencies`
  - `docs(api): document booking status transitions`
- **Strict prohibitions**:
  - Never force push (`git push --force`) to `main` or `develop`.
  - Never commit credentials, `.env` files, or private keys.
  - Never start work on Phase `N+1` before Phase `N` is officially handed over.

---

## 3. Handover Protocol

Before any phase is marked complete:
1. Run `npm run lint` across all packages.
2. Run `npm run type-check` across all packages.
3. Run `npm run test` across all packages.
4. Run `npm run build` to confirm compilation.
5. Create tag `PHASE-<N>-COMPLETE`.
6. Push develop branch and tag to GitHub.
