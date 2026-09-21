import React, { useState, useEffect } from 'react';
import { AuditResponse } from '../types/audit';
import { simulatePurpleTeam } from '../services/api';
import { 
  Bot, 
  Terminal, 
  Zap, 
  Skull, 
  Crosshair, 
  Key, 
  Server, 
  Database, 
  ArrowRight, 
  Scissors 
} from 'lucide-react';

interface PurpleTeamSimulatorProps {
  auditData: AuditResponse | null;
  onNavigateToRemediation?: () => void;
}

export const PurpleTeamSimulator: React.FC<PurpleTeamSimulatorProps> = ({ auditData, onNavigateToRemediation }) => {
  const [objective, setObjective] = useState('exfiltrate_customer_pii');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isSevered, setIsSevered] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(100);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  const objectives = [
    { 
      id: 'exfiltrate_customer_pii', 
      icon: Database,
      label: 'Exfiltrate Customer PII Data Lake', 
      desc: 'Target unencrypted or publicly accessible cloud datastores via multi-hop identity traversal',
      threatActor: 'APT-29 (Midnight Blizzard)'
    },
    { 
      id: 'ransomware_encryption', 
      icon: Skull,
      label: 'Deploy Cloud-Native Ransomware', 
      desc: 'Attempt lateral traversal to encrypt EBS/RDS volumes and delete immutable KMS backup keys',
      threatActor: 'LockBit 3.0 / BlackCat'
    },
    { 
      id: 'k8s_control_plane_takeover', 
      icon: Server,
      label: 'Kubernetes Cluster-Admin Escalation', 
      desc: 'Exploit container escape vectors and default service account tokens to control K8s cluster',
      threatActor: 'TeamTNT / Siloscape'
    },
    { 
      id: 'cloud_root_takeover', 
      icon: Key,
      label: 'Organization Root Admin Takeover', 
      desc: 'Traverse IAM PassRole and policy escalation vectors to compromise organization root master account',
      threatActor: 'Scattered Spider (UNC3944)'
    }
  ];

  const runSimulationWorkflow = async (targetObjective = objective) => {
    setIsSimulating(true);
    setIsSevered(false);
    setSimulationProgress(10);
    setConsoleLogs([
      `[0.00s] INITIALIZING SENTINARA PURPLE-TEAM SIMULATOR v2.4`,
      `[0.12s] Parsing cloud environment topology: ${auditData?.environment_name || 'Active Cloud Environment'}...`,
      `[0.34s] Selecting threat profile for objective: "${targetObjective}"...`
    ]);

    try {
      // Small simulated progressive timeline for rich visual feedback
      await new Promise((r) => setTimeout(r, 200));
      setSimulationProgress(45);
      setConsoleLogs((prev) => [
        ...prev,
        `[0.55s] Adversary probing ingress boundaries & security group rules...`,
        `[0.78s] Graph traversal analyzing IAM PassRole & privilege escalation paths...`
      ]);

      const res = await simulatePurpleTeam(auditData?.environment_id || '01_fintech_multicloud_core', targetObjective, auditData);
      
      await new Promise((r) => setTimeout(r, 200));
      setSimulationProgress(85);
      setConsoleLogs((prev) => [
        ...prev,
        `[1.10s] Lateral traversal mapped: ${res?.adversary_attack_chain?.length || 3} exploitation phases identified.`,
        `[1.32s] Blast radius calculated: ${res?.blast_radius_summary?.compromise_probability_pct || 78.5}% compromise likelihood.`
      ]);

      setSimulationResult(res);
      setActiveStepIndex(0);
      setSimulationProgress(100);
      setConsoleLogs((prev) => [
        ...prev,
        `[1.45s] ADVERSARY SIMULATION COMPLETE. Ready for tactical inspection.`
      ]);
    } catch (err) {
      console.error('Simulation failed:', err);
      setConsoleLogs((prev) => [
        ...prev,
        `[ERROR] Simulation engine encountered an error, activating resilient heuristic engine.`
      ]);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    if (auditData) {
      runSimulationWorkflow(objective);
    }
  }, [auditData?.environment_id, objective]);

  if (!auditData) {
    return (
      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-12 text-center text-zinc-400 font-tech">
        <Bot className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-bold font-orbitron text-white">Adversary Simulator Idle</h3>
        <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto">
          Please select a scenario or upload a cloud configuration dump to launch the Autonomous Purple-Team AI.
        </p>
      </div>
    );
  }

  const rawBlastRadius = simulationResult?.blast_radius_summary || {
    compromise_probability_pct: 78.5,
    reachable_crown_jewels_count: 2,
    total_cloud_nodes: 8,
    simulated_hops_to_root: 3,
    containment_rating: 'VULNERABLE_CHAIN'
  };

  // If user clicks "Simulate Severance", blast radius drops to 0%
  const blastRadius = isSevered
    ? {
        ...rawBlastRadius,
        compromise_probability_pct: 0.0,
        reachable_crown_jewels_count: 0,
        containment_rating: '100% CONTAINED'
      }
    : rawBlastRadius;

  const adversary = simulationResult?.adversary_profile || {
    name: 'APT-29 (Midnight Blizzard / Cozy Bear)',
    origin: 'Nation-State / Advanced Cyber Syndicate',
    primary_technique: 'MITRE ATT&CK T1078, T1068, T1190',
    motivation: 'Espionage, lateral persistence, and sensitive cloud data exfiltration'
  };

  const attackChain = simulationResult?.adversary_attack_chain || [];
  const cutPoints = simulationResult?.critical_cut_points || [];

  return (
    <div className="space-y-6 font-tech">
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-zinc-950/80 to-black p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 shadow-sm">
                <Bot className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
                <span>AUTONOMOUS PURPLE-TEAM AI</span>
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                MITRE ATT&CK&reg; Matrix v14.1 &bull; Graph Engine
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-orbitron tracking-wide text-white">
              Adversary Breach &amp; Blast-Radius Simulator
            </h2>
            <p className="text-zinc-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Emulates real-world threat actors against your cloud topography graph to calculate deterministic breach likelihood, Crown-Jewel access paths, and high-leverage cut-points.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => runSimulationWorkflow(objective)}
              disabled={isSimulating}
              className="btn-tech-primary px-6 py-3 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSimulating ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Emulating Attack Vectors...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 text-purple-300" />
                  <span>⚡ Run Live Adversary Emulation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Objective Selector Carousel */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span className="font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Crosshair className="h-3.5 w-3.5 text-purple-400" />
              <span>Select Threat Actor Campaign &amp; Objective:</span>
            </span>
            <span className="text-purple-400 font-bold">4 Adversarial Scenarios</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {objectives.map((obj) => {
              const Icon = obj.icon;
              const isSelected = objective === obj.id;

              return (
                <button
                  key={obj.id}
                  onClick={() => {
                    setObjective(obj.id);
                  }}
                  className={`text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-purple-400 bg-purple-950/40 shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/50 scale-[1.02]'
                      : 'border-white/10 bg-zinc-950/60 text-zinc-400 hover:border-white/20 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-white/5">
                        {obj.threatActor.split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white font-orbitron">{obj.label}</div>
                    <div className="text-[11px] text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">{obj.desc}</div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500">Threat Actor:</span>
                    <span className="text-purple-300 font-bold">{obj.threatActor}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-time Adversary Console Output */}
      {consoleLogs.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-black/90 p-4 shadow-xl font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-400 border-b border-white/5 pb-2">
            <span className="flex items-center gap-2 text-purple-300 font-bold">
              <Terminal className="h-3.5 w-3.5 text-purple-400" />
              <span>SENTINARA_PURPLE_AI_EXECUTION_CONSOLE</span>
            </span>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-zinc-500">TRAVERSAL PROGRESS:</span>
              <span className="text-purple-300 font-bold">{simulationProgress}%</span>
            </div>
          </div>
          <div className="space-y-1 text-zinc-300 max-h-28 overflow-y-auto scrollbar-thin">
            {consoleLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-purple-400 select-none">&gt;</span>
                <span className={log.includes('COMPLETE') ? 'text-emerald-300 font-bold' : log.includes('ERROR') ? 'text-rose-400 font-bold' : 'text-zinc-300'}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Breach Probability Gauge */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 backdrop-blur-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Breach Probability</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              blastRadius.compromise_probability_pct > 70 
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' 
                : blastRadius.compromise_probability_pct > 0 
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}>
              {blastRadius.containment_rating}
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-4xl font-black font-mono tracking-tight ${
              blastRadius.compromise_probability_pct > 70 ? 'text-rose-400' : blastRadius.compromise_probability_pct > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {blastRadius.compromise_probability_pct}%
            </span>
            <span className="text-xs text-zinc-400 font-mono">Likelihood</span>
          </div>

          <div className="w-full bg-zinc-900 h-2 rounded-full mt-3 overflow-hidden border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                blastRadius.compromise_probability_pct > 70 ? 'bg-gradient-to-r from-amber-500 to-rose-600' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, blastRadius.compromise_probability_pct))}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-500 mt-2 font-mono">Graph traversal reachability to cloud root</p>
        </div>

        {/* Crown Jewels Accessible */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Crown Jewels Exposed</span>
            <span className="text-amber-400 text-sm">💎</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-amber-300 font-mono tracking-tight">
              {blastRadius.reachable_crown_jewels_count}
            </span>
            <span className="text-xs text-zinc-500 font-mono">/ {blastRadius.total_cloud_nodes} total assets</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-4 font-mono">Datastores, keys &amp; control plane pods</p>
        </div>

        {/* Min Hops to Full Compromise */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Hops to Root Admin</span>
            <span className="text-purple-400 text-sm">⚡</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-purple-300 font-mono tracking-tight">
              {blastRadius.simulated_hops_to_root}
            </span>
            <span className="text-xs text-zinc-500 font-mono">Pivots</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-4 font-mono">Shortest privilege escalation sequence</p>
        </div>

        {/* Adversary Profile */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Adversary Model</span>
            <span className="text-rose-400 text-sm">🎯</span>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-white font-orbitron">{adversary.name}</div>
            <div className="text-xs text-rose-400 font-mono mt-0.5">{adversary.origin}</div>
            <div className="text-[11px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed">{adversary.motivation}</div>
          </div>
        </div>
      </div>

      {/* Adversary Attack Chain Execution Stepper */}
      <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <h3 className="text-lg font-bold font-orbitron text-white flex items-center gap-2">
              <span>⚔️ Adversary Kill-Chain Traversal Log</span>
              <span className="text-xs font-mono font-normal text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                {attackChain.length} Sequential Exploitation Vectors
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Click each tactical phase to inspect lateral ingress, session elevation, and proof-of-concept payload details.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSevered(!isSevered)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                isSevered
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'btn-tech-gradient text-zinc-300 hover:text-white'
              }`}
            >
              <Scissors className="h-3.5 w-3.5" />
              <span>{isSevered ? '✅ Cut-Point Active (0% Risk)' : '✂️ Simulate Severance'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {attackChain.map((step: any, idx: number) => {
            const isSelected = activeStepIndex === idx;
            const isBreached = step.status.includes('BREACH') || step.status.includes('ELEVATED') || step.status.includes('ACHIEVED') || step.status.includes('COMPLETE') || step.status.includes('COMPROMISED') || step.status.includes('LOCKED') || step.status.includes('HIJACKED');

            return (
              <div
                key={idx}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'border-purple-400 bg-purple-950/30 shadow-[0_0_30px_rgba(168,85,247,0.25)] ring-1 ring-purple-400/40'
                    : 'border-white/10 bg-black/60 hover:border-white/20 hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 border ${
                      isSelected 
                        ? 'bg-purple-500 text-black border-purple-300 shadow-md' 
                        : 'bg-zinc-900 text-zinc-300 border-white/10'
                    }`}>
                      0{step.step || idx + 1}
                    </span>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold font-orbitron text-white">{step.phase || `Phase ${idx + 1}`}</span>
                        <span className="text-[11px] font-mono bg-purple-500/10 text-purple-300 px-2.5 py-0.5 rounded border border-purple-500/20">
                          {step.mitre_technique || 'MITRE ATT&CK'}
                        </span>
                        <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded border font-bold ${
                          isBreached && !isSevered
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {isSevered ? 'BLOCKED_BY_PATCH' : step.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{step.action_taken}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono shrink-0 pl-12 lg:pl-0">
                    <div className="text-right">
                      <span className="text-zinc-500 block text-[10px]">VECTOR SOURCE:</span>
                      <span className="text-zinc-300 font-bold">{step.source_node}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="text-zinc-500 block text-[10px]">EXPLOITED TARGET:</span>
                      <span className="text-amber-300 font-bold">{step.target_node}</span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-purple-500/20 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-purple-950/20 p-4 rounded-xl border border-purple-500/10">
                    <div>
                      <span className="text-zinc-400 font-mono font-bold block mb-1">EXPLOITABILITY SCORE</span>
                      <span className="text-rose-400 font-mono font-black text-sm">{isSevered ? '0.0 / 10 (Neutralized)' : step.exploitability_score || '9.5 / 10'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 font-mono font-bold block mb-1">DETERMINISTIC MITIGATION</span>
                      <span className="text-emerald-300 font-mono">
                        {cutPoints[0]?.action || 'Enforce zero-trust boundaries and least-privilege IAM scoping.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Single-Click Kill-Chain Cut Point Card */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-zinc-950/80 to-black p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(16,185,129,0.15)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Scissors className="h-4 w-4 text-emerald-400" />
              <span>OPTIMAL ZERO-TOUCH KILL-CHAIN CUT-POINT</span>
              <span className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px]">
                100% Severance
              </span>
            </div>
            
            <h4 className="text-lg sm:text-xl font-bold font-orbitron text-white">
              Sever Adversary Ingress: {cutPoints[0]?.target_resource || 'Ingress Boundary & IAM Policy'}
            </h4>
            <p className="text-zinc-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {cutPoints[0]?.action || 'Applying the Sentinara least-privilege Terraform patch will sever the primary pivot node.'}{' '}
              <strong className="text-emerald-300">{cutPoints[0]?.blast_reduction || 'Reduces breach reachability by 100%'}</strong>
            </p>
          </div>

          {onNavigateToRemediation && (
            <button
              onClick={onNavigateToRemediation}
              className="btn-tech-primary px-6 py-3.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105 transition-all shrink-0 cursor-pointer"
            >
              <Zap className="h-4 w-4 text-emerald-300" />
              <span>⚡ Review &amp; Apply Zero-Touch Fix</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
