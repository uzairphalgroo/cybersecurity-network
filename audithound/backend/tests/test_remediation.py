"""Tests for Auto-Remediation Engine."""
import pytest
from app.engine.ingestion import IngestionEngine
from app.engine.compliance import ComplianceEngine
from app.engine.remediation import RemediationEngine


def test_terraform_patch_generation():
    """Test generating Terraform patches for detected findings."""
    env = IngestionEngine.load_mock_environment_by_id("leaky_health_datalake")
    findings, _ = ComplianceEngine().evaluate_environment(env)
    
    assert len(findings) > 0
    batch = RemediationEngine.generate_batch_remediations(findings)
    assert batch.total_patches == len(findings)
    assert "resource \"aws_s3_bucket_public_access_block\"" in batch.combined_terraform
    assert "resource \"aws_s3_bucket_server_side_encryption_configuration\"" in batch.combined_terraform


def test_passrole_terraform_patch():
    """Test specific PassRole least privilege patch formatting."""
    env = IngestionEngine.load_mock_environment_by_id("crypto_miner_breach_vector")
    findings, _ = ComplianceEngine().evaluate_environment(env)
    passrole_finding = next(f for f in findings if "PASSROLE" in f.id or "PassRole" in f.title)
    
    patch = RemediationEngine.generate_patch_for_finding(passrole_finding)
    assert "aws_iam_policy" in patch.remediated_terraform_hcl
    assert "iam:PassedToService" in patch.remediated_terraform_hcl
    assert patch.file_name.endswith(".tf")
