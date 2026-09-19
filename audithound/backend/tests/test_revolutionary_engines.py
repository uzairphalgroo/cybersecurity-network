"""Unit & integration tests for revolutionary enterprise security engines."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.engine.ingestion import IngestionEngine
from app.engine.compliance import ComplianceEngine
from app.engine.purple_team import PurpleTeamSimulator
from app.engine.temporal_drift import TemporalDriftEngine
from app.engine.ebpf_telemetry import EbpfPacketSynthesizer

client = TestClient(app)


def test_purple_team_simulator_execution():
    env = IngestionEngine.load_mock_environment_by_id("01_fintech_prod_banking")
    res = PurpleTeamSimulator.simulate_adversary_campaign(env, objective_type="exfiltrate_customer_pii")

    assert "adversary_profile" in res
    assert "blast_radius_summary" in res
    assert res["blast_radius_summary"]["total_cloud_nodes"] > 0
    assert 0 <= res["blast_radius_summary"]["compromise_probability_pct"] <= 100
    assert len(res["adversary_attack_chain"]) > 0
    assert "critical_cut_points" in res


def test_temporal_drift_engine():
    drift_data = TemporalDriftEngine.generate_drift_evolution("01_fintech_prod_banking")
    
    assert drift_data["environment_id"] == "01_fintech_prod_banking"
    assert len(drift_data["timeline"]) == 4
    assert drift_data["total_drift_score_delta"] != 0
    
    # Check baseline and drift epochs
    epochs = [e["epoch_id"] for e in drift_data["timeline"]]
    assert "T0" in epochs
    assert "T2" in epochs


def test_ebpf_telemetry_synthesizer():
    env = IngestionEngine.load_mock_environment_by_id("01_fintech_prod_banking")
    compliance_engine = ComplianceEngine()
    findings, _ = compliance_engine.evaluate_environment(env)

    packets = EbpfPacketSynthesizer.generate_stream("01_fintech_prod_banking", count=10)
    assert len(packets) == 10

    correlated = [
        EbpfPacketSynthesizer.correlate_packet_to_killchain(p, findings)
        for p in packets
    ]
    assert len(correlated) == 10
    assert any(c["threat_matched"] for c in correlated)


def test_advanced_api_purple_team_endpoint():
    response = client.post("/api/advanced/purple-team/simulate", json={
        "env_id": "01_fintech_prod_banking",
        "objective": "exfiltrate_customer_pii"
    })
    assert response.status_code == 200
    data = response.json()
    assert "blast_radius_summary" in data
    assert "adversary_attack_chain" in data


def test_advanced_api_drift_endpoint():
    response = client.get("/api/advanced/drift/timeline/01_fintech_prod_banking")
    assert response.status_code == 200
    data = response.json()
    assert len(data["timeline"]) == 4


def test_advanced_api_telemetry_endpoint():
    response = client.post("/api/advanced/telemetry/stream", json={
        "env_id": "01_fintech_prod_banking",
        "packet_count": 15
    })
    assert response.status_code == 200
    data = response.json()
    assert data["kernel_ebpf_version"] == "6.8.0-generic-ebpf-jit"
    assert len(data["telemetry_events"]) == 15


def test_advanced_api_zero_touch_dryrun():
    response = client.post("/api/advanced/remediation/zero-touch", json={
        "finding_ids": ["FND-001", "FND-002"],
        "mode": "dry_run",
        "cloud_provider": "aws"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "DRY_RUN_PASSED"
    assert "rollback_token" in data
    assert len(data["execution_steps"]) >= 4
