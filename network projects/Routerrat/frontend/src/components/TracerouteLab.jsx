import React, { useState } from 'react';
import { Route, Play, Activity, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function TracerouteLab({ targetPrefix }) {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const runTraceroute = async () => {
    setRunning(true);
    setResults(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/traceroute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_prefix: targetPrefix })
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError("Traceroute simulation failed");
    } finally {
      setRunning(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 120 } }
  };

  return (
    <div className="glass-panel p-8 h-full flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#00f3ff]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-xl font-syne font-bold flex items-center gap-2">
            <Route className="w-5 h-5 text-[#00f3ff]" />
            Diagnostic Lab
          </h2>
          <p className="text-sm font-mono text-[#475569] mt-1">Simulated ICMP Path Trace</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={runTraceroute}
          disabled={running}
          className="btn-glass bg-[#00f3ff]/5 border-[#00f3ff]/30 text-[#00f3ff] hover:bg-[#00f3ff]/10"
        >
          {running ? (
            <Activity className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {running ? 'Tracing...' : 'Run Trace'}
        </motion.button>
      </div>

      <div className="flex-1 bg-[#02040a]/50 rounded-xl border border-white/5 p-4 font-mono text-sm relative z-10 overflow-y-auto custom-scrollbar min-h-[250px]">
        {!running && !results && !error && (
          <div className="h-full flex flex-col items-center justify-center text-[#475569]">
            <Route className="w-12 h-12 mb-4 opacity-30" />
            <p className="uppercase tracking-widest text-xs">Ready for diagnostics</p>
          </div>
        )}

        {running && (
          <div className="h-full flex flex-col items-center justify-center space-y-4 text-[#00f3ff]">
            <div className="flex space-x-2">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, delay: i * 0.2, duration: 0.6 }}
                  className="w-3 h-3 bg-[#00f3ff] rounded-full"
                />
              ))}
            </div>
            <p className="animate-pulse">Transmitting ICMP Echo Requests...</p>
          </div>
        )}

        {error && (
          <div className="text-[#ff0055] flex items-center gap-2 bg-[#ff0055]/10 p-4 rounded-lg border border-[#ff0055]/30">
            <AlertTriangle className="w-5 h-5" /> {error}
          </div>
        )}

        <AnimatePresence>
          {results && !running && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              <motion.div variants={itemVariants} className="flex justify-between items-center pb-2 border-b border-white/10 text-[#475569] uppercase tracking-wider text-xs">
                <span>Hop / Host</span>
                <span>Latency</span>
              </motion.div>
              
              {results.actual_hops && results.actual_hops.map((hop, idx) => (
                <motion.div 
                  key={idx}
                  variants={itemVariants}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[#94a3b8] w-6">{hop.hop}</span>
                    <div>
                      <div className="text-white font-bold">{hop.ip}</div>
                      {hop.asn ? <div className="text-xs text-[#00f3ff]">AS{hop.asn}</div> : <div className="text-xs text-[#94a3b8]">Local</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {hop.is_anomaly && (
                      <span className="text-[#ffb700] text-xs flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> Routing Deviation
                      </span>
                    )}
                    <div className={`flex items-center gap-2 ${hop.latency_ms > 100 ? 'text-[#ffb700]' : 'text-[#00f3ff]'}`}>
                      <Clock className="w-4 h-4" />
                      {hop.latency_ms}ms
                    </div>
                  </div>
                </motion.div>
              ))}

              <motion.div variants={itemVariants} className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                <div className="text-xs text-[#94a3b8] uppercase tracking-widest">Diagnostic Result</div>
                {results.has_unauthorized_transit ? (
                  <div className="badge-warning">
                    <AlertTriangle className="w-3 h-3" /> Suboptimal Path Detected
                  </div>
                ) : (
                  <div className="badge-normal text-[#00f3ff] border-[#00f3ff]/50 bg-[#00f3ff]/10">
                    <ShieldCheck className="w-3 h-3" /> Path Verified Optimal
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
