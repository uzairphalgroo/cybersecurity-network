"""Tests for Ingestion Engine."""
import pytest
from app.engine.ingestion import IngestionEngine
from app.config import DATA_DIR


def test_list_mock_environments():
    """Verify all 10 mock environments are present and properly discovered."""
    envs = IngestionEngine.list_available_mock_environments()
    assert len(envs) == 10
    ids = [e["id"] for e in envs]
    assert "fintech_prod_banking" in ids
    assert "crypto_miner_breach_vector" in ids
    assert "leaky_health_datalake" in ids
    assert "k8s_cluster_takeover" in ids


def test_load_each_mock_environment():
    """Verify that every mock environment parses and validates strictly against Pydantic models."""
    envs = IngestionEngine.list_available_mock_environments()
    for item in envs:
        dump = IngestionEngine.load_mock_environment_by_id(item["id"])
        assert dump.id == item["id"]
        assert dump.name is not None
        assert dump.cloud_provider is not None


def test_load_nonexistent_environment():
    """Verify graceful handling for invalid environment IDs."""
    with pytest.raises(FileNotFoundError):
        IngestionEngine.load_mock_environment_by_id("non_existent_environment_999")
