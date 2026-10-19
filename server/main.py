from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.api import api_router
from server.config import settings
from server.db import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # For SQLite or quick testing, ensure base tables exist
    if "sqlite" in settings.database_url:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="LifePilot API",
    description="Backend engine and Orion AI runtime for LifePilot Life Operating System",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",  # Permissive for local development & Tailscale mesh
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "product": "LifePilot",
        "assistant": "Orion",
        "status": "operational",
        "docs": "/docs",
    }
