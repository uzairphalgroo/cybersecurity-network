import React, { useState } from 'react';
import { ShieldAlert, Activity, Cpu, Globe, Zap, Radio, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import useCyberAudio, { toggleGlobalMute, getGlobalMute } from '../hooks/useCyberAudio';

export default function Header({ selectedAsn, onSelectAsn, asns, wsConnected, onTriggerFixture, activeFixture, liveMode, setLiveMode }) {
  const { playHover, playClick } = useCyberAudio();
  const [isMuted, setIsMuted] = useState(getGlobalMute());
  
  return (
    <motion.header 
      className="glass-panel mb-8 sticky top-4 z-50 p-6 flex flex-col md:flex-row items-center justify-between gap-6"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
    >
      {/* Brand & Connection Status */}
      <div className="flex items-center gap-4 group">
        <motion.div 
          className="relative"
          whileHover={{ rotate: 90 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00f3ff] to-[#0066cc] p-[2px]">
            <div className="w-full h-full bg-[#02040a] rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <Globe className="w-6 h-6 text-[#00f3ff] z-10" />
              <div className="absolute inset-0 bg-[#00f3ff] opacity-10 animate-pulse"></div>
            </div>
          </div>
          {/* Status Dot */}
          <div className="absolute -top-1 -right-1">
            <span className="relative flex h-4 w-4">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${wsConnected ? 'bg-[#00f3ff]' : 'bg-[#ff0055]'}`}></span>
              <span className={`relative inline-flex rounded-full h-4 w-4 border-2 border-[#02040a] ${wsConnected ? 'bg-[#00f3ff]' : 'bg-[#ff0055]'}`}></span>
            </span>
          </div>
        </motion.div>
        
        <div>
          <h1 className="text-3xl font-syne font-bold tracking-tight uppercase text-white flex items-center gap-2">
            <motion.span
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              style={{
                backgroundSize: '200% auto',
                backgroundImage: 'linear-gradient(to right, #00f3ff, #ff00ff, #ff007f, #00f3ff)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              RouterRat
            </motion.span>
            <motion.div 
              className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-mono tracking-widest text-[#94a3b8]"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              v2.0 NOC
            </motion.div>
          </h1>
          <p className="text-sm font-mono text-[#94a3b8] flex items-center gap-2 mt-1">
            <Activity className="w-4 h-4 text-[#00f3ff]" />
            BGP Telemetry & Anomaly Detection
          </p>
        </div>
      </div>

      {/* Target Selector */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-xs text-[#94a3b8] font-mono tracking-widest uppercase mb-1">Target Network</span>
          <div className="relative">
            <select
              value={selectedAsn}
              onChange={(e) => onSelectAsn(Number(e.target.value))}
              className="appearance-none bg-[#080c16]/80 border border-white/10 text-white font-mono py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-[#00f3ff] focus:ring-1 focus:ring-[#00f3ff] transition-all"
            >
              <option value={13335}>Cloudflare (AS13335)</option>
              <option value={15169}>Google (AS15169)</option>
              <option value={16509}>AWS (AS16509)</option>
              <option value={8075}>Microsoft (AS8075)</option>
              <option value={32934}>Facebook (AS32934)</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#00f3ff]">
              ▼
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <motion.button
          onMouseEnter={playHover}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { playClick(); setLiveMode(!liveMode); }}
          className={`btn-glass ${liveMode ? 'border-[#00ff9d] bg-[#00ff9d]/10 text-[#00ff9d]' : 'text-[#94a3b8]'}`}
        >
          <Radio className={`w-4 h-4 ${liveMode ? 'animate-pulse' : ''}`} />
          {liveMode ? 'Live RIS Stream' : 'Live Mode Off'}
        </motion.button>
        <div className="w-[1px] h-8 bg-white/10 mx-2"></div>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMuted(toggleGlobalMute())}
          className={`btn-glass !px-3 ${isMuted ? 'text-[#ff0055]' : 'text-[#00f3ff]'}`}
          title="Toggle Sound"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </motion.button>
        <div className="w-[1px] h-8 bg-white/10 mx-2"></div>
        <motion.button 
          onMouseEnter={playHover}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { playClick(); onTriggerFixture('rogers_core_route_flap_2022'); }}
          className={`btn-glass ${activeFixture === 'rogers_core_route_flap_2022' ? 'border-[#00f3ff] bg-[#00f3ff]/10 text-[#00f3ff]' : ''}`}
        >
          <Zap className="w-4 h-4" /> Flap
        </motion.button>
        <motion.button 
          onMouseEnter={playHover}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { playClick(); onTriggerFixture('cloudflare_path_surge_2022'); }}
          className={`btn-glass ${activeFixture === 'cloudflare_path_surge_2022' ? 'border-[#ffb700] bg-[#ffb700]/10 text-[#ffb700]' : ''}`}
        >
          <Activity className="w-4 h-4" /> Surge
        </motion.button>
        <motion.button 
          onMouseEnter={playHover}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { playClick(); onTriggerFixture('pakistan_youtube_hijack_2008'); }}
          className={`btn-glass ${activeFixture === 'pakistan_youtube_hijack_2008' ? 'border-[#ff0055] bg-[#ff0055]/10 text-[#ff0055]' : ''}`}
        >
          <ShieldAlert className="w-4 h-4" /> Hijack
        </motion.button>
      </div>
    </motion.header>
  );
}
