# ROUTERRAT - Core Concepts

## What is BGP?
The Border Gateway Protocol (BGP) is the postal service of the Internet. It is a protocol that manages how packets are routed across the internet through the exchange of routing and reachability information among edge routers.

## BGP Anomalies Visualized in RouterRat

### 1. Route Hijacking
Route hijacking (or BGP hijacking) occurs when a malicious or misconfigured network (Autonomous System) falsely advertises that it owns a specific IP prefix. 
* **Visualized As:** Glowing red paths bypassing the expected origin and connecting to a compromised, unexpected AS node.

### 2. Route Flapping
Route flapping occurs when a router alternately advertises a destination network via one route then another, or as unavailable and then available again, in quick sequence.
* **Visualized As:** The *Flap Chart Analytics* wave spiking, showing sudden immense changes in the AS-Path hop length over a short timeframe.

### 3. Path Surges (Route Leaks)
A route leak occurs when a route learned from a provider or peer is leaked to another provider or peer, causing traffic to be routed through a suboptimal or unintended path.
* **Visualized As:** An elongated AS-Path on the Topology Graph marked in warning yellow.

## The Global Mesh
The 3D Globe is not just a UI element. It parses live or simulated GeoJSON telemetry and projects Autonomous Systems (AS) onto their real-world geographical coordinates, demonstrating the physical traversal of internet traffic.
