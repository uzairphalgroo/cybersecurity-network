import React, { useState } from 'react';
import { TerraformPatch } from '../types/audit';
import { Copy, Check, Download, FileCode, ShieldCheck, Terminal } from 'lucide-react';
import { getDownloadTerraformUrl } from '../services/api';

interface RemediationWorkbenchProps {
  patches: TerraformPatch[];
  environmentId: string;
  selectedFindingId?: string | null;
}

export const RemediationWorkbench: React.FC<RemediationWorkbenchProps> = ({
  patches,
  environmentId,
  selectedFindingId,
}) => {
  const [activePatchIndex, setActivePatchIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  React.useEffect(() => {
    if (selectedFindingId) {
      const idx = patches.findIndex((p) => p.finding_id === selectedFindingId);
      if (idx !== -1) {
        setActivePatchIndex(idx);
      }
    }
  }, [selectedFindingId, patches]);

  const currentPatch = patches[activePatchIndex] || patches[0];

  const handleCopy = () => {
    if (!currentPatch) return;
    navigator.clipboard.writeText(currentPatch.remediated_terraform_hcl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    if (!currentPatch) return;
    const blob = new Blob([currentPatch.remediated_terraform_hcl], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentPatch.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!patches || patches.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/80 p-12 text-center text-zinc-400 font-tech">
        <ShieldCheck className="mx-auto h-12 w-12 text-white mb-3" />
        <h4 className="text-base font-orbitron font-bold text-white">ALL CONTROLS COMPLIANT</h4>
        <p className="text-xs text-zinc-400 mt-1 font-mono">
          Zero vulnerabilities detected. Environment matches least-privilege standards.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-black/85 backdrop-blur-2xl shadow-2xl overflow-hidden font-tech">
      {/* Workbench Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] p-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-white" />
            <h3 className="text-base font-orbitron font-bold text-white">
              AUTONOMOUS TERRAFORM REMEDIATION
            </h3>
            <span className="rounded-md bg-white/10 border border-white/20 px-2 py-0.5 text-xs font-mono font-bold text-zinc-200">
              {patches.length} PATCHES
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Declarative least-privilege Infrastructure-as-Code patches ready for GitOps CI/CD pipelines.
          </p>
        </div>

        {/* Batch Download Button */}
        <a
          href={getDownloadTerraformUrl(environmentId)}
          download
          className="btn-tech-primary flex items-center gap-2.5 rounded-2xl px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
        >
          <Download className="h-4 w-4" />
          Download All .tf Patches (Bundle)
        </a>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
        {/* Left Patches Selector */}
        <div className="lg:col-span-4 border-r border-white/[0.08] bg-black/40 p-4 space-y-2.5 overflow-y-auto max-h-[620px]">
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500 px-1">
            GENERATED HCL PATCHES
          </span>
          {patches.map((patch, idx) => {
            const isSelected = idx === activePatchIndex;

            return (
              <button
                key={patch.finding_id}
                onClick={() => setActivePatchIndex(idx)}
                className={`w-full text-left rounded-2xl p-3.5 text-xs transition-all border font-tech ${
                  isSelected
                    ? 'border-white/50 bg-zinc-900 text-white shadow-xl ring-1 ring-white/20'
                    : 'border-white/[0.06] bg-zinc-950/60 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[11px] text-zinc-200 font-bold truncate max-w-[180px]">
                    {patch.file_name}
                  </span>
                  <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[9px] text-zinc-400 font-mono">
                    {patch.rule_id}
                  </span>
                </div>
                <div className="font-semibold truncate text-zinc-100 font-sans">{patch.title}</div>
                <div className="mt-1 text-[10px] text-zinc-500 font-mono truncate">
                  Target: {patch.resource_type}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Patch Details & Code Viewer */}
        <div className="lg:col-span-8 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Patch Title & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-white" />
                  <h4 className="text-sm font-bold font-mono text-white">{currentPatch.file_name}</h4>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 font-sans">{currentPatch.title}</p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleCopy}
                  className="btn-tech-gradient flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold text-zinc-200 hover:text-white shadow-sm"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied HCL!' : 'Copy HCL'}</span>
                </button>

                <button
                  onClick={handleDownloadSingle}
                  className="btn-tech-gradient flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold text-zinc-200 hover:text-white shadow-sm"
                >
                  <Download className="h-4 w-4 text-zinc-400" />
                  <span>Download .tf</span>
                </button>
              </div>
            </div>

            {/* Rationale Box */}
            <div className="rounded-2xl border border-white/10 bg-zinc-950/90 p-4">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-400">
                SECURITY ENGINEERING RATIONALE
              </span>
              <p className="mt-1 text-xs text-zinc-300 leading-relaxed font-sans">{currentPatch.rationale}</p>
            </div>

            {/* Side by side state summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3">
                <span className="font-bold text-rose-400 text-[10px] uppercase">VULNERABLE STATE</span>
                <p className="mt-1 text-[11px] text-zinc-300 break-all">{currentPatch.original_config_snippet}</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-zinc-900/60 p-3">
                <span className="font-bold text-white text-[10px] uppercase">REMEDIATED STATE</span>
                <p className="mt-1 text-[11px] text-zinc-300">Enforces least-privilege & zero-trust boundaries</p>
              </div>
            </div>

            {/* Terraform HCL Code Box */}
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-400 mb-2 block">
                DECLARATIVE TERRAFORM PATCH (HCL)
              </span>
              <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-[#050505] p-5 font-mono text-xs text-zinc-200 leading-relaxed shadow-inner max-h-[380px]">
                <code>{currentPatch.remediated_terraform_hcl}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
