import React, { useState } from 'react';
import { Send, CheckCircle2, AlertTriangle, MessageSquare, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
const API_BASE = "https://routerrat.onrender.com";

export default function WebhookTester() {
  const [webhookUrl, setWebhookUrl] = useState('simulated://discord.com/api/webhooks/...');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/webhook/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhook_url: webhookUrl,
          platform: webhookUrl.includes('discord') ? 'discord' : 'slack',
          incident: {
            anomaly_type: "Test Anomaly",
            severity: "CRITICAL",
            description: "This is a simulated webhook dispatch from RouterRat NOC."
          }
        })
      });
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setStatus({ status: 'error', error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = status && (status.status === 'simulated_success' || status.status === 'dispatched');

  return (
    <div className="glass-panel p-8 h-full flex flex-col relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f3ff]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="w-5 h-5 text-[#00f3ff]" />
        <h2 className="text-xl font-syne font-bold">External Dispatcher</h2>
      </div>

      <div className="space-y-6 flex-1">
        <div className="space-y-2">
          <label className="text-xs font-mono text-[#94a3b8] uppercase tracking-widest flex items-center gap-2">
            <Terminal className="w-3 h-3" /> Webhook Endpoint
          </label>
          <input 
            type="text" 
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="w-full bg-[#02040a]/80 border border-white/10 rounded-lg p-3 font-mono text-sm text-white focus:outline-none focus:border-[#00f3ff] focus:ring-1 focus:ring-[#00f3ff] transition-all"
            placeholder="https://hooks.slack.com/services/..."
          />
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTest}
          disabled={loading}
          className="w-full btn-glass bg-[#00f3ff]/5 border-[#00f3ff]/30 text-[#00f3ff] hover:bg-[#00f3ff]/10 justify-center py-3"
        >
          {loading ? (
            <div className="w-4 h-4 rounded-full border-t-2 border-[#00f3ff] animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {loading ? 'Dispatching...' : 'Send Test Dispatch'}
        </motion.button>

        {status && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg font-mono text-sm border flex items-start gap-3 ${
              isSuccess 
                ? 'bg-[#00f3ff]/10 text-[#00f3ff] border-[#00f3ff]/30' 
                : 'bg-[#ff0055]/10 text-[#ff0055] border-[#ff0055]/30'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <div className="break-all">
               {isSuccess ? `Successfully dispatched to ${status.platform}!` : (status.error || "Failed to dispatch.")}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
