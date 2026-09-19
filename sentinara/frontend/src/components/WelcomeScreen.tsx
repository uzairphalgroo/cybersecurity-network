import React, { useState, useEffect, useRef } from 'react';
import { SentinaraLogo } from './SentinaraLogo';
import { ChevronDown, ShieldCheck } from 'lucide-react';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);

  // 3D Parallax Tilt with zero-React-render RAF update
  useEffect(() => {
    let rafId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetX = (e.clientX / innerWidth - 0.5) * 24;
      targetY = (e.clientY / innerHeight - 0.5) * -24;
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

  // Instant & smooth exit on click, key, touch swipe or scroll
  const handleTriggerExit = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 120);
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 3) {
        handleTriggerExit();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        handleTriggerExit();
      }
    };

    // Mobile touch gestures
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const delta = Math.abs(e.touches[0].clientY - touchStartY.current);
        if (delta > 15) {
          handleTriggerExit();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

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
      className={`fixed inset-0 z-50 bg-[#000000] cursor-pointer select-none flex flex-col items-center justify-between transition-all duration-500 ease-out overflow-y-auto overflow-x-hidden p-4 sm:p-8 ${
        isExiting 
          ? 'opacity-0 scale-105 blur-xl pointer-events-none' 
          : 'opacity-100 scale-100'
      }`}
    >
      {/* Monochromatic Cyber Geometry Grid Plane with 3D Perspective */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] will-change-transform"
        style={{
          transform: 'perspective(1000px) rotateX(calc(var(--mouse-y) * 0.25)) rotateY(calc(var(--mouse-x) * 0.25)) scale(1.05)',
        }}
      />

      {/* Top Status Badge */}
      <header className="relative z-10 pt-4 sm:pt-8 flex items-center gap-2 text-[9px] sm:text-[11px] font-mono tracking-[0.2em] sm:tracking-[0.35em] uppercase text-zinc-400 text-center max-w-full">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
        <span className="truncate">SENTINARA &bull; AUTONOMOUS CLOUD SENTINEL</span>
      </header>

      {/* Center 3D Holographic Showcase */}
      <main className="relative z-10 flex flex-col items-center text-center my-auto py-6 px-2 w-full max-w-4xl mx-auto">
        {/* Grand 3D Tilt Emblem */}
        <div
          className="relative mb-6 sm:mb-8 will-change-transform"
          style={{
            transform: 'perspective(1000px) rotateX(var(--mouse-y)) rotateY(var(--mouse-x)) translateZ(30px)',
          }}
        >
          {/* Subtle Outer Glowing Halo Ring */}
          <div className="absolute -inset-8 sm:-inset-12 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-2xl sm:blur-3xl opacity-70 animate-pulse pointer-events-none" />
          
          <SentinaraLogo size="hero" showText={false} animated={true} />
        </div>

        {/* Brand Typography with Fluid Sizing and Safe Margins */}
        <div 
          className="space-y-3 sm:space-y-4 will-change-transform relative w-full px-2"
          style={{
            transform: 'perspective(1000px) rotateX(calc(var(--mouse-y) * 0.5)) rotateY(calc(var(--mouse-x) * 0.5)) translateZ(15px)',
          }}
        >
          {/* Ambient Outer Chromatic Gradient Glow Backdrop */}
          <div className="absolute -inset-x-4 -inset-y-2 sm:-inset-x-8 sm:-inset-y-4 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-xl sm:blur-2xl opacity-60 rounded-full pointer-events-none animate-pulse" />

          {/* Responsive Brand Title */}
          <h1 className="relative text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-orbitron tracking-[0.12em] sm:tracking-[0.2em] md:tracking-[0.25em] leading-tight select-none text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.7)] break-words">
            <span className="bg-gradient-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(168,85,247,0.6)]">
              SENTINARA
            </span>
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs md:text-sm font-mono tracking-[0.18em] sm:tracking-[0.3em] text-zinc-300 uppercase">
            <span>AUTONOMOUS</span>
            <span className="text-cyan-400">&bull;</span>
            <span>ATTACK GRAPH</span>
            <span className="text-cyan-400">&bull;</span>
            <span>ZERO-TOUCH DEFENSE</span>
          </div>
        </div>
      </main>

      {/* Enter Button & Scroll / Tap Gesture */}
      <footer className="relative z-10 pb-6 sm:pb-10 flex flex-col items-center gap-3 sm:gap-4 w-full max-w-sm px-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleTriggerExit();
          }}
          className="w-full sm:w-auto btn-tech-primary px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-mono font-black tracking-wider sm:tracking-widest uppercase shadow-[0_0_30px_rgba(255,255,255,0.45)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer z-20"
        >
          <ShieldCheck className="h-4 w-4 text-cyan-300" />
          <span>ENTER COMMAND CENTER</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </button>

        <div className="flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-mono tracking-[0.15em] sm:tracking-[0.25em] text-zinc-400 uppercase text-center">
          <span>TAP ANYWHERE OR SWIPE TO ENTER</span>
        </div>
      </footer>
    </div>
  );
};
