"""Remediation and Terraform patch generation endpoints."""
import logging
from fastapi import APIRouter, HTTPException, Response
from app.engine.ingestion import IngestionEngine
from app.engine.compliance import ComplianceEngine
from app.engine.remediation import RemediationEngine
from app.models.schemas import RemediationBatchResponse, TerraformPatch
from app.routers.environments import validate_env_id

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/remediation", tags=["Remediation"])

compliance_engine = ComplianceEngine()


@router.get("/environment/{env_id}", response_model=RemediationBatchResponse)
def get_environment_remediations(env_id: str):
    """Generates all Terraform patches for an audited environment."""
    safe_env_id = validate_env_id(env_id)
    try:
        env = IngestionEngine.load_mock_environment_by_id(safe_env_id)
        findings, _ = compliance_engine.evaluate_environment(env)
        return RemediationEngine.generate_batch_remediations(findings)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Environment '{safe_env_id}' not found.")
    except Exception as e:
        logger.error(f"Error generating remediations for '{safe_env_id}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate remediation patches.")


@router.get("/download/{env_id}")
def download_terraform_bundle(env_id: str):
    """Downloads combined Terraform .tf patch file for the given environment."""
    safe_env_id = validate_env_id(env_id)
    try:
        env = IngestionEngine.load_mock_environment_by_id(safe_env_id)
        findings, _ = compliance_engine.evaluate_environment(env)
        batch = RemediationEngine.generate_batch_remediations(findings)

        headers = {
            "Content-Disposition": f'attachment; filename="sentinara_remediation_{safe_env_id}.tf"'
        }
        return Response(content=batch.combined_terraform, media_type="text/plain", headers=headers)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Environment '{safe_env_id}' not found.")
    except Exception as e:
        logger.error(f"Error preparing Terraform bundle download for '{safe_env_id}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to prepare Terraform remediation bundle.")
