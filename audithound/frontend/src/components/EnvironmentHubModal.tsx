import React, { useState } from 'react';
import { EnvironmentSummary } from '../types/audit';
import { X, Layers, Search, ShieldAlert, CheckCircle2, Cloud, Server, Box, ArrowRight } from 'lucide-react';
import { SentinaraLogo } from './SentinaraLogo';

interface EnvironmentHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  environments: EnvironmentSummary[];
  selectedEnvId: string;
  onSelectEnv: (envId: string) => void;
}

export const EnvironmentHubModal: React.FC<EnvironmentHubModalProps> = ({
  isOpen,
  onClose,
  environments,
  selectedEnvId,
  onSelectEnv,
}) => {
  const [filterProvider, setFilterProvider] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const filtered = environments.filter((env) => {
    const matchesProvider = filterProvider === 'ALL' || env.cloud_provider === filterProvider;
    const matchesSearch =
      env.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.classification.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProvider && matchesSearch;
  });

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'AWS':
        return <Cloud className="h-4 w-4 text-white" />;
      case 'Azure':
        return <Server className="h-4 w-4 text-cyan-400" />;
      case 'Kubernetes':
        return <Box className="h-4 w-4 text-emerald-400" />;
      default:
        return <Layers className="h-4 w-4 text-purple-400" />;
    }
  };

  const getGradePill = (classification: string) => {
    if (classification.includes('Production') || classification.includes('Compliant')) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
          <CheckCircle2 className="h-3 w-3" /> GRADE A (COMPLIANT)
        </span>
      );
    }
    if (classification.includes('Staging') || classification.includes('Fintech')) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-400">
          <ShieldAlert className="h-3 w-3" /> GRADE D (VIOLATIONS)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-400 animate-pulse">
        <ShieldAlert className="h-3 w-3" /> GRADE F (EXPLOIT PATH)
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto font-tech">
      <div className="flex h-full max-h-[90vh] w-full max-w-6xl flex-col rounded-3xl border border-white/15 bg-black/95 p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] pb-5 gap-4">
          <div className="flex items-center gap-3">
            <SentinaraLogo size="sm" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-orbitron text-white tracking-wide">
                  CLOUD SCENARIO COMMAND HUB
                </h2>
                <span className="rounded-md bg-white/10 border border-white/20 px-2 py-0.5 text-[9px] font-mono font-bold text-zinc-300">
                  10 ENVIRONMENTS
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                Select from 10 realistic multi-cloud scenarios ranging from zero-trust compliant to active root breach vectors.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-tech-gradient rounded-xl p-2 text-zinc-400 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            {['ALL', 'AWS', 'Azure', 'Kubernetes', 'Hybrid'].map((prov) => (
              <button
                key={prov}
                onClick={() => setFilterProvider(prov)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                  filterProvider === prov
                    ? 'btn-tech-primary shadow-lg'
                    : 'btn-tech-gradient text-zinc-400 hover:text-white'
                }`}
              >
                {prov}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search scenario or attack vector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 pl-9 pr-4 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:border-white focus:outline-none"
            />
          </div>
        </div>

        {/* 3D Glass Environments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto p-1 py-4 flex-1">
          {filtered.map((env) => {
            const isSelected = env.id === selectedEnvId;

            return (
              <div
                key={env.id}
                onClick={() => {
                  onSelectEnv(env.id);
                  onClose();
                }}
                className={`group relative cursor-pointer rounded-2xl p-5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between border ${
                  isSelected
                    ? 'border-white/60 bg-zinc-900/90 shadow-2xl ring-1 ring-white/30'
                    : 'border-white/[0.08] bg-zinc-950/60 hover:border-white/30 hover:bg-zinc-900/40'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black border border-white/15">
                        {getProviderIcon(env.cloud_provider)}
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-300">
                        {env.cloud_provider}
                      </span>
                    </div>
                    {getGradePill(env.classification)}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-white group-hover:text-zinc-200 transition-colors line-clamp-2">
                    {env.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed font-sans">
                    {env.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between">
                  <span className="text-[9px] font-mono text-zinc-500 truncate max-w-[150px]">
                    {env.classification}
                  </span>

                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-white group-hover:translate-x-1 transition-transform">
                    <span>{isSelected ? 'ACTIVE' : 'AUDIT NOW'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
