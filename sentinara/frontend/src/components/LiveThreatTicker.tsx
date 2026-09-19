import React, { useState, useEffect } from 'react';
import { Activity, Radio, Globe2 } from 'lucide-react';

const THREAT_FEED = [
  { id: '1', level: 'CRITICAL', text: 'CISA KEV Alert: AWS IAM PassRole escalation paths actively targeted by cryptojacking threat actors.' },
  { id: '2', level: 'HIGH', text: 'Kubernetes Advisory: Default ServiceAccount cluster-admin role bindings detected in unsegmented namespaces.' },
  { id: '3', level: 'CRITICAL', text: 'Data Leak Bulletin: Unauthenticated S3 bucket read ACLs exposed 4.2M records globally this week.' },
  { id: '4', level: 'HIGH', text: 'SOC2 Alert: Stale IAM access keys (>90 days) account for 68% of initial enterprise cloud perimeters breached.' },
  { id: '5', level: 'CRITICAL', text: 'Azure NSG Warning: Open inbound ports 3306/5432 to Internet being scanned 12,000x/hr via automated bots.' }
];

export const LiveThreatTicker: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % THREAT_FEED.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = THREAT_FEED[currentIdx];

  return (
    <div className="w-full border-y border-white/[0.06] bg-black/90 backdrop-blur-xl px-4 py-2 text-xs font-mono">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left Live Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <div className="flex items-center gap-1.5 font-black uppercase tracking-widest text-[10px] text-zinc-300">
            <Radio className="h-3 w-3 animate-pulse text-white" />
            <span>THREAT RADAR // LIVE</span>
          </div>
        </div>

        {/* Center Animated Threat News */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2 transition-all duration-500 transform truncate">
            <span
              className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase tracking-wider shrink-0 ${
                current.level === 'CRITICAL'
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-500/50'
                  : 'bg-zinc-850 text-zinc-300 border border-zinc-700'
              }`}
            >
              {current.level}
            </span>
            <span className="text-zinc-300 font-sans text-xs truncate font-medium">{current.text}</span>
          </div>
        </div>

        {/* Right Status Indicator */}
        <div className="hidden lg:flex items-center gap-4 text-[10px] text-zinc-400 font-mono shrink-0 uppercase tracking-wider">
          <div className="flex items-center gap-1.5 text-zinc-200">
            <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>SOC2/CIS: ACTIVE</span>
          </div>
          <div className="flex items-center gap-1 text-zinc-400">
            <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>ENGINE: AUTONOMOUS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
