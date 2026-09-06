from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.health import router as health_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CSHRK AI Labour Intelligence Service Skeleton (Phase 0 Foundation)",
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

# Register Health Router under API prefix
app.include_router(health_router, prefix=settings.API_V1_STR, tags=["Health"])


@app.get("/")
def root():
    return {
        "service": "CSHRK AI Service",
        "status": "operational",
        "phase": "Phase 0 Foundation",
        "docs": "/docs",
    }
