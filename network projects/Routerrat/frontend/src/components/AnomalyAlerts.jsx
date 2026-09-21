import React from 'react';
import { ShieldAlert, AlertTriangle, Info, Clock, Activity, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCyberAudio from '../hooks/useCyberAudio';

export default function AnomalyAlerts({ anomalies, telemetry, onOpenBlastRadius, onOpenMitigation }) {
  const { playAlert, playHover, playClick } = useCyberAudio();
  
  // Play alert sound when new anomalies appear
  React.useEffect(() => {
    if (anomalies && anomalies.length > 0) {
      playAlert();
    }
  }, [anomalies.length, playAlert]);
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="glass-panel p-6 h-full min-h-[300px] flex items-center justify-center flex-col text-[#475569]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <ShieldAlert className="w-16 h-16 mb-4 opacity-50" />
        </motion.div>
        <p className="font-mono text-sm uppercase tracking-widest">No Active Anomalies</p>
        <p className="text-xs mt-2 text-[#475569]/80 font-mono">BGP Topology Stable</p>
      </div>
    );
  }

  const getSeverityConfig = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return {
          icon: ShieldAlert,
          bg: 'bg-[#ff0055]/10',
          border: 'border-[#ff0055]/30',
          text: 'text-[#ff0055]',
          glow: 'shadow-[0_0_20px_rgba(255,0,85,0.2)]',
          badgeClass: 'badge-critical'
        };
      case 'high':
        return {
          icon: AlertTriangle,
          bg: 'bg-[#ffb700]/10',
          border: 'border-[#ffb700]/30',
          text: 'text-[#ffb700]',
          glow: 'shadow-[0_0_20px_rgba(255,183,0,0.15)]',
          badgeClass: 'badge-warning'
        };
      default:
        return {
          icon: Info,
          bg: 'bg-[#00f3ff]/10',
          border: 'border-[#00f3ff]/30',
          text: 'text-[#00f3ff]',
          glow: 'shadow-[0_0_20px_rgba(0,243,255,0.1)]',
          badgeClass: 'badge-normal'
        };
    }
  };

  const listVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30, height: 0, scale: 0.95 },
    show: { opacity: 1, x: 0, height: 'auto', scale: 1, transition: { type: "spring", stiffness: 120 } }
  };

  return (
    <div className="glass-panel p-4 md:p-6 h-[350px] lg:h-[450px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-syne font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#ffb700]" />
          Incident Queue
        </h2>
        <span className="px-3 py-1 bg-[#ff0055]/10 border border-[#ff0055]/30 rounded-full text-xs font-mono font-bold text-[#ff0055]">
          {anomalies.length} Active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <motion.div 
          className="space-y-4"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {anomalies.map((anomaly, idx) => {
              const config = getSeverityConfig(anomaly.severity);
              const Icon = config.icon;

              return (
                <motion.div
                  key={`${anomaly.anomaly_type}-${idx}`}
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.9, height: 0 }}
                  className={`p-4 rounded-xl border ${config.bg} ${config.border} ${config.glow} backdrop-blur-md relative overflow-hidden group`}
                >
                  {/* Subtle sweep animation for critical alerts */}
                  {anomaly.severity === 'critical' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff0055]/5 to-transparent -translate-x-full group-hover:animate-[scanline_2s_ease-in-out_infinite]" />
                  )}

                  <div className="flex items-start justify-between gap-4 relative z-10">
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg bg-black/40 ${config.text}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-syne font-bold text-white uppercase tracking-wide">
                            {anomaly.anomaly_type.replace('_', ' ')}
                          </h3>
                          <span className={config.badgeClass}>
                            {anomaly.severity}
                          </span>
                        </div>
                        <p className="text-sm font-mono text-[#94a3b8]">
                          {anomaly.description}
                        </p>
                        
                        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs font-mono">
                          {anomaly.prefix && (
                            <div className="flex flex-col">
                              <span className="text-[#475569] uppercase tracking-wider">Target Prefix</span>
                              <span className="text-white">{anomaly.prefix}</span>
                            </div>
                          )}
                          {anomaly.asn && (
                            <div className="flex flex-col">
                              <span className="text-[#475569] uppercase tracking-wider">Affected ASN</span>
                              <span className="text-white">AS{anomaly.asn}</span>
                            </div>
                          )}
                          {anomaly.expected_origin_asn && (
                            <div className="flex flex-col">
                              <span className="text-[#475569] uppercase tracking-wider">Expected Origin</span>
                              <span className="text-[#00f3ff]">AS{anomaly.expected_origin_asn}</span>
                            </div>
                          )}
                          {anomaly.announced_origin_asn && (
                            <div className="flex flex-col">
                              <span className="text-[#475569] uppercase tracking-wider">Detected Origin</span>
                              <span className="text-[#ff0055] font-bold">AS{anomaly.announced_origin_asn}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center relative z-10">
                    <div className="text-xs font-mono text-[#475569] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date().toLocaleTimeString()}
                    </div>
                    
                    <div className="flex gap-2">
                      <motion.button 
                        onMouseEnter={playHover}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { playClick(); onOpenBlastRadius(anomaly); }}
                        className="btn-glass text-xs py-1.5 px-3"
                      >
                        <Target className="w-3 h-3" /> Analyze Blast Radius
                      </motion.button>
                      <motion.button 
                        onMouseEnter={playHover}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { playClick(); onOpenMitigation && onOpenMitigation(anomaly); }}
                        className="btn-glass border-[#00f3ff]/30 text-[#00f3ff] hover:bg-[#00f3ff]/10 text-xs py-1.5 px-3"
                      >
                        Mitigate
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
