import pytest
from app.engine.anomaly_engine import AnomalyEngine

def test_prefix_hijack_detection():
    engine = AnomalyEngine()
    # Test valid origin
    res_normal = engine.evaluate_prefix_hijack("104.16.0.0/12", 13335, 13335)
    assert res_normal["detected"] is False
    assert res_normal["severity"] == "NORMAL"

    # Test unauthorized hijack origin
    res_hijack = engine.evaluate_prefix_hijack("208.65.153.0/24", 17557, 36561)
    assert res_hijack["detected"] is True
    assert res_hijack["severity"] == "CRITICAL"
    assert "17557" in res_hijack["description"]

def test_as_path_surge_detection():
    engine = AnomalyEngine(path_surge_multiplier=2.0)
    # Baseline paths
    normal_paths = [[2914, 13335], [3356, 13335], [701, 13335]]
    res_normal = engine.evaluate_path_surge(normal_paths, baseline_avg_length=3.0, std_dev=0.5)
    assert res_normal["detected"] is False

    # Surge paths
    surge_paths = [[2914, 1299, 3356, 64512, 64513, 64514, 64515, 13335] for _ in range(5)]
    res_surge = engine.evaluate_path_surge(surge_paths, baseline_avg_length=3.0, std_dev=0.5)
    assert res_surge["detected"] is True
    assert res_surge["severity"] in ["HIGH", "CRITICAL", "WARNING"]

def test_route_flapping_detection():
    engine = AnomalyEngine(flap_threshold_per_min=50)
    res_normal = engine.evaluate_route_flapping(10, window_minutes=1.0)
    assert res_normal["detected"] is False

    res_flap = engine.evaluate_route_flapping(480, window_minutes=1.0)
    assert res_flap["detected"] is True
    assert res_flap["flaps_per_minute"] == 480.0
