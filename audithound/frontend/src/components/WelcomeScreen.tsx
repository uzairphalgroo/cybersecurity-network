import React, { useState, useEffect, useRef } from 'react';
import { AuditHoundLogo } from './AuditHoundLogo';
import { ChevronDown } from 'lucide-react';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D Parallax Tilt with zero-React-render RAF update
  useEffect(() => {
    let rafId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetX = (e.clientX / innerWidth - 0.5) * 28;
      targetY = (e.clientY / innerHeight - 0.5) * -28;
    };

    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${currentX.toFixed(2)}deg`);
        containerRef.current.style.setProperty('--mouse-y', `${currentY.toFixed(2)}deg`);
        containerRef.current.style.setProperty('--mouse-x-num', `${currentX.toFixed(2)}`);
        containerRef.current.style.setProperty('--mouse-y-num', `${currentY.toFixed(2)}`);
      }

      rafId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Smooth Fade-Out when scrolled or clicked
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 5) {
        handleTriggerExit();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        handleTriggerExit();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleTriggerExit = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 550);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleTriggerExit}
      style={{
        ['--mouse-x' as any]: '0deg',
        ['--mouse-y' as any]: '0deg',
        ['--mouse-x-num' as any]: '0',
        ['--mouse-y-num' as any]: '0',
      }}
      className={`fixed inset-0 z-50 bg-[#000000] cursor-pointer select-none flex flex-col items-center justify-between transition-all duration-500 ease-out overflow-hidden ${
        isExiting 
          ? 'opacity-0 scale-105 blur-xl pointer-events-none' 
          : 'opacity-100 scale-100'
      }`}
    >
      {/* Monochromatic Cyber Geometry Grid Plane with 3D Perspective */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] will-change-transform"
        style={{
          transform: 'perspective(1000px) rotateX(calc(var(--mouse-y) * 0.25)) rotateY(calc(var(--mouse-x) * 0.25)) scale(1.05)',
        }}
      />

      {/* Top Subtle Status Badge */}
      <header className="relative z-10 pt-10 flex items-center gap-2 text-[10px] font-mono tracking-[0.35em] uppercase text-zinc-500">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
        <span>SCUDERIA CYBERNETICA &bull; AUTONOMOUS SENTINEL</span>
      </header>

      {/* Center 3D Holographic Showcase */}
      <main className="relative z-10 flex flex-col items-center text-center my-auto px-4">
        {/* Grand 3D Tilt Emblem */}
        <div
          className="relative mb-10 will-change-transform"
          style={{
            transform: 'perspective(1000px) rotateX(var(--mouse-y)) rotateY(var(--mouse-x)) translateZ(50px) scale(1.15)',
          }}
        >
          {/* Subtle Outer Glowing Halo Ring */}
          <div className="absolute -inset-10 bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-pink-500/15 rounded-full blur-3xl opacity-70 animate-pulse pointer-events-none" />
          
          <AuditHoundLogo size="hero" showText={false} animated={true} />
        </div>

        {/* Brand Typography */}
        <div 
          className="space-y-4 will-change-transform relative"
          style={{
            transform: 'perspective(1000px) rotateX(calc(var(--mouse-y) * 0.5)) rotateY(calc(var(--mouse-x) * 0.5)) translateZ(25px)',
          }}
        >
          {/* Ambient Outer Chromatic Gradient Glow Backdrop */}
          <div className="absolute -inset-x-8 -inset-y-4 bg-gradient-to-r from-cyan-500/25 via-purple-500/25 to-pink-500/25 blur-2xl opacity-60 rounded-full pointer-events-none animate-pulse" />

          {/* Crisp Pure Solid White Title */}
          <h1 className="relative text-5xl sm:text-7xl md:text-8xl font-black font-orbitron tracking-[0.25em] leading-none select-none text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.7)]">
            <span className="drop-shadow-[0_0_35px_rgba(168,85,247,0.6)]">
              AUDITHOUND
            </span>
          </h1>

          <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-mono tracking-[0.35em] text-zinc-400 uppercase">
            <span>AUTONOMOUS</span>
            <span>&bull;</span>
            <span>INTELLIGENCE</span>
            <span>&bull;</span>
            <span>SECURITY</span>
          </div>
        </div>
      </main>

      {/* Ferrari-Style 3D Scroll & Gesture Indicator */}
      <footer className="relative z-10 pb-12 flex flex-col items-center gap-3">
        <div className="flex flex-col items-center gap-2 group">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.15)] group-hover:border-white transition-colors">
            <div className="w-1.5 h-2.5 rounded-full bg-white animate-bounce" />
          </div>
          <span className="text-[11px] font-mono tracking-[0.25em] text-zinc-400 uppercase group-hover:text-white transition-colors flex items-center gap-1.5">
            <span>SCROLL OR CLICK TO ENTER</span>
            <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
          </span>
        </div>
      </footer>
    </div>
  );
};
