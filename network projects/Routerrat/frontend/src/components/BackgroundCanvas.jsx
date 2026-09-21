import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function BackgroundCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05020a, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // 2. 3D Elements that react to scroll
    const objectGroup = new THREE.Group();
    scene.add(objectGroup);

    // Create a scattered field of small glowing abstract shapes
    const geometry = new THREE.OctahedronGeometry(1.5, 0);
    const materialCyan = new THREE.MeshBasicMaterial({ 
      color: 0x00f3ff, wireframe: true, transparent: true, opacity: 0.15 
    });
    const materialMagenta = new THREE.MeshBasicMaterial({ 
      color: 0xff00ff, wireframe: true, transparent: true, opacity: 0.15 
    });

    const meshCount = 150;
    const meshes = [];

    for (let i = 0; i < meshCount; i++) {
      const isCyan = Math.random() > 0.5;
      const mesh = new THREE.Mesh(geometry, isCyan ? materialCyan : materialMagenta);
      
      // Spread widely across X, Y, Z
      mesh.position.x = (Math.random() - 0.5) * 300;
      mesh.position.y = (Math.random() - 0.5) * 300;
      mesh.position.z = (Math.random() - 0.5) * 200 - 50;
      
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      // Give each mesh a random rotation speed
      mesh.userData = {
        rx: (Math.random() - 0.5) * 0.02,
        ry: (Math.random() - 0.5) * 0.02
      };

      meshes.push(mesh);
      objectGroup.add(mesh);
    }

    // 3. Scroll Interaction
    let targetScrollY = 0;
    let currentScrollY = 0;

    const onScroll = () => {
      // Calculate a normalized scroll value
      targetScrollY = window.scrollY * 0.05;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // 4. Animation Loop
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Smooth interpolation for scroll reactivity (parallax effect)
      currentScrollY += (targetScrollY - currentScrollY) * 0.05;
      objectGroup.position.y = currentScrollY;

      // Gently rotate individual meshes
      meshes.forEach((mesh) => {
        mesh.rotation.x += mesh.userData.rx;
        mesh.rotation.y += mesh.userData.ry;
      });
      
      renderer.render(scene, camera);
    };

    animate();

    // 5. Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      materialCyan.dispose();
      materialMagenta.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: 'transparent'
      }}
    />
  );
}
