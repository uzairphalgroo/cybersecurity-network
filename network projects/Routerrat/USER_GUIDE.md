# ROUTERRAT - User Guide

## Dashboard Navigation

### 1. Welcome Screen
When you first load the application, you will be greeted by the 3D secure uplink sequence. **Scroll down** to initialize the dashboard.

### 2. Live Mode vs Historical Fixtures
- **Live Mode Toggle:** Located in the top header. When active, RouterRat attempts to connect to real-world live BGP streams via WebSockets (e.g., RIPE RIS Live).
- **Target Network Dropdown:** If Live Mode is off, you can select historical simulated incidents from the dropdown (e.g., "Pakistan Telecom YouTube Hijack").

### 3. The Replay Engine (Playback Controls)
At the bottom of the screen, use the Playback Controls to scrub back and forth through a historical anomaly timeline. Watch as the 3D globe and topology graphs mutate to reflect the exact state of the network at that specific second.

### 4. Incident Queue & Blast Radius
On the left pane, the Incident Queue lists active threats.
- Click **Analyze Blast Radius** to open a detailed modal summarizing the scope of the incident.
- Click **Mitigate** to launch the Mitigation Terminal.

### 5. Mitigation Terminal
The Mitigation Terminal is an embedded CLI simulator. 
- Use the `help` command to see available mitigation tactics.
- Typical commands involve typing simulated Cisco/Juniper syntax to establish blackhole routes or null routes to stop hijacked traffic.
