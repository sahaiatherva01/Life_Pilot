import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.auth import router as auth_router
from backend.assistant import router as assistant_router
from backend.config import settings
from backend.db import init_db
from backend.planner import router as planner_router
from backend.reminders import router as reminders_router, start_scheduler
from backend.tasks import router as tasks_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("lifepilot")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting LifePilot backend...")
    try:
        await init_db()
        logger.info("Database tables verified/initialized.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")

    try:
        start_scheduler()
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")

    yield

    # Shutdown
    logger.info("LifePilot backend shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Personal AI Life OS: Routine Importer, Calendar, Alarms & Orion Assistant",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(planner_router)
app.include_router(reminders_router)
app.include_router(assistant_router)


@app.get("/api/health", tags=["system"])
async def health_check():
    """System health check and configuration summary."""
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "timezone": settings.TIMEZONE,
        "database": "connected",
        "assistant_model": settings.ORION_MODEL,
    }


@app.get("/", tags=["system"])
async def root():
    return {
        "message": "Welcome to LifePilot API — The Personal AI Life OS",
        "docs_url": "/docs",
        "health_url": "/api/health",
    }
