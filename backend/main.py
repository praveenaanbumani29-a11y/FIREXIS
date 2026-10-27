"""FIREXIS Backend Main Application Entrypoint."""
from pathlib import Path
# pyrefly: ignore[missing-import]
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.config.settings import settings
from backend.database.connection import engine, Base
from backend.database import models
from backend.api.routes_api import router as api_router

# Initialize database schema tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Professional fire safety planning, spatial graph analysis, and emergency evacuation simulation engine.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get(f"{settings.API_PREFIX}")
@app.get(f"{settings.API_PREFIX}/")
def api_info():
    return {
        "platform": "FIREXIS",
        "description": "Fire Exit Risk Evaluation and Intelligent Safety System",
        "status": "ONLINE",
        "api_docs": "/docs",
        "health": f"{settings.API_PREFIX}/health"
    }

# Frontend Static Assets & SPA Serving
FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/favicon.svg", include_in_schema=False)
    def favicon():
        fav = FRONTEND_DIST / "favicon.svg"
        if fav.exists():
            return FileResponse(str(fav))
        return Response(status_code=404)

    @app.get("/icons.svg", include_in_schema=False)
    def icons():
        icons_path = FRONTEND_DIST / "icons.svg"
        if icons_path.exists():
            return FileResponse(str(icons_path))
        return Response(status_code=404)

    @app.get("/", include_in_schema=False)
    def index():
        return FileResponse(str(FRONTEND_DIST / "index.html"))

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa_fallback(full_path: str):
        if (
            full_path.startswith("api")
            or full_path.startswith("docs")
            or full_path.startswith("redoc")
            or full_path.startswith("openapi.json")
        ):
            return Response(
                status_code=404,
                content='{"detail": "Not Found"}',
                media_type="application/json"
            )
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(FRONTEND_DIST / "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "platform": "FIREXIS",
            "description": "Fire Exit Risk Evaluation and Intelligent Safety System",
            "status": "ONLINE",
            "api_docs": "/docs",
            "health": f"{settings.API_PREFIX}/health"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
