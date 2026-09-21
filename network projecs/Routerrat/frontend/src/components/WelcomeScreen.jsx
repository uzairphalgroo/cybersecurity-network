import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Globe2, ShieldAlert } from 'lucide-react';

export default function WelcomeScreen({ onEnter }) {
  const mountRef = useRef(null);
  const { scrollY } = useScroll();
  
  // Transform scroll position to opacity/scale for the text
  const textOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const textScale = useTransform(scrollY, [0, 200], [1, 1.5]);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger entrance when scrolled past 250px
      if (window.scrollY > 250) {
        onEnter();
        // Reset scroll position for the main dashboard immediately
        setTimeout(() => window.scrollTo(0, 0), 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onEnter]);

  // Three.js animation
  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.003);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 120;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Create the Cyberpunk Globe
    const geometry = new THREE.SphereGeometry(45, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-dark.jpg');
    
    const material = new THREE.MeshBasicMaterial({
      map: earthTexture,
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const globe = new THREE.Mesh(geometry, material);
    globe.rotation.y = -Math.PI / 2;
    scene.add(globe);

    // Glowing Wireframe Matrix
    const wireframeGeo = new THREE.IcosahedronGeometry(47, 3);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.15
    });
    const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(wireframeGeo), wireframeMat);
    scene.add(wireframe);

    // Particles
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 2000;
    const posArray = new Float32Array(particleCount * 3);
    for(let i = 0; i < particleCount; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 400;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 400;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 400;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 1.5,
      color: 0xff00ff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Rotate based on scroll + time
      const scrollRot = window.scrollY * 0.005;
      const timeRot = performance.now() * 0.0005;
      
      globe.rotation.y = -Math.PI / 2 + scrollRot + timeRot * 0.5;
      wireframe.rotation.y = scrollRot + timeRot * 0.5;
      wireframe.rotation.x = scrollRot * 0.5 + timeRot * 0.2;
      
      particlesMesh.rotation.y = scrollRot * 0.5 + timeRot * 0.2;
      particlesMesh.rotation.x = scrollRot * 0.2;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
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
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 1 } }}
      exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
      className="absolute top-0 left-0 w-full bg-[#02040a] z-[100]"
      style={{ height: '200vh' }} // Allow scrolling to trigger entrance
    >
      {/* 3D Canvas Background (Sticky so it stays visible while scrolling) */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <div ref={mountRef} className="absolute inset-0" />
        
        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
          <motion.div style={{ opacity: textOpacity, scale: textScale }} className="text-center flex flex-col items-center">
            
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative w-24 h-24 mb-8 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-[#00f3ff]/20 rounded-full blur-xl animate-pulse"></div>
              <Globe2 className="w-16 h-16 text-[#00f3ff] relative z-10" />
              <ShieldAlert className="w-6 h-6 text-[#ff0055] absolute bottom-0 right-0 z-20 drop-shadow-[0_0_10px_#ff0055]" />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="font-mono text-[#00f3ff] tracking-[0.5em] uppercase text-sm mb-4"
            >
              INITIALIZING SECURE UPLINK...
            </motion.div>

            <motion.h1 
              initial={{ y: 50, opacity: 0, filter: 'blur(10px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
              className="text-7xl md:text-9xl font-syne font-black text-white mb-4"
              style={{ textShadow: '0 0 30px rgba(0, 243, 255, 0.4)' }}
            >
              ROUTER RAT
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="font-mono text-[#94a3b8] tracking-[0.3em] uppercase text-sm md:text-base mb-24"
            >
              Global Threat Intelligence Network
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-[1px] h-24 bg-gradient-to-b from-[#00f3ff]/80 to-transparent animate-pulse" />
              <p className="font-mono text-[#ff0055] text-xs uppercase tracking-widest font-bold animate-bounce mt-2">
                Scroll to Initialize
              </p>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
