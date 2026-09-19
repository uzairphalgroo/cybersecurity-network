"""Auditing and Compliance Posture endpoints."""
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Body
from app.engine.ingestion import IngestionEngine
from app.engine.compliance import ComplianceEngine
from app.engine.attack_paths import AttackPathEngine
from app.engine.remediation import RemediationEngine
from app.models.schemas import (
    CloudEnvironmentDump,
    AuditResponse,
    PostureScore,
    PermissionGraphResponse
)
from app.routers.environments import validate_env_id

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/audit", tags=["Audit"])

compliance_engine = ComplianceEngine()
attack_engine = AttackPathEngine()


def _perform_full_audit(env: CloudEnvironmentDump) -> AuditResponse:
    """Executes the complete compliance, attack path, and remediation pipeline."""
    findings, posture_score = compliance_engine.evaluate_environment(env)
    graph_data = attack_engine.build_and_analyze_graph(env)
    batch_remediation = RemediationEngine.generate_batch_remediations(findings)

    timestamp_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    # Generate executive summary narrative
    exec_summary = (
        f"Audit completed for environment '{env.name}' ({env.cloud_provider.value}). "
        f"Overall Posture Score is {posture_score.overall_score}/100 (Grade {posture_score.letter_grade}, {posture_score.risk_rating} Risk). "
        f"Identified {len(findings)} total findings ({posture_score.severity_breakdown['CRITICAL']} Critical, {posture_score.severity_breakdown['HIGH']} High) "
        f"and {graph_data.critical_attack_chains_count} critical privilege escalation chains. "
        f"{batch_remediation.total_patches} automated Terraform remediation patches are ready for deployment."
    )

    return AuditResponse(
        environment_id=env.id,
        environment_name=env.name,
        provider=env.cloud_provider,
        timestamp=timestamp_str,
        posture_score=posture_score,
        findings=findings,
        graph_data=graph_data,
        remediation_patches=batch_remediation.patches,
        executive_summary=exec_summary
    )


@router.get("/{env_id}", response_model=AuditResponse)
def audit_environment_by_id(env_id: str):
    """Executes an autonomous audit against a preloaded mock environment."""
    safe_env_id = validate_env_id(env_id)
    try:
        env = IngestionEngine.load_mock_environment_by_id(safe_env_id)
        return _perform_full_audit(env)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Environment '{safe_env_id}' not found.")
    except Exception as e:
        logger.error(f"Audit execution error for '{safe_env_id}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while executing the security audit.")


@router.post("/custom", response_model=AuditResponse)
def audit_custom_environment(env_dump: CloudEnvironmentDump = Body(...)):
    """Executes an autonomous audit against an uploaded custom synthetic cloud configuration."""
    try:
        return _perform_full_audit(env_dump)
    except Exception as e:
        logger.error(f"Audit execution error for custom environment: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while executing the custom security audit.")
