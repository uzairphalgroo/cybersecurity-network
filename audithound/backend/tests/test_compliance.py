"""Tests for Compliance and Rules Engine."""
import pytest
from app.engine.ingestion import IngestionEngine
from app.engine.compliance import ComplianceEngine
from app.models.schemas import SeverityLevel, ComplianceFramework


@pytest.fixture
def compliance_engine():
    return ComplianceEngine()


def test_fintech_banking_is_fully_compliant(compliance_engine):
    """The fintech environment should have a high score and 0 critical findings."""
    env = IngestionEngine.load_mock_environment_by_id("fintech_prod_banking")
    findings, score = compliance_engine.evaluate_environment(env)
    assert score.overall_score >= 90.0
    assert score.letter_grade in ["A", "A+"]
    assert score.severity_breakdown["CRITICAL"] == 0


def test_crypto_miner_has_critical_passrole_finding(compliance_engine):
    """The crypto miner breach environment must trigger PassRole privilege escalation finding."""
    env = IngestionEngine.load_mock_environment_by_id("crypto_miner_breach_vector")
    findings, score = compliance_engine.evaluate_environment(env)
    critical_findings = [f for f in findings if f.severity == SeverityLevel.CRITICAL]
    assert len(critical_findings) > 0
    assert any("PassRole" in f.title for f in critical_findings)


def test_leaky_health_datalake_compliance(compliance_engine):
    """The leaky health datalake environment must trigger S3 public exposure and missing encryption findings."""
    env = IngestionEngine.load_mock_environment_by_id("leaky_health_datalake")
    findings, score = compliance_engine.evaluate_environment(env)
    assert score.overall_score < 70.0
    assert any("Public Access" in f.title for f in findings)
    assert any("Server-Side Encryption" in f.title for f in findings)


def test_k8s_cluster_takeover_compliance(compliance_engine):
    """The Kubernetes environment must trigger the cluster-admin default binding finding."""
    env = IngestionEngine.load_mock_environment_by_id("k8s_cluster_takeover")
    findings, score = compliance_engine.evaluate_environment(env)
    assert any("cluster-admin" in f.title for f in findings)
    assert any(ComplianceFramework.CIS_K8S_V1_8 in f.frameworks for f in findings)
