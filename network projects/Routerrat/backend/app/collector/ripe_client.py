import requests
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger("routerrat.ripe_client")

RIPESTAT_BASE_URL = "https://stat.ripe.net/data"

class RIPEstatClient:
    """Client for RIPEstat Public BGP Data API."""

    def __init__(self, timeout: float = 6.0):
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "RouterRat-TelemetryEngine/1.0 (Network Telemetry & Anomaly Detector)"
        })

    def get_announced_prefixes(self, asn: int) -> Dict[str, Any]:
        """Fetch announced IPv4/IPv6 prefixes for a given ASN from RIPEstat."""
        url = f"{RIPESTAT_BASE_URL}/announced-prefixes/data.json"
        params = {"resource": f"AS{asn}"}
        try:
            resp = self.session.get(url, params=params, timeout=self.timeout)
            resp.raise_for_status()
            data = resp.json()
            prefixes = data.get("data", {}).get("prefixes", [])
            return {
                "status": "success",
                "asn": asn,
                "count": len(prefixes),
                "prefixes": [p.get("prefix") for p in prefixes if p.get("prefix")]
            }
        except Exception as e:
            logger.warning(f"RIPEstat announced-prefixes request failed for AS{asn}: {e}")
            return {"status": "error", "asn": asn, "message": str(e), "prefixes": []}

    def get_bgp_state(self, resource: str) -> Dict[str, Any]:
        """Fetch current BGP routing state and AS-Paths from RIPEstat RIS looking glass nodes."""
        url = f"{RIPESTAT_BASE_URL}/bgp-state/data.json"
        params = {"resource": resource}
        try:
            resp = self.session.get(url, params=params, timeout=self.timeout)
            resp.raise_for_status()
            data = resp.json()
            bgp_state = data.get("data", {}).get("bgp_state", [])
            paths = []
            for entry in bgp_state:
                path = entry.get("path", [])
                if path:
                    paths.append(path)
            return {
                "status": "success",
                "resource": resource,
                "paths": paths,
                "raw_entries_count": len(bgp_state)
            }
        except Exception as e:
            logger.warning(f"RIPEstat bgp-state request failed for {resource}: {e}")
            return {"status": "error", "resource": resource, "message": str(e), "paths": []}

    def get_asn_neighbours(self, asn: int) -> Dict[str, Any]:
        """Fetch upstream and downstream BGP neighbours for an ASN."""
        url = f"{RIPESTAT_BASE_URL}/asn-neighbours/data.json"
        params = {"resource": f"AS{asn}"}
        try:
            resp = self.session.get(url, params=params, timeout=self.timeout)
            resp.raise_for_status()
            data = resp.json()
            neighbours = data.get("data", {}).get("neighbours", [])
            return {
                "status": "success",
                "asn": asn,
                "neighbours": neighbours
            }
        except Exception as e:
            logger.warning(f"RIPEstat asn-neighbours request failed for AS{asn}: {e}")
            return {"status": "error", "asn": asn, "message": str(e), "neighbours": []}
