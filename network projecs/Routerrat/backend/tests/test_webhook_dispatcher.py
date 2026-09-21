import pytest
from app.alert.webhook_dispatcher import WebhookDispatcher
from app.engine.blast_radius import BlastRadiusCalculator

def test_slack_payload_generation():
    dispatcher = WebhookDispatcher()
    blast_calc = BlastRadiusCalculator()
    
    incident = {
        "anomaly_type": "prefix_hijack",
        "severity": "CRITICAL",
        "description": "Unauthorized announcement of prefix 208.65.153.0/24 by AS17557."
    }
    blast = blast_calc.calculate("208.65.153.0/24", 17557, "prefix_hijack")
    
    slack_payload = dispatcher.build_slack_payload(incident, blast)
    assert "blocks" in slack_payload
    assert "text" in slack_payload
    assert "CRITICAL" in str(slack_payload)

def test_discord_payload_generation():
    dispatcher = WebhookDispatcher()
    blast_calc = BlastRadiusCalculator()
    
    incident = {
        "anomaly_type": "as_path_surge",
        "severity": "HIGH",
        "description": "AS path length surge detected."
    }
    blast = blast_calc.calculate("104.16.0.0/12", 13335, "as_path_surge")
    
    discord_payload = dispatcher.build_discord_payload(incident, blast)
    assert "embeds" in discord_payload
    assert len(discord_payload["embeds"]) == 1

def test_webhook_simulated_dispatch():
    dispatcher = WebhookDispatcher()
    blast_calc = BlastRadiusCalculator()
    incident = {"anomaly_type": "route_flapping", "severity": "HIGH"}
    blast = blast_calc.calculate("24.114.0.0/14", 812, "route_flapping")
    
    res = dispatcher.dispatch("simulated://local", "slack", incident, blast)
    assert res["status"] == "simulated_success"
    assert "payload" in res
