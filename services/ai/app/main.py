from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.health import router as health_router
from app.api.v1.models import router as models_router
from app.matching.router import router as matching_router
from app.forecasting.router import router as forecasting_router
from app.allocation.router import router as allocation_router
from app.skill_gap.router import router as skill_gap_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CSHRK AI Labour Intelligence Service (Phase 4 Production Intelligence)",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Health Router
app.include_router(health_router, prefix=settings.API_V1_STR, tags=["Health"])

# Register Phase 4 AI Intelligence Routers
ai_prefix = f"{settings.API_V1_STR}/ai"
app.include_router(matching_router, prefix=ai_prefix, tags=["Worker Matching"])
app.include_router(forecasting_router, prefix=ai_prefix, tags=["Demand Forecasting"])
app.include_router(allocation_router, prefix=ai_prefix, tags=["Workforce Allocation"])
app.include_router(skill_gap_router, prefix=ai_prefix, tags=["Skill Gap Intelligence"])
app.include_router(models_router, prefix=ai_prefix, tags=["Model Registry"])


@app.get("/")
def root():
    return {
        "service": "CSHRK AI Service",
        "status": "operational",
        "phase": "Phase 0 Foundation",
        "docs": "/docs",
    }

