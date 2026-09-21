import pytest
from app.engine.traceroute_engine import TracerouteEngine

def test_traceroute_normal_baseline():
    engine = TracerouteEngine()
    res = engine.run_traceroute_simulation("104.16.0.0/12", simulate_anomaly=False)
    assert res["status"] == "MATCHES_BASELINE"
    assert res["has_unauthorized_transit"] is False
    assert len(res["actual_hops"]) == len(res["expected_hops"])

def test_traceroute_anomaly_simulation():
    engine = TracerouteEngine()
    res = engine.run_traceroute_simulation("104.16.0.0/12", simulate_anomaly=True)
    assert res["status"] == "ANOMALY_DETECTED"
    assert res["has_unauthorized_transit"] is True
    assert res["rogue_asn"] == 17557
    assert len(res["actual_hops"]) > len(res["expected_hops"])
