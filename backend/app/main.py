import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.database import engine, Base
from backend.app.routers import auth, analysis, firstaid, hospitals, doctors, similar, assistant
from backend.seed_data import seed_database
from backend.seed_mongodb import seed_mongodb_full
from backend.app.mongodb import mongo_manager

# Initialize MongoDB & seed if needed
try:
    seed_mongodb_full(target_count=6500)
except Exception as e:
    print(f"MongoDB Seed notice: {e}")

# Create DB tables & seed initial data (SQLite fallback)
Base.metadata.create_all(bind=engine)
try:
    seed_database()
except Exception as e:
    print(f"Seed warning: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="BurnCare AI Medical Triage Dashboard API — Dual-Head CNN, Grad-CAM, Rule Engine & Emergency Guidance",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded media and generated heatmaps
os.makedirs(settings.MEDIA_DIR, exist_ok=True)
os.makedirs(settings.HEATMAP_DIR, exist_ok=True)
os.makedirs(settings.REPORTS_DIR, exist_ok=True)

app.mount("/media/uploads", StaticFiles(directory=settings.MEDIA_DIR), name="uploads")
app.mount("/media/heatmaps", StaticFiles(directory=settings.HEATMAP_DIR), name="heatmaps")

# Serve dataset processed images for similar case previews
processed_data_dir = os.path.join(settings.BASE_DIR, "data", "processed")
if os.path.exists(processed_data_dir):
    app.mount("/media/processed", StaticFiles(directory=processed_data_dir), name="processed")

# Register Routers
app.include_router(auth.router)
app.include_router(analysis.router)
app.include_router(firstaid.router)
app.include_router(hospitals.router)
app.include_router(doctors.router)
app.include_router(similar.router)
app.include_router(assistant.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "docs_url": "/docs",
        "openapi_url": "/openapi.json"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global exception occurred: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please contact medical system administrator."}
    )
