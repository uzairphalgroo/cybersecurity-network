import React from 'react';

interface AuditHoundLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

export const AuditHoundLogo: React.FC<AuditHoundLogoProps> = ({
  size = 'md',
  showText = true,
  animated = true,
  className = '',
}) => {
  const sizeMap = {
    xs: { icon: 'h-6 w-6', text: 'text-sm', sub: 'text-[9px]' },
    sm: { icon: 'h-8 w-8', text: 'text-base', sub: 'text-[10px]' },
    md: { icon: 'h-10 w-10', text: 'text-lg', sub: 'text-[11px]' },
    lg: { icon: 'h-14 w-14', text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 'h-20 w-20', text: 'text-3xl', sub: 'text-sm' },
    hero: { icon: 'h-28 w-28 md:h-36 md:w-36', text: 'text-4xl md:text-5xl', sub: 'text-xs md:text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Sentinel Emblem Graphic */}
      <div className={`relative ${currentSize.icon} flex-shrink-0 group`}>
        {/* Ambient Halo Glow */}
        {animated && (
          <div className="absolute -inset-1 bg-gradient-to-r from-white/30 via-purple-500/20 to-cyan-500/30 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition duration-700 animate-pulse pointer-events-none" />
        )}

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full drop-shadow-[0_0_12px_rgba(255,255,255,0.25)] transition-transform duration-500 group-hover:scale-105"
        >
          <defs>
            {/* Dynamic Linear Gradients */}
            <linearGradient id="shieldFrameGrad" x1="14" y1="8" x2="86" y2="94" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#94A3B8" stopOpacity="0.4" />
              <stop offset="85%" stopColor="#38BDF8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#C084FC" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="facetSilver" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>

            <linearGradient id="facetDark" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E293B" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="houndCoreGrad" x1="36" y1="36" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#67E8F9" />
              <stop offset="70%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>

            <linearGradient id="irisRing" x1="42" y1="38" x2="58" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>

            <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Shield Base Plate */}
          <path
            d="M 50 6 L 88 20 L 88 52 C 88 77 50 94 50 94 C 50 94 12 77 12 52 L 12 20 Z"
            fill="url(#facetDark)"
            stroke="url(#shieldFrameGrad)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Internal Security Hex Mesh Grid */}
          <path
            d="M 50 14 L 80 25 L 80 50 C 80 70 50 86 50 86 C 50 86 20 70 20 50 L 20 25 Z"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
            strokeDasharray="2 3"
            fill="none"
          />

          {/* Left Sentinel Canine Ear */}
          <path
            d="M 28 18 L 43 32 L 28 37 Z"
            fill="url(#facetSilver)"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />

          {/* Right Sentinel Canine Ear */}
          <path
            d="M 72 18 L 72 37 L 57 32 Z"
            fill="url(#facetSilver)"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />

          {/* Crown Forehead Plate */}
          <path
            d="M 50 20 L 64 34 L 50 44 L 36 34 Z"
            fill="#0F172A"
            stroke="#E2E8F0"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Left Cheek Stealth Armor */}
          <path
            d="M 20 38 L 36 34 L 40 56 L 24 56 Z"
            fill="url(#facetDark)"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1"
            strokeLinejoin="round"
          />

          {/* Right Cheek Stealth Armor */}
          <path
            d="M 80 38 L 76 56 L 60 56 L 64 34 Z"
            fill="url(#facetDark)"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1"
            strokeLinejoin="round"
          />

          {/* Center Cyber Snout / Radar Bridge */}
          <path
            d="M 40 56 L 50 46 L 60 56 L 55 68 L 45 68 Z"
            fill="#090D16"
            stroke="url(#shieldFrameGrad)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Lower Cerberus Jaw Chevron */}
          <path
            d="M 33 60 L 50 80 L 67 60 L 59 66 L 50 74 L 41 66 Z"
            fill="url(#facetSilver)"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeLinejoin="round"
          />

          {/* Glowing Ocular Aperture Core */}
          <polygon
            points="50,38 57,45 50,52 43,45"
            fill="url(#houndCoreGrad)"
            filter="url(#coreGlow)"
          />

          {/* Radar Scanner Ring */}
          <circle
            cx="50"
            cy="45"
            r="3.5"
            fill="#FFFFFF"
            stroke="url(#irisRing)"
            strokeWidth="1.2"
          />

          {/* Micro Radar Crosshair Beacons */}
          <line x1="50" y1="34" x2="50" y2="36" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="50" y1="54" x2="50" y2="56" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="39" y1="45" x2="41" y2="45" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="59" y1="45" x2="61" y2="45" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Prestigious Typographic Lockup */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-[0.2em] font-orbitron text-white ${currentSize.text} leading-none`}>
              AUDIT<span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-200">HOUND</span>
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className={`text-zinc-500 font-mono tracking-wider font-semibold uppercase ${currentSize.sub} mt-0.5`}>
            AUTONOMOUS CYBER SENTINEL
          </span>
        </div>
      )}
    </div>
  );
};
