import json
import os
import asyncio
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

logger = logging.getLogger("routerrat.main")

from app.collector.bgp_collector import BGPCollector, KNOWN_ASNS
from app.engine.anomaly_engine import AnomalyEngine
from app.engine.traceroute_engine import TracerouteEngine
from app.engine.blast_radius import BlastRadiusCalculator
from app.alert.webhook_dispatcher import WebhookDispatcher
from app.engine.ris_live_client import RISLiveClient
from contextlib import asynccontextmanager

# Global State
active_websockets: List[WebSocket] = []
ris_client = None

async def handle_ris_live_message(data):
    # Broadcast to all connected clients
    if not active_websockets:
        return
        
    # We map RIS live data to our telemetry structure
    # For now, let's just forward it as an anomaly or live feed
    # Actually, we can run anomaly engine on it!
    # But it's just raw prefix announcements.
    # Let's just broadcast it.
    payload = {
        "type": "ris_live_update",
        "asn": data.get("asn"),
        "telemetry": data
    }
    
    dead_sockets = []
    for ws in active_websockets:
        try:
            await ws.send_text(json.dumps(payload))
        except Exception:
            dead_sockets.append(ws)
            
    for ws in dead_sockets:
        active_websockets.remove(ws)

@asynccontextmanager
async def lifespan(app: FastAPI):
    global ris_client
    ris_client = RISLiveClient(handle_ris_live_message)
    asyncio.create_task(ris_client.start())
    yield
    ris_client.stop()

app = FastAPI(
    title="RouterRat Telemetry & Anomaly Engine API",
    description="Enterprise Network Telemetry, BGP Anomaly Detection, Traceroute Hop Comparison, and Blast Radius Triage.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core singletons
collector = BGPCollector()
anomaly_engine = AnomalyEngine()
traceroute_engine = TracerouteEngine()
blast_calculator = BlastRadiusCalculator()
webhook_dispatcher = WebhookDispatcher()

# Load fixtures
FIXTURES_PATH = os.path.join(os.path.dirname(__file__), "fixtures", "outage_fixtures.json")
try:
    with open(FIXTURES_PATH, "r") as f:
        OUTAGE_FIXTURES = json.load(f)
except Exception:
    OUTAGE_FIXTURES = {}

# Request schemas
class TracerouteRequest(BaseModel):
    target_prefix: str = "104.16.0.0/12"
    simulate_anomaly: bool = False

class BlastRadiusRequest(BaseModel):
    affected_prefix: str = "104.16.0.0/12"
    culprit_asn: int = 13335
    anomaly_type: str = "prefix_hijack"

class WebhookTestRequest(BaseModel):
    webhook_url: Optional[str] = "http://example.com/webhook"
    platform: str = "slack"  # "slack" or "discord"
    incident: Optional[Dict[str, Any]] = None
    blast_radius: Optional[Dict[str, Any]] = None

@app.get("/api/health")
def health_check():
    return {"status": "online", "system": "RouterRat Telemetry Engine", "version": "1.0.0"}

@app.get("/api/asns")
def get_supported_asns():
    return collector.get_supported_asns()

@app.get("/api/telemetry/{asn}")
def get_telemetry(asn: int):
    if asn not in KNOWN_ASNS:
        # Support dynamic ASNs too
        pass
    telemetry = collector.fetch_asn_telemetry(asn)
    anomalies = anomaly_engine.run_full_scan(telemetry)
    return {
        "telemetry": telemetry,
        "anomalies": anomalies
    }

@app.post("/api/traceroute")
def run_traceroute(req: TracerouteRequest):
    return traceroute_engine.run_traceroute_simulation(req.target_prefix, req.simulate_anomaly)

@app.post("/api/blast-radius")
def calculate_blast_radius(req: BlastRadiusRequest):
    return blast_calculator.calculate(req.affected_prefix, req.culprit_asn, req.anomaly_type)

@app.post("/api/webhook/test")
def test_webhook(req: WebhookTestRequest):
    incident = req.incident or {
        "anomaly_type": "prefix_hijack",
        "severity": "CRITICAL",
        "description": "Unauthorized origin announcement detected by RouterRat engine."
    }
    blast = req.blast_radius or blast_calculator.calculate("208.65.153.0/24", 17557, "prefix_hijack")
    return webhook_dispatcher.dispatch(req.webhook_url or "simulated://local", req.platform, incident, blast)

@app.get("/api/fixtures")
def get_fixtures():
    return OUTAGE_FIXTURES

@app.post("/api/fixtures/trigger/{fixture_key}")
def trigger_fixture(fixture_key: str):
    if fixture_key not in OUTAGE_FIXTURES:
        raise HTTPException(status_code=404, detail="Fixture key not found")
    
    fixture = OUTAGE_FIXTURES[fixture_key]
    blast = blast_calculator.calculate(
        fixture.get("prefix", "104.16.0.0/12"),
        fixture.get("announced_origin_asn", 13335),
        fixture.get("anomaly_type", "prefix_hijack")
    )
    
    slack_payload = webhook_dispatcher.build_slack_payload(fixture, blast)
    discord_payload = webhook_dispatcher.build_discord_payload(fixture, blast)

    return {
        "status": "triggered",
        "fixture": fixture,
        "blast_radius": blast,
        "webhook_payloads": {
            "slack": slack_payload,
            "discord": discord_payload
        }
    }

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    asns = [13335, 15169, 6939, 54113, 812]
    try:
        while True:
            # We still keep the mock telemetry loop, but real RIS live data is pushed via the callback
            target_asn = asns[int(asyncio.get_event_loop().time()) % len(asns)]
            telemetry = collector.fetch_asn_telemetry(target_asn)
            anomalies = anomaly_engine.run_full_scan(telemetry)
            
            payload = {
                "type": "telemetry_update",
                "asn": target_asn,
                "telemetry": telemetry,
                "anomalies": anomalies
            }
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(4.0)
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
        if websocket in active_websockets:
            active_websockets.remove(websocket)
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        if websocket in active_websockets:
            active_websockets.remove(websocket)
