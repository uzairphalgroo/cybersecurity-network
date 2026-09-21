import math
import time
from typing import Dict, Any, List, Optional

class AnomalyEngine:
    """Core BGP Anomaly Detection Engine for RouterRat.
    Detects route flapping, AS-path length surges, and unauthorized ASN prefix hijacking.
    """

    def __init__(self, flap_threshold_per_min: int = 50, path_surge_multiplier: float = 2.0):
        self.flap_threshold_per_min = flap_threshold_per_min
        self.path_surge_multiplier = path_surge_multiplier

    def evaluate_prefix_hijack(self, announced_prefix: str, announced_origin_asn: int, expected_origin_asn: int) -> Dict[str, Any]:
        """Detect unauthorized origin ASN announcing a prefix (RPKI / ROA invalid state)."""
        is_hijack = (announced_origin_asn != expected_origin_asn)
        
        if is_hijack:
            severity = "CRITICAL"
            description = f"Unauthorized origin ASN announcement! Prefix {announced_prefix} announced by AS{announced_origin_asn} instead of authorized origin AS{expected_origin_asn}."
        else:
            severity = "NORMAL"
            description = f"Prefix {announced_prefix} correctly originated by authorized AS{expected_origin_asn}."

        return {
            "anomaly_type": "prefix_hijack",
            "detected": is_hijack,
            "severity": severity,
            "prefix": announced_prefix,
            "announced_origin_asn": announced_origin_asn,
            "expected_origin_asn": expected_origin_asn,
            "description": description,
            "timestamp": time.time()
        }

    def evaluate_path_surge(self, current_paths: List[List[int]], baseline_avg_length: float = 3.2, std_dev: float = 0.8) -> Dict[str, Any]:
        """Detect abnormal AS-path length expansion (surge/stretch)."""
        if not current_paths:
            return {"anomaly_type": "as_path_surge", "detected": False, "severity": "NORMAL", "description": "No paths available."}

        avg_current = sum(len(p) for p in current_paths) / len(current_paths)
        threshold = baseline_avg_length + (self.path_surge_multiplier * std_dev)
        is_surge = avg_current > threshold

        longest_path = max(current_paths, key=len)
        
        if is_surge:
            severity = "HIGH" if avg_current > baseline_avg_length * 2.5 else "WARNING"
            description = f"AS-Path surge detected: current average path length ({avg_current:.2f} hops) exceeds baseline threshold ({threshold:.2f} hops)."
        else:
            severity = "NORMAL"
            description = f"Path lengths within baseline limits (Avg: {avg_current:.2f} hops, Threshold: {threshold:.2f} hops)."

        return {
            "anomaly_type": "as_path_surge",
            "detected": is_surge,
            "severity": severity,
            "avg_current_length": round(avg_current, 2),
            "baseline_threshold": round(threshold, 2),
            "longest_path": longest_path,
            "description": description,
            "timestamp": time.time()
        }

    def evaluate_route_flapping(self, flap_events_in_window: int, window_minutes: float = 1.0) -> Dict[str, Any]:
        """Detect BGP route flap storms based on state update rate."""
        flaps_per_min = flap_events_in_window / max(0.1, window_minutes)
        is_flapping = flaps_per_min >= self.flap_threshold_per_min

        if is_flapping:
            severity = "CRITICAL" if flaps_per_min > 200 else "HIGH"
            description = f"Route Flap Storm detected: {flaps_per_min:.1f} state updates/min exceeds threshold of {self.flap_threshold_per_min}/min."
        else:
            severity = "NORMAL"
            description = f"Route flap rate normal ({flaps_per_min:.1f} updates/min)."

        return {
            "anomaly_type": "route_flapping",
            "detected": is_flapping,
            "severity": severity,
            "flaps_per_minute": round(flaps_per_min, 1),
            "threshold": self.flap_threshold_per_min,
            "description": description,
            "timestamp": time.time()
        }

    def run_full_scan(self, telemetry: Dict[str, Any], expected_origin: Optional[int] = None) -> List[Dict[str, Any]]:
        """Run all anomaly detection checks against telemetry data."""
        results = []
        asn = telemetry.get("asn", 0)
        paths = telemetry.get("as_paths", [])
        sample_prefixes = telemetry.get("sample_prefixes", [])

        # 1. Path Surge check
        surge_res = self.evaluate_path_surge(paths)
        if surge_res["detected"]:
            surge_res["asn"] = asn
            results.append(surge_res)

        # 2. Prefix Hijack check
        target_prefix = sample_prefixes[0] if sample_prefixes else f"104.16.0.0/12"
        expected = expected_origin or asn
        # Simulate check
        hijack_res = self.evaluate_prefix_hijack(target_prefix, asn, expected)
        if hijack_res["detected"]:
            results.append(hijack_res)

        return results
