import math
from typing import Dict, Any, List

class BlastRadiusCalculator:
    """Calculates blast radius, estimated impacted IP count, downstream ASNs, and severity score."""

    @staticmethod
    def prefix_to_ip_count(prefix: str) -> int:
        """Calculate number of IP addresses in a CIDR prefix block."""
        try:
            mask = int(prefix.split('/')[1])
            return 2 ** (32 - mask)
        except Exception:
            return 256

    def calculate(self, affected_prefix: str, culprit_asn: int, anomaly_type: str, downstream_asns: List[int] = None) -> Dict[str, Any]:
        downstream_asns = downstream_asns or [2914, 3356, 1299, 701]
        ip_count = self.prefix_to_ip_count(affected_prefix)

        # Base blast score logic
        log_ips = math.log10(max(10, ip_count))
        
        type_multipliers = {
            "prefix_hijack": 1.0,
            "route_flapping": 0.85,
            "as_path_surge": 0.65,
            "route_leak": 0.75
        }

        multiplier = type_multipliers.get(anomaly_type, 0.5)
        raw_score = (log_ips / 9.6) * 100 * multiplier
        blast_score = round(min(100.0, max(5.0, raw_score)), 1)

        if blast_score >= 80:
            risk_level = "CRITICAL"
            tier1_impact = "GLOBAL_TIER1_DISRUPTION"
        elif blast_score >= 50:
            risk_level = "HIGH"
            tier1_impact = "REGIONAL_TRANSIT_DEGRADATION"
        elif blast_score >= 25:
            risk_level = "MEDIUM"
            tier1_impact = "LOCALIZED_LATENCY_SPIKE"
        else:
            risk_level = "LOW"
            tier1_impact = "MINIMAL_IMPACT"

        return {
            "affected_prefix": affected_prefix,
            "culprit_asn": culprit_asn,
            "anomaly_type": anomaly_type,
            "blast_score": blast_score,
            "risk_level": risk_level,
            "estimated_impacted_ips": ip_count,
            "affected_downstream_asns": downstream_asns,
            "tier1_impact_summary": tier1_impact,
            "affected_routes": int(max(1, ip_count / 256)),
            "reachability_drop": round(blast_score * 0.85, 1),
            "recommended_action": self._get_recommendation(risk_level, anomaly_type)
        }

    def _get_recommendation(self, risk_level: str, anomaly_type: str) -> str:
        if risk_level == "CRITICAL":
            return "IMMEDIATE: Issue RPKI ROA update, signal BGP Community 65535:666 (Blackhole) to upstream peers, contact NOC."
        elif risk_level == "HIGH":
            return "HIGH PRIORITY: Dampen flapping prefixes, filter sub-optimal AS-path announcements at ingress PE routers."
        else:
            return "MONITOR: Observe BGP convergence logs and verify traceroute hop stability."
