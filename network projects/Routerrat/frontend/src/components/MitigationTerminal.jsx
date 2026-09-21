import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, X, CheckCircle2 } from 'lucide-react';
import useCyberAudio from '../hooks/useCyberAudio';

export default function MitigationTerminal({ anomaly, onClose, onMitigate }) {
  const { playSuccess, playClick } = useCyberAudio();
  const [history, setHistory] = useState([
    { type: 'system', text: `RouterRat NOC Terminal (v2.0)` },
    { type: 'system', text: `Establishing secure connection to edge routers...` },
    { type: 'system', text: `Connected.` },
    { type: 'system', text: `Current active incident: ${anomaly?.anomaly_type}` },
    { type: 'system', text: `Target prefix: ${anomaly?.prefix || 'unknown'}` },
    { type: 'system', text: `Type 'help' for available commands.` },
  ]);
  const [input, setInput] = useState('');
  const [mitigated, setMitigated] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim();
    const newHistory = [...history, { type: 'user', text: `router# ${cmd}` }];
    setInput('');

    // Simulate CLI logic
    setTimeout(() => {
      let response = [];
      const lowerCmd = cmd.toLowerCase();

      if (lowerCmd === 'help') {
        response = [
          { type: 'system', text: `Available commands:` },
          { type: 'system', text: `  show ip bgp           - Display BGP routing table` },
          { type: 'system', text: `  conf t                - Enter configuration mode` },
          { type: 'system', text: `  ip route <prefix> Null0 - Blackhole a prefix` },
          { type: 'system', text: `  clear ip bgp *        - Soft reset BGP sessions` },
          { type: 'system', text: `  exit                  - Close terminal` }
        ];
      } else if (lowerCmd === 'show ip bgp') {
        response = [
          { type: 'system', text: `BGP table version is 1421, local router ID is 192.168.1.1` },
          { type: 'system', text: `Status codes: s suppressed, d damped, h history, * valid, > best, i - internal` },
          { type: 'system', text: `   Network          Next Hop            Metric LocPrf Weight Path` },
          { type: 'system', text: `*> ${anomaly?.prefix?.padEnd(16, ' ') || '0.0.0.0/0       '} 10.0.0.1                 0             0 ${anomaly?.announced_origin_asn ? `${anomaly.announced_origin_asn} i` : '?'}` }
        ];
      } else if (lowerCmd === 'conf t') {
        response = [{ type: 'system', text: `Enter configuration commands, one per line. End with CNTL/Z.` }];
      } else if (lowerCmd.startsWith('ip route') && lowerCmd.includes('null0')) {
        response = [
          { type: 'success', text: `Route blackhole applied successfully to ${lowerCmd.split(' ')[2]}` },
          { type: 'system', text: `Traffic dropped at edge.` }
        ];
        if (lowerCmd.includes(anomaly?.prefix || '0.0.0.0')) {
          setMitigated(true);
          playSuccess();
        }
      } else if (lowerCmd === 'clear ip bgp *') {
        response = [{ type: 'system', text: `Clearing all BGP sessions... Done.` }];
      } else if (lowerCmd === 'exit') {
        onClose();
        return;
      } else {
        response = [{ type: 'error', text: `% Invalid input detected at '^' marker.` }];
      }

      setHistory([...newHistory, ...response]);
    }, 400);
  };

  const handleMitigateComplete = () => {
    onMitigate(anomaly);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#02040a]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl glass-panel border border-[#00f3ff]/30 shadow-[0_0_50px_rgba(0,243,255,0.1)] flex flex-col h-[600px] overflow-hidden rounded-xl relative"
      >
        {/* Terminal Header */}
        <div className="bg-black/50 border-b border-white/10 p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TerminalIcon className="w-5 h-5 text-[#00f3ff]" />
            <h2 className="text-white font-mono text-sm tracking-widest uppercase">NOC Mitigation Terminal</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 bg-black p-4 overflow-y-auto font-mono text-sm relative group custom-scrollbar">
          {/* CRT Scanline effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-20"></div>
          
          <div className="space-y-1 relative z-20">
            {history.map((msg, idx) => (
              <div key={idx} className={`
                ${msg.type === 'user' ? 'text-white' : ''}
                ${msg.type === 'system' ? 'text-[#00f3ff]' : ''}
                ${msg.type === 'error' ? 'text-[#ff0055]' : ''}
                ${msg.type === 'success' ? 'text-[#00ff9d]' : ''}
              `}>
                {msg.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Success Overlay */}
          <AnimatePresence>
            {mitigated && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center flex-col"
              >
                <div className="text-[#00ff9d] mb-4">
                  <CheckCircle2 className="w-16 h-16 animate-pulse" />
                </div>
                <h3 className="text-2xl font-syne font-bold text-white mb-2">Threat Mitigated</h3>
                <p className="text-sm font-mono text-[#94a3b8] mb-6">BGP routing tables updated and verified.</p>
                <button 
                  onClick={() => { playClick(); handleMitigateComplete(); }}
                  className="btn-glass border-[#00ff9d]/30 text-[#00ff9d] hover:bg-[#00ff9d]/10 px-8 py-3"
                >
                  Close & Resolve Incident
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Terminal Input */}
        <div className="bg-black border-t border-white/10 p-3 relative z-20">
          <form onSubmit={handleCommand} className="flex items-center gap-2">
            <span className="text-[#00f3ff] font-mono font-bold">router#</span>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm caret-[#00f3ff]"
              autoFocus
              autoComplete="off"
              spellCheck="false"
              disabled={mitigated}
            />
          </form>
        </div>
      </motion.div>
    </div>
  );
}
