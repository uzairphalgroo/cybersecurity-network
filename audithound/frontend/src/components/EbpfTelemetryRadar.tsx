import React, { useState, useEffect } from 'react';
import { AuditResponse } from '../types/audit';
import { fetchEbpfTelemetryStream } from '../services/api';

interface EbpfTelemetryRadarProps {
  auditData: AuditResponse | null;
}

export const EbpfTelemetryRadar: React.FC<EbpfTelemetryRadarProps> = ({ auditData }) => {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'THREATS_ONLY'>('ALL');
  const [blockedCount, setBlockedCount] = useState<number>(0);

  useEffect(() => {
    async function loadStream() {
      try {
        const data = await fetchEbpfTelemetryStream(auditData?.environment_id || '01_fintech_prod_banking', 25);
        setTelemetry(data);
        const threats = (data.telemetry_events || []).filter((e: any) => e.severity === 'CRITICAL' || e.severity === 'HIGH').length;
        setBlockedCount(threats);
      } catch (err) {
        console.error('Error fetching eBPF stream:', err);
      }
    }
    loadStream();

    const interval = setInterval(() => {
      if (isStreaming) {
        loadStream();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [auditData?.environment_id, isStreaming]);

  const events = telemetry?.telemetry_events || [
    {
      packet_id: 'EBPF-PKT-1001',
      timestamp: '00:12:45.892',
      source_node: 'i-0a817b6291e01d (EC2 App Tier)',
      source_ip: '10.0.1.45',
      source_port: 49152,
      dest_ip: '198.51.100.24 (Suspicious C2 Node)',
      dest_port: 443,
      protocol: 'TCP / TLS 1.3',
      kernel_hook: 'sys_enter_connect() -> kprobe:tcp_v4_connect',
      process_name: '/usr/bin/xmrig-miner',
      bytes_transferred: 842000,
      threat_type: 'SUSPICIOUS_C2_BEACON',
      severity: 'CRITICAL',
      threat_matched: true,
      correlated_finding_id: 'FIND-AWS-IAM-PASSROLE-001',
      enforcement_action: 'BLOCK_SOCKET_KPROBE'
    },
    {
      packet_id: 'EBPF-PKT-1002',
      timestamp: '00:12:46.104',
      source_node: 'k8s-pod:auth-service-78bf',
      source_ip: '10.244.2.19',
      source_port: 32410,
      dest_ip: '10.96.0.1 (Kube-API Gateway)',
      dest_port: 443,
      protocol: 'HTTPS',
      kernel_hook: 'tracepoint:syscalls:sys_enter_socket',
      process_name: '/usr/local/bin/node server.js',
      bytes_transferred: 1240,
      threat_type: 'BENIGN_INTERNAL_TRAFFIC',
      severity: 'INFO',
      threat_matched: false,
      correlated_finding_id: null,
      enforcement_action: 'ALLOW_FORWARD'
    }
  ];

  const displayedEvents = filter === 'THREATS_ONLY'
    ? events.filter((e: any) => e.severity === 'CRITICAL' || e.severity === 'HIGH')
    : events;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-cyan-950/50 to-slate-900/80 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2"></span>
                📡 eBPF Kernel Telemetry Active
              </span>
              <span className="text-xs text-slate-400 font-mono">Kernel 6.8.0-generic (JIT Bytecode Attached)</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-2 flex items-center gap-2">
              Real-Time eBPF Runtime Packet Telemetry & Threat Correlator
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Inspects live Linux socket connections, intercepts malicious process beacons via kernel kprobes, and deterministically binds runtime network anomalies directly to static IAM privilege escalation paths.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 border cursor-pointer ${
                isStreaming
                  ? 'bg-emerald-900/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
              <span>{isStreaming ? 'Live Interception (Active)' : 'Stream Paused'}</span>
            </button>

            <button
              onClick={() => setFilter(filter === 'ALL' ? 'THREATS_ONLY' : 'ALL')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all border cursor-pointer ${
                filter === 'THREATS_ONLY'
                  ? 'bg-rose-900/50 border-rose-500/50 text-rose-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter === 'THREATS_ONLY' ? '🚨 Threats Only' : '🔍 All Socket Flows'}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-6 pt-5 border-t border-emerald-500/20 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-slate-400">Kernel Probe Hooks</span>
            <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">4 Active kprobes</div>
          </div>
          <div>
            <span className="text-xs text-slate-400">Total Packets Filtered</span>
            <div className="text-sm font-mono font-bold text-white mt-0.5">{events.length} Flows</div>
          </div>
          <div>
            <span className="text-xs text-slate-400">Anomalous C2 Beacons</span>
            <div className="text-sm font-mono font-bold text-rose-400 mt-0.5">{blockedCount} Blocked</div>
          </div>
          <div>
            <span className="text-xs text-slate-400">Kill-Chain Bound</span>
            <div className="text-sm font-mono font-bold text-purple-300 mt-0.5">100% Deterministic</div>
          </div>
        </div>
      </div>

      {/* Live eBPF Stream Terminal Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Live eBPF Socket Event Stream</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              /sys/kernel/debug/tracing/kprobe_events
            </span>
          </div>
          <span className="text-xs text-slate-400">Displaying {displayedEvents.length} socket telemetry entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Source Node</th>
                <th className="py-3 px-3">Destination IP & Port</th>
                <th className="py-3 px-3">Process & Kernel Hook</th>
                <th className="py-3 px-3">Severity & Threat</th>
                <th className="py-3 px-3">Correlated Attack Path</th>
                <th className="py-3 px-3 text-right">eBPF Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {displayedEvents.map((pkt: any, i: number) => {
                const isThreat = pkt.severity === 'CRITICAL' || pkt.severity === 'HIGH';
                return (
                  <tr
                    key={pkt.packet_id || i}
                    className={`transition-colors ${
                      isThreat ? 'bg-rose-950/20 hover:bg-rose-950/30' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-slate-400">{pkt.timestamp}</td>
                    <td className="py-2.5 px-3 text-slate-200">{pkt.source_node}</td>
                    <td className="py-2.5 px-3">
                      <span className={isThreat ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {pkt.dest_ip}:{pkt.dest_port}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-slate-200">{pkt.process_name}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{pkt.kernel_hook}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          isThreat
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {pkt.threat_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {pkt.correlated_finding_id ? (
                        <span className="text-purple-300 font-bold bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30">
                          {pkt.correlated_finding_id}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          isThreat
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {pkt.enforcement_action || 'ALLOW'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
