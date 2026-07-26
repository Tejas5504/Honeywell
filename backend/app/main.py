"""
FastAPI application entry point.
Configures CORS, middleware, routers, and database lifecycle.
"""
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import db_manager
from app.routers import dashboard, alerts, entities, generator, model, reports, soar, copilot


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle — connect/disconnect MongoDB."""
    await db_manager.connect()
    yield
    await db_manager.disconnect()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Enterprise AI-Powered Behavioral Anomaly Detection API for Cybersecurity",
    lifespan=lifespan,
)

# CORS middleware — allow all origins on Render for Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.CORS_ALLOW_ALL else settings.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add X-Process-Time header to every response."""
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}"
    return response


# Include all API routers
app.include_router(dashboard.router)
app.include_router(alerts.router)
app.include_router(entities.router)
app.include_router(generator.router)
app.include_router(model.router)
app.include_router(reports.router)
app.include_router(soar.router)
app.include_router(copilot.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "status": "running",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/health")
async def health_check():
    """Render health check endpoint."""
    return {"status": "healthy", "version": settings.APP_VERSION}
