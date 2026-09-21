import React, { useMemo } from 'react';
import { Network, Server, ArrowRight, ShieldCheck, AlertTriangle, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopologyGraph({ telemetry, anomalies = [] }) {
  const pathData = useMemo(() => {
    if (!telemetry || !telemetry.as_path || telemetry.as_path.length === 0) return null;
    const path = telemetry.as_path;
    const origin = path[path.length - 1];
    
    // Check if there's a hijack anomaly affecting this path
    const hasHijack = anomalies.some(a => a.anomaly_type === 'prefix_hijack' && a.detected);
    const hasFlap = anomalies.some(a => a.anomaly_type === 'route_flap' && a.detected);
    const hasSurge = anomalies.some(a => a.anomaly_type === 'path_surge' && a.detected);
    
    return {
      path,
      origin,
      hasHijack,
      hasFlap,
      hasSurge
    };
  }, [telemetry, anomalies]);

  if (!pathData) {
    return (
      <div className="glass-panel p-6 h-[300px] lg:h-[400px] flex items-center justify-center flex-col text-[#475569]">
        <Network className="w-12 h-12 mb-4 opacity-50" />
        <p className="font-mono text-sm uppercase tracking-widest">Awaiting BGP Topology Data</p>
      </div>
    );
  }

  const { path, origin, hasHijack, hasFlap, hasSurge } = pathData;

  const getEdgeColor = () => {
    if (hasHijack) return 'border-[#ff0055] text-[#ff0055] shadow-[#ff0055]';
    if (hasFlap) return 'border-[#ffb700] text-[#ffb700] shadow-[#ffb700]';
    if (hasSurge) return 'border-[#ffb700] text-[#ffb700] shadow-[#ffb700]';
    return 'border-[#00f3ff]/30 text-[#00f3ff]/50 shadow-[#00f3ff]';
  };

  const getEdgeAnimation = () => {
    if (hasHijack) return 'animate-pulse';
    return '';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className={`glass-panel p-8 ${hasHijack ? '!border-[#ff0055] !shadow-[0_0_40px_rgba(255,0,85,0.15)]' : ''}`}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-syne font-bold flex items-center gap-2">
          <Network className="w-5 h-5 text-[#00f3ff]" />
          AS-Path Topology
        </h2>
        {hasHijack && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="badge-critical"
          >
            <AlertTriangle className="w-4 h-4" />
            Route Hijack Detected
          </motion.div>
        )}
      </div>

      <div className="relative">
        {/* Radar Sweep Background Effect */}
        <div className="radar-sweep"></div>
        
        <motion.div 
          className="flex flex-col lg:flex-row items-center gap-4 lg:gap-0"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {path.map((asn, index) => {
              const isOrigin = index === path.length - 1;
              const isPeer = index === 0;
              const isCompromised = hasHijack && isOrigin;
              
              return (
                <React.Fragment key={`${asn}-${index}`}>
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`relative z-10 w-full lg:w-40 flex flex-col items-center bg-[#080c16] rounded-xl border p-4 shadow-xl transition-all ${
                      isCompromised 
                        ? 'border-[#ff0055] shadow-[0_0_20px_rgba(255,0,85,0.3)]' 
                        : isOrigin
                          ? 'border-[#00f3ff] shadow-[0_0_20px_rgba(0,243,255,0.2)]'
                          : 'border-white/10'
                    }`}
                  >
                    {isCompromised ? (
                      <AlertTriangle className="w-8 h-8 text-[#ff0055] mb-3 animate-pulse" />
                    ) : isOrigin ? (
                      <Server className="w-8 h-8 text-[#00f3ff] mb-3" />
                    ) : (
                      <Radio className="w-8 h-8 text-white/40 mb-3" />
                    )}
                    
                    <span className="font-mono text-xl font-bold text-white mb-1">
                      AS{asn}
                    </span>
                    
                    <span className="text-xs font-mono text-[#94a3b8] uppercase tracking-wider text-center">
                      {isOrigin ? 'Origin' : isPeer ? 'Peer' : 'Transit'}
                    </span>

                    {/* Scanning Hover Line */}
                    <div className="absolute inset-0 border-2 border-transparent hover:border-[#00f3ff]/50 rounded-xl transition-colors pointer-events-none"></div>
                  </motion.div>

                  {/* Connecting Line (except for last item) */}
                  {index < path.length - 1 && (
                    <motion.div 
                      variants={itemVariants}
                      className="hidden lg:flex items-center justify-center flex-1 px-2"
                    >
                      <div className={`h-[2px] w-full border-t-2 border-dashed flex items-center justify-center relative ${getEdgeColor()} ${getEdgeAnimation()}`}>
                        <ArrowRight className={`absolute bg-[#02040a] px-1 ${hasHijack ? 'text-[#ff0055]' : 'text-[#00f3ff]/50'}`} />
                      </div>
                    </motion.div>
                  )}
                  {/* Mobile connecting line */}
                  {index < path.length - 1 && (
                    <motion.div variants={itemVariants} className="lg:hidden h-10 border-l-2 border-dashed flex items-center justify-center ${getEdgeColor()}"></motion.div>
                  )}
                </React.Fragment>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      <motion.div 
        className="mt-8 flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center gap-4 text-sm font-mono text-[#94a3b8]">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f3ff]"></span> Valid Path
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff0055] animate-pulse"></span> Hijacked Origin
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ffb700]"></span> Suboptimal Path
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono uppercase tracking-widest text-white/40 block mb-1">Path Length</span>
          <span className={`font-mono font-bold text-lg ${hasSurge ? 'text-[#ffb700]' : 'text-[#00f3ff]'}`}>
            {path.length} Hops
          </span>
        </div>
      </motion.div>
    </div>
  );
}
