import React, { useState, useEffect } from 'react';
import { AuditResponse } from '../types/audit';
import { fetchTemporalDriftTimeline } from '../services/api';

interface TemporalDriftRadarProps {
  auditData: AuditResponse | null;
  onNavigateToRemediation?: () => void;
}

export const TemporalDriftRadar: React.FC<TemporalDriftRadarProps> = ({ auditData, onNavigateToRemediation }) => {
  const [timelineData, setTimelineData] = useState<any>(null);
  const [selectedEpochIndex, setSelectedEpochIndex] = useState<number>(2); // Default to T2 (Drift)
  const [revertState, setRevertState] = useState<'idle' | 'reverting' | 'reverted'>('idle');

  useEffect(() => {
    async function loadDrift() {
      try {
        const data = await fetchTemporalDriftTimeline(auditData?.environment_id || '01_fintech_prod_banking');
        setTimelineData(data);
      } catch (err) {
        console.error('Error fetching drift timeline:', err);
      }
    }
    loadDrift();
  }, [auditData?.environment_id]);

  const timeline = timelineData?.timeline || [
    {
      snapshot_id: 'SNAP-T0-BASELINE',
      epoch_id: 'T0',
      timestamp: '30 days ago (Initial Genesis)',
      label: 'T0: Golden Hardened Baseline',
      posture_score: 98.0,
      letter_grade: 'A+',
      total_findings: 0,
      risk_rating: 'Compliant',
      author: 'Terraform Production GitOps Gate',
      commit_hash: 'c8a1e49',
      summary: 'Initial deployment with SOC2 CC6.1 least privilege, encrypted buckets, and private VPC ingress.',
      changes: [{ type: 'ADDED', resource: 'iam_role:BaseAppRole', details: 'Scoped read-only policies' }],
      active_attack_paths: 0
    },
    {
      snapshot_id: 'SNAP-T1-FEATURE-DEPLOY',
      epoch_id: 'T1',
      timestamp: '14 days ago (Sprint Release 4.2)',
      label: 'T1: Cloud Microservices Scale-Up',
      posture_score: 84.0,
      letter_grade: 'B',
      total_findings: 1,
      risk_rating: 'Moderate',
      author: 'devops-lead@enterprise.internal',
      commit_hash: '4f92d10',
      summary: 'Added Kubernetes worker nodes and storage lakes. Secondary access keys created without rotation.',
      changes: [{ type: 'MODIFIED', resource: 'security_group:app-backend-sg', details: 'Allowed internal port 8080' }],
      active_attack_paths: 0
    },
    {
      snapshot_id: 'SNAP-T2-DRIFT-ALERT',
      epoch_id: 'T2',
      timestamp: '2 days ago (Current State)',
      label: 'T2: Configuration Drift & Critical Exposure',
      posture_score: auditData?.posture_score.overall_score || 46.0,
      letter_grade: auditData?.posture_score.letter_grade || 'F',
      total_findings: auditData?.findings.length || 3,
      risk_rating: auditData?.posture_score.risk_rating || 'Critical',
      author: 'emergency-hotfix-session (AWS Web Console)',
      commit_hash: 'e12a938',
      summary: 'Out-of-band console changes bypassed CI/CD sentinel, introducing wildcard IAM permissions and open 0.0.0.0/0 ingress.',
      changes: [
        { type: 'DRIFT_CRITICAL', resource: 'iam_policy:AdministratorAccess', details: 'Wildcard Action * attached to role' },
        { type: 'DRIFT_HIGH', resource: 'security_group:db-ingress', details: '0.0.0.0/0 ingress opened on port 22/3306' }
      ],
      active_attack_paths: 1
    },
    {
      snapshot_id: 'SNAP-T3-REMEDIATED',
      epoch_id: 'T3',
      timestamp: 'Target State (Sentinara Patched)',
      label: 'T3: Remediated Least-Privilege Enclave',
      posture_score: 99.0,
      letter_grade: 'A+',
      total_findings: 0,
      risk_rating: 'Hardened',
      author: 'Sentinara Autonomous Remediation Sentinel',
      commit_hash: 'remediated-hcl-applied',
      summary: 'Automated 1-click zero-touch patch applied; IAM policies scoped and ingress rules locked to VPC CIDRs.',
      changes: [
        { type: 'REMEDIATED', resource: 'aws_iam_policy:scoped_least_privilege', details: 'Scoped action list' },
        { type: 'REMEDIATED', resource: 'aws_security_group_rule:vpc_restricted', details: 'Restricted CIDR 10.0.0.0/16' }
      ],
      active_attack_paths: 0
    }
  ];

  const currentEpoch = timeline[selectedEpochIndex] || timeline[0];

  const handleRevert = () => {
    setRevertState('reverting');
    setTimeout(() => {
      setRevertState('reverted');
      setSelectedEpochIndex(0);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-slate-900/80 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                ⏱️ Temporal Time-Travel Radar
              </span>
              <span className="text-xs text-slate-400 font-mono">Continuous Forensic Drift Scrubber</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-2 flex items-center gap-2">
              Cloud Infrastructure Temporal Drift & Regression Radar
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Travel backward and forward across your cloud's evolutionary timeline to pinpoint exact out-of-band drift events, quantify score degradation deltas, and roll back to golden baseline enclaves.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRevert}
              disabled={revertState === 'reverting' || selectedEpochIndex === 0}
              className={`px-5 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all flex items-center gap-2 border cursor-pointer ${
                revertState === 'reverted'
                  ? 'bg-emerald-600 border-emerald-400 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 border-blue-400/40 text-white disabled:opacity-40'
              }`}
            >
              {revertState === 'reverting' ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Reverting State...</span>
                </>
              ) : revertState === 'reverted' ? (
                <span>✓ Reverted to T0 Baseline</span>
              ) : (
                <span>⏪ Revert Drift to T0 Baseline</span>
              )}
            </button>
          </div>
        </div>

        {/* Horizontal Timeline Scrubber */}
        <div className="mt-8 pt-6 border-t border-blue-500/20">
          <div className="relative">
            {/* Connecting Track Line */}
            <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-800 -translate-y-1/2 z-0"></div>
            <div
              className="absolute top-1/2 left-4 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${(selectedEpochIndex / (timeline.length - 1)) * 96}%` }}
            ></div>

            {/* Epoch Nodes */}
            <div className="grid grid-cols-4 gap-2 relative z-10">
              {timeline.map((epoch: any, idx: number) => {
                const isSelected = selectedEpochIndex === idx;
                return (
                  <button
                    key={epoch.snapshot_id}
                    onClick={() => {
                      setSelectedEpochIndex(idx);
                      setRevertState('idle');
                    }}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-lg ${
                        isSelected
                          ? 'bg-blue-500 text-white ring-4 ring-blue-500/30 scale-110'
                          : idx === 0
                          ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-800'
                          : idx === 2
                          ? 'bg-rose-900/80 text-rose-300 border border-rose-500/40 hover:bg-rose-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {epoch.epoch_id}
                    </div>
                    <span
                      className={`text-xs font-semibold mt-2 text-center transition-colors ${
                        isSelected ? 'text-blue-300' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {epoch.epoch_id}
                    </span>
                    <span className="text-[10px] text-slate-400 text-center line-clamp-1 hidden md:block">
                      Score: {epoch.posture_score}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Epoch Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Snapshot Card */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">
                  {currentEpoch.epoch_id}
                </span>
                <span className="text-xs text-slate-400">{currentEpoch.timestamp}</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">{currentEpoch.label}</h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-400">Security Score</div>
                <div
                  className={`text-2xl font-black font-mono ${
                    currentEpoch.posture_score >= 85
                      ? 'text-emerald-400'
                      : currentEpoch.posture_score >= 70
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {currentEpoch.posture_score}/100 ({currentEpoch.letter_grade})
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">{currentEpoch.summary}</p>

          {/* Configuration Changes / Diffs */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Forensic Configuration Diffs & Attributions
            </h4>
            <div className="space-y-2">
              {currentEpoch.changes.map((ch: any, i: number) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    ch.type.includes('CRITICAL')
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                      : ch.type.includes('HIGH')
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                      : ch.type === 'REMEDIATED'
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        ch.type.includes('CRITICAL')
                          ? 'bg-rose-500 text-white'
                          : ch.type.includes('HIGH')
                          ? 'bg-amber-500 text-slate-950'
                          : ch.type === 'REMEDIATED'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {ch.type}
                    </span>
                    <span className="font-mono text-slate-200">{ch.resource}</span>
                  </div>
                  <span className="text-slate-400 text-right">{ch.details}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Forensic Provenance */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-5">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>🔍 Forensic Provenance</span>
          </h4>

          <div className="space-y-4 text-xs">
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Author / Triggering Actor</span>
              <span className="text-slate-200 font-mono font-semibold">{currentEpoch.author}</span>
            </div>

            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Git Commit / CloudTrail Digest</span>
              <span className="text-purple-300 font-mono font-semibold">{currentEpoch.commit_hash}</span>
            </div>

            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Net Drift Score Impact</span>
              <span
                className={`font-mono font-bold text-sm ${
                  selectedEpochIndex === 2 ? 'text-rose-400' : selectedEpochIndex === 3 ? 'text-emerald-400' : 'text-slate-300'
                }`}
              >
                {selectedEpochIndex === 2 ? '-48.0 Points (Critical Regression)' : selectedEpochIndex === 3 ? '+52.0 Points (Remediated)' : '0.0 (Golden Baseline)'}
              </span>
            </div>

            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Root-Cause Attribution</span>
              <span className="text-amber-300 leading-snug">
                Manual Out-of-Band Console Session bypassing the CI/CD GitOps Sentinel Gate.
              </span>
            </div>

            {onNavigateToRemediation && (
              <button
                onClick={onNavigateToRemediation}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                ⚡ Review Fixes in Workbench
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
