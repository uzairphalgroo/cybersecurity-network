import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { motion } from 'framer-motion';

export default function Globe3D({ activeAsn, telemetryData }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const arcsGroupRef = useRef(null);
  const particlesRef = useRef(null);
  const wireframeMatRef = useRef(null);
  const controlsRef = useRef(null);
  const telemetryRef = useRef(telemetryData);
  const countryLabelsRef = useRef([]);

  useEffect(() => {
    telemetryRef.current = telemetryData;
  }, [telemetryData]);

  // Init Scene Once
  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x02040a, 0.002);
    
    const camera = new THREE.PerspectiveCamera(45, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 180;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    currentMount.appendChild(labelRenderer.domElement);
    
    // Attach labelRenderer to the mount ref object so we can use it in animation
    mountRef.current.labelRenderer = labelRenderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 80;
    controls.maxDistance = 400;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controlsRef.current = controls;

    // 1. Core Solid Sphere with Earth Texture
    const geometry = new THREE.SphereGeometry(60, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-dark.jpg');
    
    const material = new THREE.MeshBasicMaterial({
      map: earthTexture,
      color: 0x00f3ff, // Tint the map with a cyberpunk neon cyan!
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending // Makes the continents glow!
    });
    const globe = new THREE.Mesh(geometry, material);
    // Align texture's prime meridian with Three.js coordinate system
    globe.rotation.y = -Math.PI / 2;
    scene.add(globe);

    // 2. Glowing Wireframe (Network Grid)
    const wireframeGeo = new THREE.IcosahedronGeometry(62, 3);
    const wireframeMat = new THREE.LineBasicMaterial({ 
      color: 0x00f3ff, 
      transparent: true, 
      opacity: 0.15 
    });
    wireframeMatRef.current = wireframeMat;
    const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(wireframeGeo), wireframeMat);
    scene.add(wireframe);

    // 3. Particle Cloud (Data Nodes)
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 2000;
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);
    
    const colorCyan = new THREE.Color(0x00f3ff);
    const colorMagenta = new THREE.Color(0xff00ff);

    for(let i = 0; i < particleCount; i++) {
      const r = 65 + Math.random() * 20;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      posArray[i * 3] = x;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = z;
      
      const isMagenta = Math.random() > 0.7;
      const c = isMagenta ? colorMagenta : colorCyan;
      colorArray[i * 3] = c.r;
      colorArray[i * 3 + 1] = c.g;
      colorArray[i * 3 + 2] = c.b;
    }
    
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    const particlesMat = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    particlesRef.current = particlesMesh;
    scene.add(particlesMesh);

    // 4. Geographic Arcs Group
    const arcsGroup = new THREE.Group();
    arcsGroup.rotation.y = -Math.PI / 2;
    arcsGroupRef.current = arcsGroup;
    scene.add(arcsGroup);

    // 5. Geopolitical Borders Group
    const bordersGroup = new THREE.Group();
    bordersGroup.rotation.y = -Math.PI / 2;
    scene.add(bordersGroup);
    mountRef.current.bordersGroup = bordersGroup;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f3ff, 2, 200);
    pointLight.position.set(100, 100, 100);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0xff0055, 1, 200);
    pointLight2.position.set(-100, -100, 50);
    scene.add(pointLight2);

    let currentState = 'normal';
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const currentTelemetry = telemetryRef.current;
      const hasAnomaly = currentTelemetry?.as_path?.length > 4;
      const newState = hasAnomaly ? 'anomaly' : 'normal';

      if (newState !== currentState && wireframeMatRef.current && particlesRef.current) {
        currentState = newState;
        const colors = particlesRef.current.geometry.attributes.color;
        
        const colorCyan = new THREE.Color(0x00f3ff);
        const colorMagenta = new THREE.Color(0xff00ff);
        const colorGold = new THREE.Color(0xffb700);
        const colorCrimson = new THREE.Color(0xff0055);

        if (hasAnomaly) {
          wireframeMatRef.current.color.setHex(0xff0055);
          controls.autoRotateSpeed = 2.0;
          
          for(let i = 0; i < particleCount; i++) {
            const rand = Math.random();
            let c = colorCyan;
            if (rand > 0.4) c = colorCrimson;
            else if (rand > 0.2) c = colorGold;
            colors.setXYZ(i, c.r, c.g, c.b);
          }
        } else {
          wireframeMatRef.current.color.setHex(0x00f3ff);
          controls.autoRotateSpeed = 0.5;
          
          for(let i = 0; i < particleCount; i++) {
            const isMagenta = Math.random() > 0.7;
            const c = isMagenta ? colorMagenta : colorCyan;
            colors.setXYZ(i, c.r, c.g, c.b);
          }
        }
        colors.needsUpdate = true;
      }

      wireframe.rotation.y -= 0.001;
      wireframe.rotation.x += 0.0005;
      
      particlesMesh.rotation.y += 0.0005;

      // Spotlight Zoom-Based Country Labels
      const camPos = camera.position;
      const camDist = camPos.length();
      const isZoomed = camDist < 180;
      
      const worldPos = new THREE.Vector3();
      countryLabelsRef.current.forEach(label => {
        if (!isZoomed) {
          label.element.style.opacity = '0';
          return;
        }
        
        label.getWorldPosition(worldPos);
        const angle = worldPos.angleTo(camPos);
        
        // If the angle between the camera vector and label vector is small, it's in the center of the screen!
        if (angle < 0.35) { // roughly 20 degrees spotlight
          label.element.style.opacity = '1';
        } else {
          label.element.style.opacity = '0';
        }
      });

      controls.update();
      renderer.render(scene, camera);
      if (mountRef.current?.labelRenderer) {
        mountRef.current.labelRenderer.render(scene, camera);
      }
    };
    animate();

    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      wireframeGeo.dispose();
      wireframeMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      renderer.dispose();
      if (currentMount.labelRenderer && currentMount.contains(currentMount.labelRenderer.domElement)) {
        currentMount.removeChild(currentMount.labelRenderer.domElement);
      }
    };
  }, []); // Run once on mount

  // Update Arcs when telemetry changes
  useEffect(() => {
    if (!arcsGroupRef.current) return;
    const arcsGroup = arcsGroupRef.current;

    // Clear old arcs
    arcsGroup.children.forEach(arc => {
      if (arc.geometry) arc.geometry.dispose();
      if (arc.material) arc.material.dispose();
    });
    arcsGroup.clear();

    const latLongToVector3 = (lat, lon, radius) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = (radius * Math.sin(phi) * Math.sin(theta));
        const y = (radius * Math.cos(phi));
        return new THREE.Vector3(x, y, z);
    };

    const ASN_COORDS = {
      13335: { lat: 37.7749, lon: -122.4194, name: "US (CA)" },
      15169: { lat: 37.4220, lon: -122.0841, name: "US (CA)" },
      6939: { lat: 37.3382, lon: -121.8863, name: "US (CA)" },
      54113: { lat: 37.7749, lon: -122.4194, name: "US (CA)" },
      3356: { lat: 39.7392, lon: -104.9903, name: "US (CO)" },
      17557: { lat: 33.6844, lon: 73.0479, name: "Pakistan" },
      812: { lat: 43.6532, lon: -79.3832, name: "Canada (ON)" },
      2914: { lat: 35.6762, lon: 139.6503, name: "Japan" },
      701: { lat: 38.9072, lon: -77.0369, name: "US (VA)" },
      1299: { lat: 59.3293, lon: 18.0686, name: "Sweden" },
      6453: { lat: 48.8566, lon: 2.3522, name: "France" },
      174: { lat: 38.9072, lon: -77.0369, name: "US (VA)" },
      3257: { lat: 50.1109, lon: 8.6821, name: "Germany" }
    };

    let geoPaths = telemetryData?.geo_paths;
    
    if (!geoPaths && (telemetryData?.as_paths || telemetryData?.as_path)) {
      const pathsToUse = telemetryData.as_paths || [telemetryData.as_path];
      geoPaths = pathsToUse.map(pathArray => {
         if (!Array.isArray(pathArray)) return [];
         return pathArray.map(asn => {
           let coords = ASN_COORDS[asn];
           if (!coords) {
             const seed = asn * 12345;
             const lat = ((seed % 180) - 90);
             const lon = (((seed * 2) % 360) - 180);
             coords = { lat, lon, name: "Unknown" };
           }
           return { asn, lat: coords.lat, lon: coords.lon, name: coords.name };
         });
      }).filter(p => p.length > 0);
    }

    if (geoPaths && geoPaths.length > 0) {
        const hasAnomaly = telemetryData?.as_path?.length > 4;
        const arcColor = hasAnomaly ? 0xff0055 : 0xffb700;
        
        geoPaths.forEach(path => {
            for (let i = 0; i < path.length - 1; i++) {
                const start = path[i];
                const end = path[i+1];
                
                const startVec = latLongToVector3(start.lat, start.lon, 61);
                const endVec = latLongToVector3(end.lat, end.lon, 61);
                
                const distance = startVec.distanceTo(endVec);
                const midPoint = startVec.clone().add(endVec).multiplyScalar(0.5);
                midPoint.normalize().multiplyScalar(61 + distance * 0.4);
                
                const curve = new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec);
                const points = curve.getPoints(50);
                const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
                const arcMat = new THREE.LineBasicMaterial({
                    color: arcColor,
                    transparent: true,
                    opacity: 0.8
                });
                
                const arc = new THREE.Line(arcGeo, arcMat);
                arcsGroup.add(arc);

                // Add HUD Panels for all nodes in the path segment
                [start, end].forEach((node) => {
                  const labelDiv = document.createElement('div');
                  labelDiv.className = 'glass-panel p-2 text-xs font-mono !bg-[#02040a]/90 backdrop-blur border border-[#00f3ff]/50 rounded pointer-events-none mt-8'; // Added mt-8 to offset it from the dot
                  labelDiv.innerHTML = `
                    <div class="text-[#00f3ff] font-bold">AS${node.asn}</div>
                    <div class="text-white">${node.name}</div>
                    <div class="text-[#94a3b8] text-[10px] mt-1">[${node.lat.toFixed(2)}, ${node.lon.toFixed(2)}]</div>
                  `;
                  
                  const label = new CSS2DObject(labelDiv);
                  const nodeVec = latLongToVector3(node.lat, node.lon, 61);
                  label.position.copy(nodeVec);
                  arcsGroup.add(label);
                });
            }
            
            // Add Bliping Red Dots to the absolute Start and Destination of the entire path
            const pathStart = path[0];
            const pathDest = path[path.length - 1];
            
            [pathStart, pathDest].forEach((endpoint) => {
               const markerDiv = document.createElement('div');
               markerDiv.className = 'relative flex h-4 w-4 items-center justify-center pointer-events-none';
               markerDiv.innerHTML = `
                 <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff0055] opacity-75"></span>
                 <span class="relative inline-flex rounded-full h-2 w-2 bg-[#ff0055] border border-white"></span>
               `;
               const markerObj = new CSS2DObject(markerDiv);
               markerObj.position.copy(latLongToVector3(endpoint.lat, endpoint.lon, 61.5));
               arcsGroup.add(markerObj);
            });
        });
    }
  }, [telemetryData]);

  // Load GeoJSON for borders and state labels
  useEffect(() => {
    if (!mountRef.current?.bordersGroup) return;
    const bordersGroup = mountRef.current.bordersGroup;
    
    // Clean up if re-running
    bordersGroup.clear();
    countryLabelsRef.current = [];

    const latLongToVector3 = (lat, lon, radius) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = (radius * Math.sin(phi) * Math.sin(theta));
        const y = (radius * Math.cos(phi));
        return new THREE.Vector3(x, y, z);
    };

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.15
    });
    
    const usStateMaterial = new THREE.LineBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.1
    });

    const processGeoJSON = (data, material, isState) => {
      data.features.forEach(feature => {
        if (!feature.geometry) return;
        
        let polygons = [];
        if (feature.geometry.type === 'Polygon') polygons = [feature.geometry.coordinates];
        else if (feature.geometry.type === 'MultiPolygon') polygons = feature.geometry.coordinates;

        let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;

        polygons.forEach(polygon => {
          polygon.forEach(ring => {
            const points = [];
            ring.forEach(coord => {
              const [lon, lat] = coord;
              points.push(latLongToVector3(lat, lon, 60.1));
              
              minLat = Math.min(minLat, lat);
              maxLat = Math.max(maxLat, lat);
              minLon = Math.min(minLon, lon);
              maxLon = Math.max(maxLon, lon);
            });
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            bordersGroup.add(line);
          });
        });

        // Compute Centroid for Label
        const name = feature.properties?.name || feature.properties?.name_en || feature.properties?.name;
        if (name) {
           const centerLat = (minLat + maxLat) / 2;
           const centerLon = (minLon + maxLon) / 2;
           
           const labelDiv = document.createElement('div');
           labelDiv.className = `country-label font-mono text-[9px] ${isState ? 'text-[#ff00ff]' : 'text-[#00f3ff]/50'} uppercase tracking-widest pointer-events-none transition-opacity duration-300`;
           labelDiv.style.opacity = '0'; // Hidden by default
           labelDiv.textContent = name;
           
           const label = new CSS2DObject(labelDiv);
           label.position.copy(latLongToVector3(centerLat, centerLon, 60.5));
           bordersGroup.add(label);
           countryLabelsRef.current.push(label);
        }
      });
    };

    Promise.all([
      fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json').then(r => r.json()),
      fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json').then(r => r.json())
    ]).then(([countriesData, statesData]) => {
       processGeoJSON(countriesData, lineMaterial, false);
       processGeoJSON(statesData, usStateMaterial, true);
    }).catch(console.error);

  }, []);

  return (
    <motion.div 
      className="glass-panel p-0 h-[300px] lg:h-[400px] w-full overflow-hidden relative group"
      whileHover={{ boxShadow: "0 20px 50px -10px rgba(0,243,255,0.15)" }}
    >
      {/* Target Crosshair Decoration */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-30">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#00f3ff]/20"></div>
        <div className="absolute left-1/2 top-0 h-full w-[1px] bg-[#00f3ff]/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-[#00f3ff]/30 rounded-full"></div>
      </div>
      
      {/* Overlay Information */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none">
        <h3 className="font-syne font-bold text-lg text-white mb-1 tracking-wider uppercase">Global Mesh</h3>
        <p className="font-mono text-xs text-[#00f3ff] uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse"></span>
          Live Interconnects
        </p>
      </div>

      <div className="absolute bottom-6 right-6 z-20 text-right pointer-events-none">
        <div className="font-mono text-xl font-bold text-white">AS{activeAsn}</div>
        <div className="text-xs text-[#94a3b8] uppercase tracking-widest">Active Target Node</div>
      </div>

      <div ref={mountRef} className="w-full h-full cursor-move" />
    </motion.div>
  );
}
