import time
import random
from typing import Dict, Any, List

HISTORICAL_BASELINES = {
    "104.16.0.0/12": {
        "target_name": "Cloudflare Edge",
        "expected_hops": [
            {"hop": 1, "ip": "192.168.1.1", "asn": 0, "name": "Local Gateway", "latency_ms": 1.2},
            {"hop": 2, "ip": "10.250.0.1", "asn": 7922, "name": "Comcast Edge", "latency_ms": 8.5},
            {"hop": 3, "ip": "68.86.85.1", "asn": 7922, "name": "Comcast Core", "latency_ms": 14.1},
            {"hop": 4, "ip": "172.70.240.1", "asn": 13335, "name": "Cloudflare IXP", "latency_ms": 16.8},
            {"hop": 5, "ip": "104.16.0.1", "asn": 13335, "name": "Cloudflare Edge", "latency_ms": 17.5}
        ]
    },
    "8.8.8.0/24": {
        "target_name": "Google Public DNS",
        "expected_hops": [
            {"hop": 1, "ip": "192.168.1.1", "asn": 0, "name": "Local Gateway", "latency_ms": 1.1},
            {"hop": 2, "ip": "72.14.215.1", "asn": 15169, "name": "Google Edge", "latency_ms": 9.4},
            {"hop": 3, "ip": "108.170.244.1", "asn": 15169, "name": "Google Core Backbone", "latency_ms": 12.0},
            {"hop": 4, "ip": "8.8.8.8", "asn": 15169, "name": "Google Primary DNS", "latency_ms": 13.2}
        ]
    }
}

class TracerouteEngine:
    """Simulates traceroutes and evaluates live hops against historical baselines."""

    def __init__(self):
        pass

    def run_traceroute_simulation(self, target_prefix: str, simulate_anomaly: bool = False) -> Dict[str, Any]:
        """Runs a simulated traceroute and compares with baseline."""
        baseline_data = HISTORICAL_BASELINES.get(
            target_prefix,
            HISTORICAL_BASELINES["104.16.0.0/12"]
        )

        expected_hops = baseline_data["expected_hops"]
        actual_hops = []
        has_detour = False
        rogue_asn = None

        if simulate_anomaly:
            has_detour = True
            rogue_asn = 17557  # PTCL Rogue Transit insertion
            actual_hops = [
                expected_hops[0],
                expected_hops[1],
                {"hop": 3, "ip": "202.83.160.5", "asn": 17557, "name": "Rogue Transit PTCL", "latency_ms": 142.5},
                {"hop": 4, "ip": "202.83.161.12", "asn": 17557, "name": "Unverified Middlebox", "latency_ms": 188.0},
                {"hop": 5, "ip": expected_hops[-2]["ip"], "asn": expected_hops[-2]["asn"], "name": expected_hops[-2]["name"], "latency_ms": 210.4},
                {"hop": 6, "ip": expected_hops[-1]["ip"], "asn": expected_hops[-1]["asn"], "name": expected_hops[-1]["name"], "latency_ms": 215.1}
            ]
        else:
            # Normal trace with slight jitter
            for h in expected_hops:
                jitter = random.uniform(-0.5, 1.2)
                h_copy = dict(h)
                h_copy["latency_ms"] = round(max(0.5, h_copy["latency_ms"] + jitter), 1)
                actual_hops.append(h_copy)

        # Compare baseline vs actual
        hop_diff = len(actual_hops) - len(expected_hops)
        max_latency_diff = max(a["latency_ms"] for a in actual_hops) - max(e["latency_ms"] for e in expected_hops)

        status = "ANOMALY_DETECTED" if (has_detour or hop_diff > 2 or max_latency_diff > 50) else "MATCHES_BASELINE"

        return {
            "target_prefix": target_prefix,
            "target_name": baseline_data["target_name"],
            "status": status,
            "timestamp": time.time(),
            "expected_hop_count": len(expected_hops),
            "actual_hop_count": len(actual_hops),
            "hop_difference": hop_diff,
            "latency_delta_ms": round(max_latency_diff, 1),
            "has_unauthorized_transit": has_detour,
            "rogue_asn": rogue_asn,
            "expected_hops": expected_hops,
            "actual_hops": actual_hops
        }
