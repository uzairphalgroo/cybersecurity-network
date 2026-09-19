"""Tests for Attack Path & Privilege Escalation Graph Engine."""
import pytest
from app.engine.ingestion import IngestionEngine
from app.engine.attack_paths import AttackPathEngine
from app.models.schemas import SeverityLevel


@pytest.fixture
def attack_engine():
    return AttackPathEngine()


def test_crypto_miner_attack_path_detection(attack_engine):
    """Test that PassRole privilege escalation attack path is correctly detected and mapped."""
    env = IngestionEngine.load_mock_environment_by_id("crypto_miner_breach_vector")
    graph_res = attack_engine.build_and_analyze_graph(env)
    assert graph_res.total_nodes > 0
    assert graph_res.total_edges > 0
    assert graph_res.critical_attack_chains_count > 0
    
    # Check that PassRole path is in attack_paths
    passrole_path = next((ap for ap in graph_res.attack_paths if "PassRole" in ap.title), None)
    assert passrole_path is not None
    assert passrole_path.severity == SeverityLevel.CRITICAL
    assert len(passrole_path.steps) >= 3


def test_shadow_it_ingress_attack_path(attack_engine):
    """Test that open ingress 0.0.0.0/0 on SSH and RDP are detected as attack chains."""
    env = IngestionEngine.load_mock_environment_by_id("shadow_it_dev_sandbox")
    graph_res = attack_engine.build_and_analyze_graph(env)
    ingress_paths = [ap for ap in graph_res.attack_paths if "Ingress" in ap.title]
    assert len(ingress_paths) > 0


def test_k8s_takeover_attack_path(attack_engine):
    """Test Kubernetes ServiceAccount cluster root takeover path."""
    env = IngestionEngine.load_mock_environment_by_id("k8s_cluster_takeover")
    graph_res = attack_engine.build_and_analyze_graph(env)
    k8s_path = next((ap for ap in graph_res.attack_paths if "Kubernetes" in ap.title), None)
    assert k8s_path is not None
    assert "Compromised Pod" in k8s_path.entry_point
