import pytest
from app.collector.bgp_collector import BGPCollector, KNOWN_ASNS

def test_known_asns_list():
    collector = BGPCollector()
    asns = collector.get_supported_asns()
    assert len(asns) >= 5
    asn_ids = [item["asn"] for item in asns]
    assert 13335 in asn_ids
    assert 15169 in asn_ids

def test_fetch_asn_telemetry_cloudflare():
    collector = BGPCollector()
    telemetry = collector.fetch_asn_telemetry(13335)
    assert telemetry["asn"] == 13335
    assert telemetry["name"] == "Cloudflare Inc."
    assert "as_paths" in telemetry
    assert len(telemetry["as_paths"]) > 0
    assert "sample_prefixes" in telemetry
