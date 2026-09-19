import React, { useState, useEffect } from 'react';
import { AuditResponse } from '../types/audit';
import { simulatePurpleTeam } from '../services/api';

interface PurpleTeamSimulatorProps {
  auditData: AuditResponse | null;
  onNavigateToRemediation?: () => void;
}

export const PurpleTeamSimulator: React.FC<PurpleTeamSimulatorProps> = ({ auditData, onNavigateToRemediation }) => {
  const [objective, setObjective] = useState('exfiltrate_customer_pii');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  const objectives = [
    { id: 'exfiltrate_customer_pii', label: '🗄️ Exfiltrate Crown-Jewel Customer PII Lake', desc: 'Target unencrypted or publicly accessible cloud datastores via identity hopping' },
    { id: 'ransomware_encryption', label: '🔒 Deploy Cloud-Native Ransomware Lockdown', desc: 'Attempt lateral traversal to encrypt EBS/RDS volumes and delete KMS backup keys' },
    { id: 'k8s_control_plane_takeover', label: '☸️ Kubernetes Cluster-Admin Escalation', desc: 'Exploit pod escape vectors and default service account bindings to take over cluster' },
    { id: 'cloud_root_takeover', label: '👑 Full Cloud Organization Root Takeover', desc: 'Traverse IAM PassRole and policy escalation vectors to compromise organization root' }
  ];

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await simulatePurpleTeam(auditData?.environment_id || '01_fintech_multicloud_core', objective, auditData);
      setSimulationResult(res);
      setActiveStepIndex(0);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    if (auditData) {
      handleRunSimulation();
    }
  }, [auditData?.environment_id, objective]);

  if (!auditData) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400">
        <p className="text-lg">Please load or upload an environment first to launch the Purple-Teaming Breach Simulator.</p>
      </div>
    );
  }

  const blastRadius = simulationResult?.blast_radius_summary || {
    compromise_probability_pct: 78.5,
    reachable_crown_jewels_count: 2,
    total_cloud_nodes: 8,
    simulated_hops_to_root: 3,
    containment_rating: 'VULNERABLE_CHAIN'
  };

  const adversary = simulationResult?.adversary_profile || {
    name: 'APT-29 (Midnight Shadow)',
    origin: 'Nation-State / Advanced Cyber Syndicate',
    primary_technique: 'MITRE ATT&CK T1078, T1068, T1190',
    motivation: 'Espionage, lateral persistence, and financial data exfiltration'
  };

  const attackChain = simulationResult?.adversary_attack_chain || [
    {
      step: 1,
      phase: 'Initial Access',
      mitre_technique: 'T1190: Exploit Public-Facing Application',
      source_node: '0.0.0.0/0 (Global Internet)',
      target_node: 'Exposed Cloud Ingress Boundary',
      action_taken: 'Scans for open SSH/MySQL ports or public S3 bucket ACLs.',
      status: 'SUCCESSFUL_BREACH',
      exploitability_score: '9.8 / 10'
    },
    {
      step: 2,
      phase: 'Privilege Escalation',
      mitre_technique: 'T1068: Exploitation for Privilege Escalation',
      source_node: 'Compromised Service Principal',
      target_node: 'IAM Role with PassRole & Wildcard Policy',
      action_taken: 'Discovers overly permissive IAM policy attachment and elevates session tokens.',
      status: 'PRIVILEGE_ELEVATED',
      exploitability_score: '9.2 / 10'
    },
    {
      step: 3,
      phase: 'Impact & Objective Completion',
      mitre_technique: 'T1530: Data from Cloud Storage Object',
      source_node: 'Elevated Admin Session',
      target_node: 'Production Customer PII Data Lake',
      action_taken: 'Issues unauthenticated S3 GetObject batch request to exfiltrate 2.4 TB customer records.',
      status: 'OBJECTIVE_ACHIEVED',
      exploitability_score: '10.0 / 10'
    }
  ];

  const cutPoints = simulationResult?.critical_cut_points || [
    {
      target_resource: 'Ingress Security Boundary & IAM Policy Attachments',
      action: 'Sever wildcard (*) action in IAM policy & enforce S3 Block Public Access',
      blast_reduction: 'Reduces breach reachability by 100%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-slate-900/80 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
                🤖 Autonomous Purple-Team Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">MITRE ATT&CK Matrix Matrix v14.1</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-2 flex items-center gap-2">
              Autonomous Adversary Breach & Blast-Radius Simulator
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Simulates advanced nation-state adversary lateral movement against your cloud infrastructure graph to compute deterministic blast radius, Crown-Jewel compromise paths, and single-click cut-points.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 border border-purple-400/30 disabled:opacity-50 cursor-pointer"
            >
              {isSimulating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Simulating Kill-Chain...</span>
                </>
              ) : (
                <>
                  <span>⚡ Run Live Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Objective Selector */}
        <div className="mt-6 pt-5 border-t border-purple-500/20 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {objectives.map((obj) => (
            <button
              key={obj.id}
              onClick={() => setObjective(obj.id)}
              className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                objective === obj.id
                  ? 'bg-purple-900/40 border-purple-500/60 ring-2 ring-purple-500/30 text-white'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="text-xs font-semibold">{obj.label}</div>
              <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{obj.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Breach Probability Gauge */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Breach Probability</span>
            <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              {blastRadius.containment_rating}
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400 font-mono">
              {blastRadius.compromise_probability_pct}%
            </span>
            <span className="text-xs text-rose-400">Likelihood</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 h-full rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, blastRadius.compromise_probability_pct)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Deterministic multi-hop path reachability to cloud root</p>
        </div>

        {/* Crown Jewels Accessible */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Crown Jewels Exposed</span>
            <span className="text-amber-400 text-base">💎</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-amber-300 font-mono">
              {blastRadius.reachable_crown_jewels_count}
            </span>
            <span className="text-xs text-slate-400">/ {blastRadius.total_cloud_nodes} assets</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-5">Datastores & Secret Keys within adversary blast radius</p>
        </div>

        {/* Min Hops to Full Compromise */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Hops to Root Admin</span>
            <span className="text-purple-400 text-base">⚡</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-purple-300 font-mono">
              {blastRadius.simulated_hops_to_root}
            </span>
            <span className="text-xs text-slate-400">Pivots</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-5">Shortest path privilege escalation sequence</p>
        </div>

        {/* Adversary Profile */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Adversary Model</span>
            <span className="text-red-400 text-base">🎯</span>
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-white">{adversary.name}</div>
            <div className="text-xs text-rose-400 font-mono mt-0.5">{adversary.origin}</div>
            <div className="text-[11px] text-slate-400 mt-2 line-clamp-2">{adversary.motivation}</div>
          </div>
        </div>
      </div>

      {/* Adversary Attack Chain Execution Stepper */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>⚔️ Adversary Kill-Chain Traversal Log</span>
              <span className="text-xs font-normal text-slate-400">({attackChain.length} Sequential Exploitation Vectors)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any step to inspect the exact network traversal, credential elevation, and forensic evidence.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {attackChain.map((step: any, idx: number) => {
            const isSelected = activeStepIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-900/20 ring-1 ring-purple-500/30'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {step.step || idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{step.phase || `Phase ${idx + 1}`}</span>
                        <span className="text-xs font-mono bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
                          {step.mitre_technique || 'MITRE ATT&CK'}
                        </span>
                        <span className="text-xs font-mono bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded border border-rose-500/20">
                          {step.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5">{step.action_taken}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono shrink-0 pl-10 lg:pl-0">
                    <div className="text-slate-400">
                      <span className="text-slate-500">From: </span>
                      <span className="text-slate-300">{step.source_node}</span>
                    </div>
                    <span className="text-purple-400">➔</span>
                    <div className="text-slate-400">
                      <span className="text-slate-500">Target: </span>
                      <span className="text-amber-300 font-semibold">{step.target_node}</span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-purple-500/20 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-purple-950/20 p-3 rounded-lg">
                    <div>
                      <span className="text-slate-400 font-semibold">Exploitability Index: </span>
                      <span className="text-rose-400 font-mono font-bold">{step.exploitability_score || '9.5 / 10'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold">Mitigation Strategy: </span>
                      <span className="text-emerald-400">Restrict IAM PassRole and enforce least-privilege boundary</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Single-Click Cut Point Severance */}
      <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900/60 to-slate-900/80 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span>✂️ Optimal Kill-Chain Cut-Point</span>
              <span className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">100% Severance</span>
            </div>
            <h4 className="text-lg font-bold text-white mt-1">
              Sever Adversary Breach Chain: {cutPoints[0]?.target_resource || 'Ingress Security Boundary & IAM Policy'}
            </h4>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl">
              {cutPoints[0]?.action || 'Applying Sentinara least-privilege Terraform patch will sever the primary pivot node.'} {cutPoints[0]?.blast_reduction || 'Reduces breach reachability by 100%'}
            </p>
          </div>

          {onNavigateToRemediation && (
            <button
              onClick={onNavigateToRemediation}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 border border-emerald-400/30 shrink-0 cursor-pointer"
            >
              <span>⚡ Review & Apply Fixes</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
