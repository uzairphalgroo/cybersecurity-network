import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, X, Activity, Server, Target, Zap, ChevronRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function BlastRadiusModal({ isOpen, onClose, incident, telemetry }) {
  const [radiusData, setRadiusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dispatchStatus, setDispatchStatus] = useState(null);
  const reportRef = React.useRef(null);

  useEffect(() => {
    if (isOpen && incident) {
      calculateRadius();
    }
  }, [isOpen, incident]);

  const calculateRadius = async () => {
    setLoading(true);
    try {
      // Simulate API call to backend engine
      const res = await fetch('/api/blast-radius', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anomaly_type: incident.anomaly_type,
          affected_prefix: incident.prefix || "104.16.0.0/12",
          culprit_asn: incident.asn || incident.announced_origin_asn,
          current_path: telemetry?.as_path || []
        })
      });
      const data = await res.json();
      setRadiusData(data);
    } catch (err) {
      console.error(err);
      setRadiusData({ error: 'Failed to calculate blast radius' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendWebhook = async () => {
    setLoading(true);
    try {
      const payload = {
        alert_title: `Critical BGP Incident: ${incident?.anomaly_type?.replace('_', ' ')?.toUpperCase() || 'UNKNOWN'}`,
        severity: incident.severity,
        affected_prefix: incident.prefix || "Unknown",
        culprit_asn: incident.announced_origin_asn || incident.asn || 0,
        blast_score: radiusData?.blast_score || 0,
        description: incident.description,
        timestamp: new Date().toISOString()
      };

      const resp = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const res = await resp.json();
      setDispatchStatus(res);
    } catch (err) {
      setDispatchStatus({ status: 'error', message: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, {
      backgroundColor: '#080c16',
      scale: 2,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`Incident_Report_${incident?.anomaly_type || 'BGP'}.pdf`);
  };

  const overlayVariants = {
    hidden: { opacity: 0, backdropFilter: "blur(0px)" },
    show: { opacity: 1, backdropFilter: "blur(20px)", transition: { duration: 0.3 } },
    exit: { opacity: 0, backdropFilter: "blur(0px)" }
  };

  const modalVariants = {
    hidden: { opacity: 0, x: '100%', scale: 0.95 },
    show: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } },
    exit: { opacity: 0, x: '100%', scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-[100] flex justify-end"
      variants={overlayVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <div className="absolute inset-0 bg-[#02040a]/80" onClick={onClose} />
      
      <motion.div 
        className="w-full max-w-xl h-full bg-[#080c16]/95 border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] relative overflow-y-auto custom-scrollbar"
        variants={modalVariants}
      >
        <div className="sticky top-0 bg-[#080c16]/90 backdrop-blur-md p-6 border-b border-white/10 flex items-center justify-between z-10">
          <h2 className="text-2xl font-syne font-bold flex items-center gap-3 text-white">
            <Target className="w-6 h-6 text-[#ff0055]" />
            Blast Radius Analysis
          </h2>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        <div ref={reportRef} className="p-8 space-y-8">
          {/* Incident Summary Card */}
          <div className="glass-panel p-6 border border-[#ff0055]/30 !shadow-[0_0_30px_rgba(255,0,85,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff0055]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[#ff0055]/10 border border-[#ff0055]/30 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-[#ff0055]" />
              </div>
              <div>
                <h3 className="font-syne font-bold text-white text-lg tracking-wide uppercase">
                  {incident?.anomaly_type?.replace('_', ' ')}
                </h3>
                <span className="badge-critical mt-1">
                  Severity: {incident?.severity}
                </span>
              </div>
            </div>
            
            <p className="text-[#94a3b8] font-mono text-sm relative z-10">
              {incident?.description}
            </p>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full border-t-2 border-[#00f3ff] animate-spin"></div>
              <p className="text-[#00f3ff] font-mono animate-pulse">Running Monte Carlo Simulations...</p>
            </div>
          ) : radiusData && !radiusData.error ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              {/* Blast Score Gauge */}
              <div className="text-center">
                <h4 className="text-sm font-mono text-[#475569] uppercase tracking-widest mb-4">Calculated Blast Score</h4>
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="70" className="stroke-white/10" strokeWidth="8" fill="none" />
                    <motion.circle 
                      cx="80" cy="80" r="70" 
                      className={`${radiusData.blast_score > 70 ? 'stroke-[#ff0055]' : radiusData.blast_score > 40 ? 'stroke-[#ffb700]' : 'stroke-[#00f3ff]'}`} 
                      strokeWidth="8" fill="none" 
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "440", strokeDashoffset: "440" }}
                      animate={{ strokeDashoffset: 440 - (440 * radiusData.blast_score) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-syne font-bold text-white">
                      {radiusData.blast_score}
                    </span>
                    <span className="text-xs font-mono text-[#94a3b8]">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4 text-[#00f3ff]" />
                    <span className="text-xs font-mono text-[#94a3b8] uppercase">Affected Routes</span>
                  </div>
                  <span className="text-2xl font-mono font-bold text-white">
                    {radiusData.affected_routes.toLocaleString()}
                  </span>
                </div>
                <div className="glass-panel p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-[#ffb700]" />
                    <span className="text-xs font-mono text-[#94a3b8] uppercase">Global Reachability</span>
                  </div>
                  <span className="text-2xl font-mono font-bold text-white">
                    {radiusData.reachability_drop}%
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-white/10" data-html2canvas-ignore>
                <h4 className="text-sm font-mono text-[#475569] uppercase tracking-widest mb-4">Triage Actions</h4>
                
                <div className="flex gap-4 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownloadPDF}
                    className="flex-1 btn-glass border-[#00f3ff]/30 text-[#00f3ff] hover:bg-[#00f3ff]/10 justify-center py-4 text-sm"
                  >
                    Download PDF Report
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSendWebhook}
                  className="w-full btn-cyber-gold justify-center py-4 text-sm"
                  disabled={loading}
                >
                  <Zap className="w-5 h-5" />
                  {loading ? 'Dispatching...' : 'Dispatch Webhook Alert'}
                  <ChevronRight className="w-5 h-5 ml-auto" />
                </motion.button>
                
                {dispatchStatus && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`mt-4 p-4 rounded-lg font-mono text-sm flex items-start gap-3 ${
                      (dispatchStatus.status === 'success' || dispatchStatus.status === 'simulated_success') ? 'bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30' : 'bg-[#ff0055]/10 text-[#ff0055] border border-[#ff0055]/30'
                    }`}
                  >
                    {(dispatchStatus.status === 'success' || dispatchStatus.status === 'simulated_success') ? <ShieldCheck className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                    <p>{dispatchStatus.message || "Webhook payload generated successfully."}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="p-4 bg-[#ff0055]/10 text-[#ff0055] rounded-lg border border-[#ff0055]/30 font-mono text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              {radiusData?.error || 'Failed to analyze radius'}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
