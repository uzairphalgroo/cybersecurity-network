"""Integration tests for FastAPI endpoints."""
import json
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    """Verify health check returns online status and framework info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "SOC2 Common Criteria" in data["frameworks_supported"][0]


def test_list_environments_endpoint():
    """Verify endpoint lists all 10 mock environments."""
    response = client.get("/api/environments")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 10


def test_get_environment_by_id():
    """Verify retrieving a single environment's config."""
    response = client.get("/api/environments/fintech_prod_banking")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "fintech_prod_banking"
    assert len(data["iam_users"]) >= 1


def test_audit_environment_endpoint():
    """Verify full audit endpoint computes posture score, findings, graph, and patches."""
    response = client.get("/api/audit/crypto_miner_breach_vector")
    assert response.status_code == 200
    data = response.json()
    assert "posture_score" in data
    assert "findings" in data
    assert "graph_data" in data
    assert "remediation_patches" in data
    assert data["posture_score"]["overall_score"] < 80.0


def test_remediation_download_endpoint():
    """Verify downloading raw Terraform .tf bundle."""
    response = client.get("/api/remediation/download/shadow_it_dev_sandbox")
    assert response.status_code == 200
    assert "resource \"aws_security_group_rule\"" in response.text
    assert response.headers["content-type"].startswith("text/plain")


def test_report_html_endpoint():
    """Verify executive HTML report rendering."""
    response = client.get("/api/reports/html/leaky_health_datalake")
    assert response.status_code == 200
    assert "<!DOCTYPE html>" in response.text
    assert "AuditHound" in response.text


def test_upload_custom_environment_and_audit():
    """Verify uploading a custom JSON environment dump and running an audit on it."""
    sample_dump = {
        "environment_id": "test_custom_upload_01",
        "name": "Test Upload Cloud",
        "cloud_provider": "AWS",
        "iam_users": [
            {
                "user_name": "dev_attacker",
                "attached_policies": [
                    {
                        "policy_name": "PassRoleAdmin",
                        "policy_document": {
                            "Statement": [{"Effect": "Allow", "Action": "iam:PassRole", "Resource": "*"}]
                        }
                    }
                ]
            }
        ],
        "s3_buckets": [
            {
                "bucket_name": "open-test-bucket",
                "is_public": True,
                "encryption": {"enabled": False}
            }
        ],
        "security_groups": [
            {
                "group_id": "sg-open-ssh",
                "group_name": "open-ssh-sg",
                "vpc_id": "vpc-test",
                "ingress_rules": [
                    {"protocol": "tcp", "from_port": 22, "to_port": 22, "cidr_blocks": ["0.0.0.0/0"]}
                ]
            }
        ]
    }
    file_bytes = json.dumps(sample_dump).encode("utf-8")
    
    # Upload endpoint
    upload_res = client.post(
        "/api/environments/upload",
        files={"file": ("sample_dump.json", file_bytes, "application/json")}
    )
    assert upload_res.status_code == 200
    normalized_env = upload_res.json()
    assert normalized_env["id"] == "test_custom_upload_01"
    assert len(normalized_env["iam_users"]) == 1
    assert len(normalized_env["s3_buckets"]) == 1

    # Custom audit endpoint
    audit_res = client.post("/api/audit/custom", json=normalized_env)
    assert audit_res.status_code == 200
    audit_data = audit_res.json()
    assert audit_data["environment_id"] == "test_custom_upload_01"
    assert len(audit_data["findings"]) > 0
    assert len(audit_data["remediation_patches"]) > 0


def test_security_headers_present():
    """Verify standard security headers are returned on all responses."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.headers.get("x-content-type-options") == "nosniff"
    assert response.headers.get("x-frame-options") == "DENY"
    assert response.headers.get("x-xss-protection") == "1; mode=block"
    assert response.headers.get("referrer-policy") == "strict-origin-when-cross-origin"
    assert "geolocation=()" in response.headers.get("permissions-policy", "")


def test_invalid_env_id_path_traversal_rejected():
    """Verify path traversal or malformed env_id attempts return 400."""
    response = client.get("/api/environments/..%2F..%2Fsecret")
    assert response.status_code in [400, 404]

    response_audit = client.get("/api/audit/invalid;select*from;--")
    assert response_audit.status_code == 400


def test_oversized_upload_rejected():
    """Verify uploads exceeding 5MB are rejected."""
    oversized_data = b"0" * (6 * 1024 * 1024)
    response = client.post(
        "/api/environments/upload",
        files={"file": ("huge.json", oversized_data, "application/json")}
    )
    assert response.status_code in [400, 413]


def test_report_html_autoescapes_xss_payloads():
    """Verify that potentially malicious HTML in finding titles is autoescaped in reports."""
    from app.engine.reporter import ReporterEngine
    from app.models.schemas import (
        AuditResponse,
        PostureScore,
        Finding,
        SeverityLevel,
        CloudProvider,
        PermissionGraphResponse
    )

    malicious_finding = Finding(
        id="FIND-XSS-001",
        rule_id="RULE-XSS",
        title="<script>alert('pwned')</script>",
        description="<img src=x onerror=alert(1)>",
        severity=SeverityLevel.CRITICAL,
        provider=CloudProvider.AWS,
        frameworks=[],
        affected_resource_id="arn:aws:s3:::test<script>",
        affected_resource_type="AWS::S3::Bucket",
        risk_impact="<b onmouseover=alert(1)>Hover</b>",
        remediation_steps="Apply fix",
        remediation_terraform_id="tf-fix"
    )

    mock_audit = AuditResponse(
        environment_id="xss_test_env",
        environment_name="<script>alert('title')</script>",
        provider=CloudProvider.AWS,
        timestamp="2026-09-19 00:00:00 UTC",
        posture_score=PostureScore(
            overall_score=50.0,
            letter_grade="F",
            risk_rating="Critical",
            total_findings=1,
            severity_breakdown={"CRITICAL": 1, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFO": 0},
            framework_scores=[],
            top_risks=[]
        ),
        findings=[malicious_finding],
        graph_data=PermissionGraphResponse(
            nodes=[],
            edges=[],
            attack_paths=[],
            total_nodes=0,
            total_edges=0,
            critical_attack_chains_count=0
        ),
        remediation_patches=[],
        executive_summary="Summary"
    )

    html_out = ReporterEngine.generate_html_report(mock_audit)
    assert "<script>alert('pwned')</script>" not in html_out
    assert "&lt;script&gt;alert(&#39;pwned&#39;)&lt;/script&gt;" in html_out or "&lt;script&gt;" in html_out
