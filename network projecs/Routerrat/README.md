# ROUTERRAT - Global Threat Intelligence Network

![Welcome Screen](./demo1.png<img width="320" height="149" alt="download" src="https://github.com/user-attachments/assets/b3572033-9e0a-4e1b-b146-2c880ed99f58" />
)

![NOC Dashboard](./demo2.png<img width="320" height="149" alt="download" src="https://github.com/user-attachments/assets/e2d1fcf6-40ea-4546-886a-b0ebd12af565" />
)

## Overview
RouterRat is an advanced, open-source 3D Network Operations Center (NOC) dashboard designed for real-time Border Gateway Protocol (BGP) anomaly detection and global threat visualization. Built with a highly responsive, cyberpunk-inspired 3D interface, RouterRat maps the underlying fabric of the internet to visually expose Route Hijacks, Route Flapping, and Path Surges as they happen.

## Key Features
- **3D Geopolitical Threat Globe:** Real-time visualization of interconnected AS networks mapped accurately over political borders.
- **Holographic Path HUDs:** Dynamic topology graphs showing valid paths, suboptimal transits, and hijacked origins.
- **Incident Queue:** Real-time logging of critical BGP anomalies parsing live telemetry data.
- **Mitigation Terminal:** Embedded CLI allowing operators to simulate deploying BGP blackhole routes and null routing.
- **Flap Chart Analytics:** Monitor route stability over time to detect route flap storms.

## Quick Start
1. Ensure you have Node.js and Python 3.10+ installed.
2. Start the Backend API: `cd backend && pip install -r requirements.txt && python run_dev.py`
3. Start the Frontend Dashboard: `cd frontend && npm install && npm run dev`

## Legal Disclaimer
This project is for educational and network observability purposes only. The creators and maintainers of RouterRat are **NOT** responsible for any malicious misuse of this software. By using this tool, you agree to the `TERMS_OF_SERVICE.md` and acknowledge it is solely your responsibility to comply with local and international cyber laws.

## License
Open-sourced under the MIT License. See `LICENSE` for details.
