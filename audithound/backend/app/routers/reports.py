"""Reporting endpoints - HTML and printable Executive Reports."""
import logging
from fastapi import APIRouter, HTTPException, Response
from app.engine.ingestion import IngestionEngine
from app.engine.reporter import ReporterEngine
from app.routers.audit import _perform_full_audit
from app.routers.environments import validate_env_id

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/html/{env_id}")
def get_executive_html_report(env_id: str):
    """Generates an executive-ready, printable HTML report for the audited environment."""
    safe_env_id = validate_env_id(env_id)
    try:
        env = IngestionEngine.load_mock_environment_by_id(safe_env_id)
        audit_res = _perform_full_audit(env)
        html_content = ReporterEngine.generate_html_report(audit_res)
        return Response(content=html_content, media_type="text/html")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Environment '{safe_env_id}' not found.")
    except Exception as e:
        logger.error(f"Report rendering error for '{safe_env_id}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to render executive audit report.")
