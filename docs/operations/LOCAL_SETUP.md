# CSHRK Local Development Setup

## 1. Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- Python >= 3.11
- Docker Desktop

## 2. Quick Start (Single Script)
You can run the entire project with one single command:
```bash
npm run dev

# Or with database seed enabled
npm run dev -- --seed

# Or with mobile app dev servers included
npm run dev -- --seed --customer --worker
```

Or using PowerShell directly on Windows:
```powershell
.\start-all.ps1 -Seed -Customer -Worker
```

---

## 3. Manual Step-by-Step Procedure
```bash
# 1. Clone repository and checkout develop branch
git clone https://github.com/HarshitJain26-2/CSHRK.git
cd CSHRK
git checkout develop

# 2. Setup Environment Variables
cp .env.example .env

# 3. Start PostgreSQL + PostGIS via Docker
docker compose -f infrastructure/docker/docker-compose.yml up -d postgres

# 4. Install Monorepo Dependencies
npm install

# 5. Build Shared Packages
npm run build --workspace=@cshrk/types
npm run build --workspace=@cshrk/config
npm run build --workspace=@cshrk/validation

# 6. Run Database Migrations and Development Seed
npm run db:seed --workspace=@cshrk/api

# 7. Start Services Manually
# Terminal 1: Backend API
npm run start:api

# Terminal 2: Admin Web Portal
npm run start:admin

# Terminal 3: AI Service (FastAPI)
npm run start:ai
```

