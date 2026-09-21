import time
import random
import logging
from typing import Dict, Any, List
from app.collector.ripe_client import RIPEstatClient

logger = logging.getLogger("routerrat.bgp_collector")

KNOWN_ASNS = {
    13335: {"name": "Cloudflare Inc.", "type": "CDN / Security", "default_prefix": "104.16.0.0/12"},
    15169: {"name": "Google LLC", "type": "Hyperscale / Search", "default_prefix": "8.8.8.0/24"},
    6939: {"name": "Hurricane Electric", "type": "Tier-1 Backbone", "default_prefix": "216.218.0.0/16"},
    54113: {"name": "Fastly Inc.", "type": "Edge Cloud / CDN", "default_prefix": "151.101.0.0/16"},
    3356: {"name": "Lumen (Level 3)", "type": "Global Tier-1", "default_prefix": "4.0.0.0/8"},
    17557: {"name": "PTCL Telecom", "type": "Regional ISP", "default_prefix": "202.83.160.0/19"},
    812: {"name": "Rogers Communications", "type": "National ISP", "default_prefix": "24.114.0.0/14"}
}

ASN_COORDS = {
    13335: {"lat": 37.7749, "lon": -122.4194},  # San Francisco
    15169: {"lat": 37.4220, "lon": -122.0841},  # Mountain View
    6939: {"lat": 37.3382, "lon": -121.8863},   # San Jose
    54113: {"lat": 37.7749, "lon": -122.4194},  # San Francisco
    3356: {"lat": 39.7392, "lon": -104.9903},   # Denver
    17557: {"lat": 33.6844, "lon": 73.0479},    # Islamabad
    812: {"lat": 43.6532, "lon": -79.3832},     # Toronto
    2914: {"lat": 35.6762, "lon": 139.6503},    # Tokyo (NTT)
    701: {"lat": 38.9072, "lon": -77.0369},     # Washington DC (Verizon)
    1299: {"lat": 59.3293, "lon": 18.0686},     # Stockholm (Arelion)
    6453: {"lat": 48.8566, "lon": 2.3522},      # Paris (Tata)
    174: {"lat": 38.9072, "lon": -77.0369},     # Washington DC (Cogent)
    3257: {"lat": 50.1109, "lon": 8.6821},      # Frankfurt (GTT)
}

class BGPCollector:
    """Public BGP Telemetry Collector with real RIPEstat integration & adaptive mock fallback."""

    def __init__(self, timeout: float = 5.0):
        self.ripe_client = RIPEstatClient(timeout=timeout)

    def fetch_asn_telemetry(self, asn: int) -> Dict[str, Any]:
        """Collect live routing state, prefix announcements, and AS-paths for target ASN."""
        meta = KNOWN_ASNS.get(asn, {"name": f"AS{asn}", "type": "Autonomous System", "default_prefix": f"192.0.2.0/24"})
        
        # 1. Attempt RIPEstat API
        ripe_prefixes = self.ripe_client.get_announced_prefixes(asn)
        prefixes = ripe_prefixes.get("prefixes", [])
        
        target_prefix = prefixes[0] if prefixes else meta["default_prefix"]
        bgp_state = self.ripe_client.get_bgp_state(target_prefix)
        paths = bgp_state.get("paths", [])

        # If live API returns empty or errors, build structured fallback dataset based on real ASN topology
        if not paths:
            paths = self._generate_fallback_paths(asn)
        if not prefixes:
            prefixes = [meta["default_prefix"], f"198.51.100.0/24"]

        avg_path_length = round(sum(len(p) for p in paths) / max(1, len(paths)), 2)

        geo_paths = []
        for path in paths[:10]:
            geo_path = []
            for node in path:
                coords = ASN_COORDS.get(node)
                if not coords:
                    coords = {"lat": random.uniform(-60, 60), "lon": random.uniform(-180, 180)}
                geo_path.append({"asn": node, "lat": coords["lat"], "lon": coords["lon"]})
            geo_paths.append(geo_path)

        return {
            "asn": asn,
            "name": meta["name"],
            "type": meta["type"],
            "timestamp": time.time(),
            "prefix_count": len(prefixes),
            "sample_prefixes": prefixes[:8],
            "active_paths_count": len(paths),
            "avg_path_length": avg_path_length,
            "as_paths": paths[:10],
            "geo_paths": geo_paths,
            "data_source": "RIPEstat RIS" if bgp_state.get("status") == "success" and bgp_state.get("paths") else "Simulated/RIPEstat Fallback"
        }

    def _generate_fallback_paths(self, asn: int) -> List[List[int]]:
        """Generates realistic AS path sequences for an ASN based on tier-1 peering topology."""
        tier1 = [2914, 3356, 701, 1299, 6453]
        paths = []
        for _ in range(5):
            path_len = random.choice([2, 3, 4, 3, 3])
            path = [random.choice(tier1)]
            if path_len > 3:
                path.append(random.choice([6939, 174, 3257]))
            path.append(asn)
            paths.append(path)
        return paths

    def get_supported_asns(self) -> List[Dict[str, Any]]:
        """List supported ASNs with metadata."""
        return [{"asn": k, **v} for k, v in KNOWN_ASNS.items()]
