import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CyberMatrixCanvas } from './components/CyberMatrixCanvas';
import { LiveThreatTicker } from './components/LiveThreatTicker';
import { ExecutiveScorecard } from './components/ExecutiveScorecard';
import { AttackGraphViewer } from './components/AttackGraphViewer';
import { FindingsTable } from './components/FindingsTable';
import { RemediationWorkbench } from './components/RemediationWorkbench';
import { UploadModal } from './components/UploadModal';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import { EnvironmentHubModal } from './components/EnvironmentHubModal';
import { HowToUseModal } from './components/HowToUseModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuditHoundLogo } from './components/AuditHoundLogo';
import { fetchEnvironments, runAudit } from './services/api';
import { EnvironmentSummary, AuditResponse, Finding } from './types/audit';
import { LayoutDashboard, Network, AlertTriangle, Wrench, Loader2, Layers, ShieldCheck, ShieldAlert, HelpCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [environments, setEnvironments] = useState<EnvironmentSummary[]>([]);
  const [selectedEnvId, setSelectedEnvId] = useState<string>('02_crypto_miner_breach');
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'findings' | 'remediation'>('overview');
  const [selectedFindingIdForRemediation, setSelectedFindingIdForRemediation] = useState<string | null>(null);

  // Welcome Screen state
  const [showWelcome, setShowWelcome] = useState<boolean>(true);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isEnvHubOpen, setIsEnvHubOpen] = useState<boolean>(false);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState<boolean>(false);

  // Initial load: environments
  useEffect(() => {
    async function loadCatalog() {
      try {
        const envs = await fetchEnvironments();
        setEnvironments(envs);
        if (envs.length > 0) {
          const defaultEnv = envs.find((e) => e.id === '02_crypto_miner_breach') || envs[0];
          setSelectedEnvId(defaultEnv.id);
          triggerAudit(defaultEnv.id);
        }
      } catch (err) {
        console.error('Failed to load environments:', err);
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const triggerAudit = async (envId: string, forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await runAudit(envId, forceRefresh);
      setAuditData(data);
    } catch (err) {
      console.error('Audit run failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEnv = (envId: string) => {
    setSelectedEnvId(envId);
    triggerAudit(envId);
  };

  const handleAuditComplete = (customAudit: AuditResponse) => {
    setEnvironments((prev) => {
      const exists = prev.some((e) => e.id === customAudit.environment_id);
      if (exists) return prev;
      return [
        {
          id: customAudit.environment_id,
          name: customAudit.environment_name,
          cloud_provider: customAudit.provider,
          description: customAudit.executive_summary || 'Custom uploaded cloud configuration dump.',
          created_at: customAudit.timestamp,
          classification: 'Custom Assessment',
          tier: 'Uploaded Environment',
          file_name: `${customAudit.environment_id}.json`
        },
        ...prev
      ];
    });
    setAuditData(customAudit);
    setSelectedEnvId(customAudit.environment_id);
    setActiveTab('overview');
  };

  const handleSelectFindingForRemediation = (finding: Finding) => {
    setSelectedFindingIdForRemediation(finding.id);
    setActiveTab('remediation');
  };

  return (
    <div className="relative min-h-screen bg-[#000000] text-zinc-100 flex flex-col font-tech selection:bg-white selection:text-black overflow-x-hidden">
      {/* Ferrari-Style 3D Showcase & Scroll Welcome Screen */}
      {showWelcome && (
        <WelcomeScreen
          onEnter={() => setShowWelcome(false)}
        />
      )}

      {/* Monochrome Cyber Matrix Particle Background */}
      <CyberMatrixCanvas />

      {/* Top Navbar */}
      <Navbar
        environments={environments}
        selectedEnvId={selectedEnvId}
        onSelectEnv={handleSelectEnv}
        onRefreshAudit={() => triggerAudit(selectedEnvId, true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenEnvHub={() => setIsEnvHubOpen(true)}
        onOpenWelcome={() => setShowWelcome(true)}
        onOpenHowToUse={() => setIsHowToUseOpen(true)}
        auditData={auditData}
        loading={loading}
      />

      {/* Live Threat Intelligence Radar Ticker */}
      <LiveThreatTicker />

      {/* Main Container */}
      <main className="relative z-10 mx-auto flex-1 w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-8">
        {/* Quick 1-Click Environment Pill Carousel in dedicated Glass Bar */}
        {environments.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl p-3 shadow-xl">
            <div className="flex items-center gap-2.5 overflow-x-auto py-1 px-1 scrollbar-none">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-zinc-300 shrink-0 flex items-center gap-1.5 px-2">
                <Layers className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                <span>SCENARIOS:</span>
              </span>
              {environments.map((env) => {
                const isSelected = env.id === selectedEnvId;
                const isCompliant = env.id.includes('banking') || env.id.includes('aerospace');

                return (
                  <button
                    key={env.id}
                    onClick={() => handleSelectEnv(env.id)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-bold whitespace-nowrap transition-all duration-300 border shadow-md ${
                      isSelected
                        ? 'border-white bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105'
                        : 'border-white/[0.08] bg-black/80 text-zinc-400 hover:border-white/30 hover:text-white hover:bg-zinc-900/80'
                    }`}
                  >
                    {isCompliant ? (
                      <ShieldCheck className={`h-4 w-4 ${isSelected ? 'text-emerald-700' : 'text-emerald-400'}`} />
                    ) : (
                      <ShieldAlert className={`h-4 w-4 ${isSelected ? 'text-rose-700' : 'text-rose-400'}`} />
                    )}
                    <span>{env.name.split(' (')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Environment Title & Sub-header with Brittle Moving RGB Gradient */}
        {auditData && (
          <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/[0.08] pb-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-zinc-900 border border-white/20 px-3 py-1 text-[11px] font-mono font-black text-white uppercase tracking-widest shadow-sm">
                  {auditData.provider} CLOUD
                </span>
                <h2 className="text-2xl sm:text-4xl font-black font-orbitron tracking-wide text-gradient-rgb-brittle">
                  {auditData.environment_name}
                </h2>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 font-mono flex items-center gap-3">
                <span>Timestamp: {new Date(auditData.timestamp).toLocaleString()}</span>
                <span>&bull;</span>
                <span>Scope: IAM / RBAC / S3 ACL / NSG Ingress</span>
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsHowToUseOpen(true)}
                className="btn-tech-gradient px-5 py-2.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 text-zinc-200 hover:text-white shadow-md hover:scale-105 transition-all"
              >
                <HelpCircle className="h-4 w-4 text-cyan-400" />
                <span>Beginner Guide</span>
              </button>

              <button
                onClick={() => setIsEnvHubOpen(true)}
                className="btn-tech-primary px-6 py-2.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
              >
                <Layers className="h-4 w-4" />
                <span>Scenario Hub</span>
              </button>
            </div>
          </div>
        )}

        {/* Cyber Navigation Tabs with Generous Padding */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-1">
          <nav className="flex flex-wrap gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2.5 rounded-2xl py-3 px-5 sm:px-6 text-xs sm:text-sm font-mono font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.4)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Executive Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('graph')}
              className={`flex items-center gap-2.5 rounded-2xl py-3 px-5 sm:px-6 text-xs sm:text-sm font-mono font-bold transition-all ${
                activeTab === 'graph'
                  ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.4)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Network className="h-4 w-4" />
              <span>Privilege Escalation Graph</span>
              {auditData?.graph_data?.attack_paths?.length ? (
                <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                  activeTab === 'graph' ? 'bg-black text-rose-400 border-black' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                }`}>
                  {auditData.graph_data.attack_paths.length}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab('findings')}
              className={`flex items-center gap-2.5 rounded-2xl py-3 px-5 sm:px-6 text-xs sm:text-sm font-mono font-bold transition-all ${
                activeTab === 'findings'
                  ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.4)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Compliance Findings</span>
              {auditData?.findings?.length ? (
                <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                  activeTab === 'findings' ? 'bg-black text-zinc-100 border-black' : 'bg-zinc-800 text-zinc-300 border-white/10'
                }`}>
                  {auditData.findings.length}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab('remediation')}
              className={`flex items-center gap-2.5 rounded-2xl py-3 px-5 sm:px-6 text-xs sm:text-sm font-mono font-bold transition-all ${
                activeTab === 'remediation'
                  ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.4)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wrench className="h-4 w-4" />
              <span>Terraform Patches</span>
              {auditData?.remediation_patches?.length ? (
                <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                  activeTab === 'remediation' ? 'bg-black text-zinc-100 border-black' : 'bg-white/10 text-white border-white/20'
                }`}>
                  {auditData.remediation_patches.length}
                </span>
              ) : null}
            </button>
          </nav>
        </div>

        {/* Main Tab Content Display */}
        {loading && !auditData ? (
          <div className="flex h-96 flex-col items-center justify-center space-y-4 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl">
            <Loader2 className="h-10 w-10 animate-spin text-white" />
            <p className="text-sm text-zinc-400 font-mono tracking-widest uppercase animate-pulse">
              Synthesizing Multi-Cloud Security Graphs & Compliance Telemetry...
            </p>
          </div>
        ) : !auditData ? (
          <div className="rounded-3xl border border-white/10 bg-black/60 p-12 text-center">
            <p className="text-zinc-400 font-mono">No audit data available. Please select or upload an environment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <ExecutiveScorecard
                  score={auditData.posture_score}
                  environmentName={auditData.environment_name}
                  provider={auditData.provider}
                  attackChainsCount={auditData.graph_data?.attack_paths?.length || 0}
                />

                {/* Quick Previews of Graph and Top Findings */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <AttackGraphViewer
                      graphData={auditData.graph_data}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-sm font-bold font-orbitron text-white">TOP FINDINGS</h3>
                      <button
                        onClick={() => setActiveTab('findings')}
                        className="text-xs font-mono text-zinc-400 hover:text-white"
                      >
                        View all ({auditData.findings.length}) &rarr;
                      </button>
                    </div>
                    <div className="space-y-3">
                      {auditData.findings.slice(0, 4).map((f) => (
                        <div
                          key={f.id}
                          className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 hover:border-white/30 transition cursor-pointer shadow-md"
                          onClick={() => setActiveTab('findings')}
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-mono font-bold text-white">{f.id}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              f.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              f.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-zinc-800 text-zinc-300'
                            }`}>
                              {f.severity}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 font-mono line-clamp-1">{f.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Attack Graph Tab */}
            {activeTab === 'graph' && (
              <div className="space-y-4">
                <AttackGraphViewer
                  graphData={auditData.graph_data}
                />
              </div>
            )}

            {/* 3. Findings Table Tab */}
            {activeTab === 'findings' && (
              <div className="space-y-4">
                <FindingsTable
                  findings={auditData.findings}
                  onSelectFindingForRemediation={handleSelectFindingForRemediation}
                />
              </div>
            )}

            {/* 4. Remediation Workbench Tab */}
            {activeTab === 'remediation' && (
              <div className="space-y-4">
                <RemediationWorkbench
                  patches={auditData.remediation_patches}
                  environmentId={auditData.environment_id}
                  selectedFindingId={selectedFindingIdForRemediation}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-black/90 backdrop-blur-md py-6 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AuditHoundLogo size="xs" showText={true} />
          </div>
          <div className="text-zinc-500 text-[11px]">
            Autonomous Cloud Security Sentinel &bull; SOC2 / CIS Benchmarks &bull; Terraform Remediation
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <button
              onClick={() => setIsHowToUseOpen(true)}
              className="hover:text-white transition flex items-center gap-1.5"
            >
              <span>🐶 How To Use Guide</span>
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setShowWelcome(true)}
              className="hover:text-white transition"
            >
              3D Showcase
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setIsEnvHubOpen(true)}
              className="hover:text-white transition"
            >
              Scenario Matrix
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAuditComplete={handleAuditComplete}
      />

      <EnvironmentHubModal
        isOpen={isEnvHubOpen}
        onClose={() => setIsEnvHubOpen(false)}
        environments={environments}
        selectedEnvId={selectedEnvId}
        onSelectEnv={handleSelectEnv}
      />

      <HowToUseModal
        isOpen={isHowToUseOpen}
        onClose={() => setIsHowToUseOpen(false)}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          setIsHowToUseOpen(false);
        }}
        onOpenEnvHub={() => setIsEnvHubOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {auditData && (
        <ExecutiveReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          auditData={auditData}
        />
      )}
    </div>
  );
};
