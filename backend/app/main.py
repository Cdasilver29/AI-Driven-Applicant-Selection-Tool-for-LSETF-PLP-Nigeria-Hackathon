from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="LSETF AI Applicant Selection API",
    description="AI-powered platform for analyzing applicant data",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
try:
    from app.api import candidates, analytics, settings
    app.include_router(candidates.router, prefix="/api/candidates", tags=["candidates"])
    app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
    app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
except ImportError as e:
    logger.warning(f"Some API modules not available: {e}")

@app.get("/")
async def root():
    return {"message": "LSETF AI Applicant Selection API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)