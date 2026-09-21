"""Sentinara - Autonomous Cloud Security & Compliance Auditing Platform."""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import API_TITLE, API_VERSION, API_DESCRIPTION, CORS_ORIGINS
from app.routers import (
    environments_router,
    audit_router,
    remediation_router,
    reports_router,
    advanced_router
)

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("sentinara")

app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response


# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Register Sub-Routers
app.include_router(environments_router)
app.include_router(audit_router)
app.include_router(remediation_router)
app.include_router(reports_router)
app.include_router(advanced_router)


@app.get("/", tags=["Health"])
def health_check():
    """Returns the operational status of the Sentinara security engine."""
    return {
        "status": "online",
        "service": "Sentinara Security Auditing Engine",
        "version": API_VERSION,
        "frameworks_supported": [
            "SOC2 Common Criteria (CC6.1, CC6.3, CC6.6, CC6.7, CC6.8)",
            "CIS AWS Foundations Benchmark v3.0",
            "CIS Microsoft Azure Benchmark v2.0",
            "CIS Kubernetes Benchmark v1.8"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
