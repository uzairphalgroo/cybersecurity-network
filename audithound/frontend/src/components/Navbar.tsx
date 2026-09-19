import React from 'react';
import { Upload, FileText, RefreshCw, Layers, Sparkles } from 'lucide-react';
import { EnvironmentSummary, AuditResponse } from '../types/audit';
import { AuditHoundLogo } from './AuditHoundLogo';

interface NavbarProps {
  environments: EnvironmentSummary[];
  selectedEnvId: string;
  onSelectEnv: (envId: string) => void;
  onRefreshAudit: () => void;
  onOpenUpload: () => void;
  onOpenReport: () => void;
  onOpenEnvHub: () => void;
  onOpenWelcome?: () => void;
  onOpenHowToUse?: () => void;
  onResetToUpload?: () => void;
  auditData: AuditResponse | null;
  loading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  environments,
  selectedEnvId,
  onSelectEnv,
  onRefreshAudit,
  onOpenUpload,
  onOpenReport,
  onOpenEnvHub,
  onOpenWelcome,
  onOpenHowToUse,
  onResetToUpload,
  auditData,
  loading,
}) => {
  const getGradeBadge = (grade: string) => {
    if (grade.startsWith('A')) return 'text-emerald-300 bg-emerald-950/40 border-emerald-500/40 shadow-emerald-500/10';
    if (grade.startsWith('B')) return 'text-zinc-200 bg-zinc-900 border-zinc-700 shadow-zinc-500/10';
    if (grade.startsWith('C')) return 'text-amber-300 bg-amber-950/40 border-amber-500/40 shadow-amber-500/10';
    return 'text-rose-400 bg-rose-950/40 border-rose-500/40 shadow-rose-500/20 animate-pulse';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-black/90 backdrop-blur-2xl shadow-2xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
        {/* Left Section: Brand Logo */}
        <div className="flex items-center min-w-[180px] lg:min-w-[220px]">
          <div 
            onClick={() => {
              if (onResetToUpload) onResetToUpload();
              else if (onOpenWelcome) onOpenWelcome();
            }}
            className="cursor-pointer group flex items-center transition-transform hover:scale-[1.02]"
            title="Click to return to Upload / Initial Dashboard"
          >
            <AuditHoundLogo size="sm" showText={true} />
          </div>
        </div>

        {/* Center Section: Centered Scenario & Posture Controls */}
        <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 px-2">
          {/* Scenario Hub Matrix Launcher */}
          <button
            onClick={onOpenEnvHub}
            className="btn-tech-gradient px-4 py-2 rounded-xl text-xs font-mono font-bold text-white flex items-center gap-2 shadow-md transition-all hover:scale-105"
            title="Open 3D Scenario Matrix Hub"
          >
            <Layers className="h-3.5 w-3.5 text-cyan-300 animate-pulse" />
            <span className="font-orbitron tracking-wide hidden sm:inline">Scenario Hub</span>
            <span className="font-orbitron sm:hidden">Hub</span>
            <span className="rounded-md bg-white/10 px-1.5 py-0.2 text-[9px] font-mono text-zinc-300 border border-white/15">
              {environments.length || 10}
            </span>
          </button>

          {/* Environment Selector Dropdown */}
          <div className="relative hidden md:block max-w-[240px]">
            <select
              value={selectedEnvId}
              onChange={(e) => {
                if (e.target.value) onSelectEnv(e.target.value);
                else if (onResetToUpload) onResetToUpload();
              }}
              className="w-full appearance-none rounded-xl border border-white/15 bg-zinc-900/90 py-1.5 pl-3 pr-8 text-xs font-mono font-medium text-zinc-200 shadow-inner hover:border-white/30 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition truncate"
            >
              <option value="" className="bg-zinc-950 text-zinc-400 py-1">
                -- Choose Benchmark Scenario --
              </option>
              {environments.map((env) => (
                <option key={env.id} value={env.id} className="bg-zinc-950 text-zinc-200 py-1">
                  {env.name} ({(env.cloud_provider || 'AWS').toUpperCase()})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400">
              <span className="text-[10px]">&blacktriangledown;</span>
            </div>
          </div>

          {/* Current Score Tag */}
          {auditData?.posture_score && (
            <div className={`hidden lg:flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-mono font-bold ${getGradeBadge(auditData.posture_score.letter_grade)}`}>
              <span>{auditData.posture_score.letter_grade}</span>
              <span className="text-zinc-500">|</span>
              <span>{auditData.posture_score.overall_score}/100</span>
            </div>
          )}
        </div>

        {/* Right Section: Compact Utilities & Action Buttons */}
        <div className="flex items-center justify-end gap-2 sm:gap-2.5 min-w-[180px] lg:min-w-[220px]">
          {/* Small, Compact "How To Use" Button */}
          {onOpenHowToUse && (
            <button
              onClick={onOpenHowToUse}
              className="btn-tech-gradient px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 border border-cyan-500/25 transition-all hover:scale-105 shadow-sm"
              title="Open Easy 5-Year-Old Security Guide"
            >
              <span className="text-xs">🐶</span>
              <span className="font-mono text-cyan-300">Guide</span>
            </button>
          )}

          {/* Refresh Action */}
          <button
            onClick={onRefreshAudit}
            disabled={loading}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white/15 hover:text-white hover:border-white/25 transition disabled:opacity-50"
            title="Re-run Compliance Audit"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-white' : ''}`} />
          </button>

          {/* Upload Custom JSON */}
          <button
            onClick={onOpenUpload}
            className="btn-tech-gradient hidden xl:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-mono font-bold text-white shadow-sm"
          >
            <Upload className="h-3 w-3 text-zinc-300" />
            <span>Upload JSON</span>
          </button>

          {/* Executive Report Button */}
          <button
            onClick={onOpenReport}
            disabled={!auditData}
            className="btn-tech-primary flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-mono font-bold shadow-md disabled:opacity-40 hover:scale-105 transition-all"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Executive</span> Report
          </button>

          {/* 3D Showcase Button */}
          {onOpenWelcome && (
            <button
              onClick={onOpenWelcome}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition"
              title="Open 3D Showcase"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
