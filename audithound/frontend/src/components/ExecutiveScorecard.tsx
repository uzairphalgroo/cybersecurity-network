import React, { useEffect } from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Cpu, Layers, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import { PostureScore } from '../types/audit';
import confetti from 'canvas-confetti';

interface ExecutiveScorecardProps {
  score: PostureScore;
  environmentName?: string;
  provider?: string;
  attackChainsCount: number;
}

export const ExecutiveScorecard: React.FC<ExecutiveScorecardProps> = ({
  score,
  environmentName,
  provider,
  attackChainsCount,
}) => {
  // Trigger confetti if Grade A / Compliant
  useEffect(() => {
    if (score.letter_grade.startsWith('A') && score.overall_score >= 90) {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.2 },
        colors: ['#ffffff', '#a855f7', '#06b6d4', '#e4e4e7'],
      });
    }
  }, [score.letter_grade, score.overall_score]);

  const getScoreBorder = (val: number) => {
    if (val >= 85) return 'border-white/20 shadow-white/5 bg-gradient-to-b from-zinc-900/60 to-black/90';
    if (val >= 70) return 'border-amber-500/30 shadow-amber-500/10 bg-gradient-to-b from-amber-950/30 to-black/90';
    return 'border-rose-500/30 shadow-rose-500/10 bg-gradient-to-b from-rose-950/30 to-black/90';
  };

  return (
    <div className="space-y-6 font-tech">
      {/* Main 3D Holographic Posture Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Holographic Posture Orb Card */}
        <div
          className={`lg:col-span-4 rounded-3xl border p-6 backdrop-blur-2xl shadow-2xl transition-all duration-500 relative overflow-hidden glass-tech-hover ${getScoreBorder(
            score.overall_score
          )}`}
        >
          {/* Ambient Corner Glow */}
          <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                <Layers className="h-3.5 w-3.5 text-zinc-300" />
                <span>{provider || 'Cloud'} // {environmentName || 'Target'}</span>
              </div>
              <h3 className="text-lg font-bold font-orbitron text-white tracking-wide flex items-center gap-2 mt-0.5">
                <span>POSTURE INDEX</span>
                <Sparkles className="h-4 w-4 text-zinc-400 animate-pulse" />
              </h3>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-mono font-black uppercase tracking-wider ${
                score.risk_rating === 'Low'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : score.risk_rating === 'Moderate' || score.risk_rating === 'Elevated'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
              }`}
            >
              {score.risk_rating} Risk
            </span>
          </div>

          <div className="flex items-center justify-center gap-6 py-3">
            {/* 3D Circular Radar Gauge */}
            <div className="relative flex h-36 w-36 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-zinc-900 animate-ping opacity-20" />

              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-zinc-800"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-white transition-all duration-1000 ease-out"
                  strokeWidth="7"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * score.overall_score) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black font-orbitron tracking-tight text-white">
                  {score.overall_score}
                </span>
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                  INDEX / 100
                </span>
              </div>
            </div>

            <div className="space-y-1 text-left">
              <div className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-widest">
                AUDITOR GRADE
              </div>
              <div className="text-5xl font-black font-orbitron text-white tracking-wider text-gradient-silver">
                {score.letter_grade}
              </div>
              <div className="text-xs text-zinc-300 font-mono flex items-center gap-1.5 pt-1">
                <Zap className="h-3.5 w-3.5 text-zinc-400" />
                <span>{score.total_findings} Policy Findings</span>
              </div>
            </div>
          </div>

          {/* Primary Factor Strip */}
          <div className="mt-4 pt-3 border-t border-white/[0.08]">
            <span className="text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400">
              PRIMARY FACTOR
            </span>
            <p className="mt-1 text-xs font-semibold text-zinc-300 line-clamp-2 leading-relaxed">
              {score.top_risks[0]}
            </p>
          </div>
        </div>

        {/* 4 Severity Metrics & Framework Radar */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Critical */}
          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 shadow-xl glass-tech-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-rose-400 uppercase tracking-wider">Critical</span>
              <AlertOctagon className="h-5 w-5 text-rose-400" />
            </div>
            <div className="mt-2 text-3xl font-black font-orbitron text-rose-400">
              {score.severity_breakdown.CRITICAL}
            </div>
            <p className="mt-1 text-[11px] font-mono text-zinc-400">Active exploit paths</p>
          </div>

          {/* High */}
          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 shadow-xl glass-tech-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-wider">High</span>
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="mt-2 text-3xl font-black font-orbitron text-amber-400">
              {score.severity_breakdown.HIGH}
            </div>
            <p className="mt-1 text-[11px] font-mono text-zinc-400">SOC2 CC6 control breach</p>
          </div>

          {/* Med / Low */}
          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 shadow-xl glass-tech-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-zinc-200 uppercase tracking-wider">Med / Low</span>
              <ShieldCheck className="h-5 w-5 text-zinc-300" />
            </div>
            <div className="mt-2 text-3xl font-black font-orbitron text-white">
              {score.severity_breakdown.MEDIUM + score.severity_breakdown.LOW}
            </div>
            <p className="mt-1 text-[11px] font-mono text-zinc-400">Hygiene & credential age</p>
          </div>

          {/* Attack Chains */}
          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 shadow-xl glass-tech-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-zinc-200 uppercase tracking-wider">Attack Chains</span>
              <Cpu className="h-5 w-5 text-purple-400" />
            </div>
            <div className="mt-2 text-3xl font-black font-orbitron text-white">{attackChainsCount}</div>
            <p className="mt-1 text-[11px] font-mono text-zinc-400">Multi-hop privilege paths</p>
          </div>

          {/* Framework Compliance Progress Bars */}
          <div className="sm:col-span-2 lg:col-span-4 rounded-3xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl shadow-2xl glass-tech-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span className="text-xs font-orbitron font-bold uppercase tracking-wider text-white">
                  SOC2 & CIS BENCHMARK POSTURE RADARS
                </span>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {score.framework_scores.length} Controls Evaluated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {score.framework_scores.map((fw) => (
                <div
                  key={fw.framework}
                  className="rounded-2xl bg-zinc-950/90 p-4 border border-white/[0.06] transition-all hover:border-white/20 shadow-inner"
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-zinc-200 truncate pr-2 font-mono text-[11px]">{fw.framework}</span>
                    <span className="font-black font-orbitron text-sm text-white">
                      {fw.score_percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-900 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        fw.score_percentage >= 80
                          ? 'bg-gradient-to-r from-zinc-200 via-white to-zinc-400 shadow-sm shadow-white/40'
                          : fw.score_percentage >= 60
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-300'
                          : 'bg-gradient-to-r from-rose-600 to-red-400'
                      }`}
                      style={{ width: `${fw.score_percentage}%` }}
                    />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>
                      Passed: <strong className="text-white">{fw.passed_checks}</strong> / {fw.total_checks}
                    </span>
                    <span
                      className={`font-black uppercase tracking-wider ${
                        fw.status === 'COMPLIANT'
                          ? 'text-emerald-400'
                          : fw.status === 'WARNING'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {fw.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
