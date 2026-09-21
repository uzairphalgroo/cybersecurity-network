import requests
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("routerrat.webhook_dispatcher")

class WebhookDispatcher:
    """Generates and dispatches diagnostic incident payloads for Slack and Discord."""

    @staticmethod
    def build_slack_payload(incident: Dict[str, Any], blast_radius: Dict[str, Any]) -> Dict[str, Any]:
        """Build a high-fidelity Slack Block Kit incident report payload."""
        severity = incident.get("severity", "HIGH")
        emoji = ":rotating_light:" if severity == "CRITICAL" else ":warning:"
        color = "#FF0055" if severity == "CRITICAL" else "#FFB700"

        return {
            "text": f"{emoji} *[RouterRat Alert] {incident.get('anomaly_type', 'BGP Anomaly').upper()} Detected*",
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"🚨 BGP Anomaly Alert: {incident.get('anomaly_type', 'INCIDENT').upper()}",
                        "emoji": True
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*Severity:* `{severity}`"},
                        {"type": "mrkdwn", "text": f"*Blast Radius Score:* `{blast_radius.get('blast_score', 0)} / 100`"},
                        {"type": "mrkdwn", "text": f"*Affected IP Prefix:* `{blast_radius.get('affected_prefix', 'N/A')}`"},
                        {"type": "mrkdwn", "text": f"*Culprit ASN:* `AS{blast_radius.get('culprit_asn', 'Unknown')}`"},
                        {"type": "mrkdwn", "text": f"*Impacted IPs:* `{blast_radius.get('estimated_impacted_ips', 0):,}`"},
                        {"type": "mrkdwn", "text": f"*Risk Level:* `{blast_radius.get('risk_level', 'UNKNOWN')}`"}
                    ]
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Diagnostic Summary:*\n{incident.get('description', 'BGP Routing anomaly detected by RouterRat engine.')}"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Recommended Mitigation:*\n```{blast_radius.get('recommended_action', 'Investigate BGP updates.')}```"
                    }
                }
            ]
        }

    @staticmethod
    def build_discord_payload(incident: Dict[str, Any], blast_radius: Dict[str, Any]) -> Dict[str, Any]:
        """Build a Discord Embed incident report payload."""
        severity = incident.get("severity", "HIGH")
        color = 0xFF0055 if severity == "CRITICAL" else 0xFFB700

        return {
            "username": "RouterRat Telemetry Bot",
            "avatar_url": "https://img.icons8.com/isometric/512/router.png",
            "embeds": [
                {
                    "title": f"⚡ BGP Incident Triage: {incident.get('anomaly_type', 'BGP Anomaly').upper()}",
                    "description": incident.get("description", "Network anomaly flagged by RouterRat real-time telemetry."),
                    "color": color,
                    "fields": [
                        {"name": "Affected Prefix", "value": f"`{blast_radius.get('affected_prefix', 'N/A')}`", "inline": True},
                        {"name": "Culprit ASN", "value": f"`AS{blast_radius.get('culprit_asn', 'Unknown')}`", "inline": True},
                        {"name": "Blast Radius", "value": f"`{blast_radius.get('blast_score', 0)} / 100` ({blast_radius.get('risk_level')})", "inline": True},
                        {"name": "Estimated Impacted IPs", "value": f"`{blast_radius.get('estimated_impacted_ips', 0):,}`", "inline": True},
                        {"name": "Recommended Action", "value": f"```{blast_radius.get('recommended_action')}```", "inline": False}
                    ],
                    "footer": {
                        "text": "RouterRat Enterprise Telemetry & Anomaly Engine • Live Alert"
                    }
                }
            ]
        }

    def dispatch(self, webhook_url: str, platform: str, incident: Dict[str, Any], blast_radius: Dict[str, Any]) -> Dict[str, Any]:
        """Dispatch formatted webhook payload to Slack or Discord."""
        if platform.lower() == "slack":
            payload = self.build_slack_payload(incident, blast_radius)
        else:
            payload = self.build_discord_payload(incident, blast_radius)

        if not webhook_url or webhook_url.startswith("http://example") or webhook_url.startswith("simulated://") or webhook_url == "test":
            # Simulation response for test/dry-run mode
            return {
                "status": "simulated_success",
                "platform": platform,
                "webhook_url": webhook_url or "simulated://local",
                "payload": payload
            }

        try:
            resp = requests.post(webhook_url, json=payload, timeout=5.0)
            resp.raise_for_status()
            return {
                "status": "dispatched",
                "http_code": resp.status_code,
                "platform": platform,
                "payload": payload
            }
        except Exception as e:
            logger.error(f"Failed to dispatch webhook to {platform}: {e}")
            return {
                "status": "error",
                "platform": platform,
                "error": str(e),
                "payload": payload
            }
