import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Lock, Scale } from 'lucide-react';
import { SentinaraLogo } from './SentinaraLogo';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy' | 'security';
  defaultTab?: 'terms' | 'privacy' | 'security';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
  defaultTab,
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'security'>(defaultTab || initialTab);

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
    else if (initialTab) setActiveTab(initialTab);
  }, [defaultTab, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 sm:p-6 font-tech overflow-y-auto safe-top safe-bottom">
      <div className="relative w-full max-w-4xl rounded-3xl border border-white/20 bg-zinc-950/95 shadow-[0_0_80px_rgba(255,255,255,0.15)] overflow-hidden flex flex-col my-auto max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-black px-6 py-4">
          <div className="flex items-center gap-3">
            <SentinaraLogo size="xs" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black font-orbitron text-white">
                  LEGAL &amp; SECURITY COMPLIANCE TERMS
                </h3>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/30">
                  ENTERPRISE CERTIFIED
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Terms of Service, Privacy Policy, and Responsible Vulnerability Disclosure
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-tech-gradient rounded-xl p-2 text-zinc-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] bg-zinc-900/60 px-6 py-2.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition whitespace-nowrap ${
              activeTab === 'terms'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Privacy Policy (GDPR / CCPA)</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold transition whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Security &amp; Disclosure</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto bg-black/60 flex-1 text-xs text-zinc-300 font-sans leading-relaxed">
          {/* TAB 1: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold font-orbitron text-white">
                    SENTINARA TERMS OF SERVICE
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Last Updated: September 20, 2026 &bull; Enterprise SaaS Governance
                  </p>
                </div>
              </div>

                <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs flex items-start gap-2.5">
                  <span className="font-mono font-bold text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded text-[10px] shrink-0 uppercase">Open Source</span>
                  <p className="leading-snug text-zinc-300">
                    <strong className="text-white">Independent Open Source Notice:</strong> Sentinara is an independent open-source cybersecurity project and is not affiliated with, sponsored by, or part of any commercial company having a similar or identical name.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-white font-orbitron text-xs">1. Acceptance of Terms</h5>
                    <p>
                      By accessing or using Sentinara, including our cloud dashboard, command-line interface (<code className="text-cyan-300 font-mono">sentinara_cli</code>), API endpoints, and GitHub Action security gates, you agree to be bound by these Terms of Service.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h5 className="font-bold text-white font-orbitron text-xs">2. Scope of Service &amp; Zero-Storage Architecture</h5>
                    <p>
                      Sentinara provides automated CSPM evaluation, multi-hop mathematical attack graph generation, AI purple-teaming adversarial simulation, and 1-click Terraform least-privilege patch generation. Static graph evaluation executes in-memory with zero persistent retention of customer payload data.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h5 className="font-bold text-white font-orbitron text-xs">3. Synthetic Dry-Run &amp; Cryptographic Rollback</h5>
                    <p>
                      All automated remediation patches provide synthetic dry-run verification and generate cryptographically signed rollback tokens (<code className="text-emerald-300 font-mono">rbk-xxxx</code>) ensuring operational safety and immediate reversion capabilities.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h5 className="font-bold text-white font-orbitron text-xs">4. Prohibited Uses</h5>
                    <p>
                      You agree NOT to use Sentinara to probe or scan cloud environments without explicit written authorization, or attempt to extract proprietary engine algorithms.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h5 className="font-bold text-white font-orbitron text-xs">5. Limitation of Liability</h5>
                    <p>
                      Sentinara is provided on an "AS IS" basis. While our deterministic algorithms rigorously identify known compliance violations (SOC 2, CIS, MITRE ATT&amp;CK), cybersecurity requires defense-in-depth across all organizational layers.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold font-orbitron text-white">
                    PRIVACY POLICY (GDPR &amp; CCPA COMPLIANCE)
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Zero-Payload Data Principle &bull; Client-Side In-Memory Evaluation
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h5 className="font-bold text-white font-orbitron text-xs">1. Zero-Payload Principle</h5>
                  <p>
                    Sentinara inspects cloud topology metadata only (IAM role ARNs, security group CIDR ingress, S3 permission flags). We do NOT access, inspect, download, or store the internal business contents of your database records or application memory.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-white font-orbitron text-xs">2. In-Memory Ephemeral Execution</h5>
                  <p>
                    Uploaded cloud JSON configurations are evaluated ephemerally in browser sandbox or isolated container memory with zero long-term storage or third-party transmission.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-white font-orbitron text-xs">3. Cryptographic Security</h5>
                  <p>
                    All API communications enforce TLS 1.3 encryption-in-transit. Configuration caches are protected with AES-256 encryption-at-rest.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-white font-orbitron text-xs">4. No Data Monetization</h5>
                  <p>
                    Sentinara never sells, rents, or monetizes your infrastructure topology or telemetry data.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY & DISCLOSURE */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold font-orbitron text-white">
                    RESPONSIBLE VULNERABILITY DISCLOSURE
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Security Architecture &bull; 24-Hour Acknowledgment SLA
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h5 className="font-bold text-white font-orbitron text-xs">Reporting Security Issues</h5>
                  <p>
                    If you discover a vulnerability in the Sentinara engine or CLI scanner, please email full technical details to <code className="text-cyan-300 font-mono">security@sentinara.io</code>. Our team will acknowledge receipt within 24 hours.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold text-white font-orbitron text-xs">Core Security Controls</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10 space-y-1">
                      <span className="font-mono text-cyan-300 font-bold text-[11px]">SOC 2 CC6.1 &amp; CC6.3</span>
                      <p className="text-[11px] text-zinc-400">Strict MFA verification &amp; least-privilege RBAC enforcement.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10 space-y-1">
                      <span className="font-mono text-purple-300 font-bold text-[11px]">eBPF Kernel Safety</span>
                      <p className="text-[11px] text-zinc-400">Sandboxed Linux JIT probes running with 0% kernel module hazard.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.08] bg-black px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span>Official Policy:</span>
            <span className="text-white font-bold">TERMS_OF_SERVICE.md &bull; PRIVACY_POLICY.md</span>
          </div>

          <button
            onClick={onClose}
            className="btn-tech-primary px-5 py-2 rounded-xl text-xs font-mono font-bold shadow-lg hover:scale-105 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
