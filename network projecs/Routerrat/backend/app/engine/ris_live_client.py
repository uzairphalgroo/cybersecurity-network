import asyncio
import json
import websockets
import logging

logger = logging.getLogger(__name__)

class RISLiveClient:
    def __init__(self, callback):
        self.url = "wss://ris-live.ripe.net/v1/ws/"
        self.callback = callback
        self.running = False
        self.ws = None

    async def start(self):
        self.running = True
        while self.running:
            try:
                async with websockets.connect(self.url) as ws:
                    self.ws = ws
                    # Subscribe to BGP updates
                    subscribe_msg = {
                        "type": "ris_subscribe",
                        "data": {
                            "require": "announcements"
                        }
                    }
                    await ws.send(json.dumps(subscribe_msg))
                    logger.info("Connected to RIS Live and subscribed.")

                    while self.running:
                        message = await ws.recv()
                        data = json.loads(message)
                        if data.get("type") == "ris_message":
                            # Process and call callback
                            parsed = self._parse_message(data)
                            if parsed:
                                await self.callback(parsed)
            except Exception as e:
                logger.error(f"RIS Live connection error: {e}")
                if self.running:
                    await asyncio.sleep(5) # Reconnect delay

    def stop(self):
        self.running = False
        if self.ws:
            asyncio.create_task(self.ws.close())

    def _parse_message(self, data):
        """Extract meaningful telemetry from RIS Live message"""
        try:
            payload = data.get("data", {})
            announcements = payload.get("announcements", [])
            if not announcements:
                return None
                
            as_path = payload.get("path", [])
            if not as_path:
                return None
                
            origin_asn = as_path[-1]
            if origin_asn not in [13335, 15169, 6939, 54113, 3356, 17557, 812]:
                return None
                
            prefix = announcements[0].get("prefixes", [""])[0]
            
            # Formulate our telemetry object
            return {
                "asn": origin_asn,
                "prefix": prefix,
                "as_path": as_path,
                "timestamp": payload.get("timestamp")
            }
        except Exception:
            return None
