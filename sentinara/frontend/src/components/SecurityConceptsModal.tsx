import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ShieldCheck,
  Network,
  Bot,
  History,
  Radio,
  Zap,
  CheckCircle2,
  Layers,
  Terminal,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { SentinaraLogo } from './SentinaraLogo';

interface SecurityConceptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: 'overview' | 'graph' | 'findings' | 'remediation' | 'purple_team' | 'drift' | 'ebpf') => void;
  onOpenEnvHub?: () => void;
  onOpenReport?: () => void;
}

export const SecurityConceptsModal: React.FC<SecurityConceptsModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenEnvHub,
  onOpenReport,
}) => {
  const [activeCategory, setActiveCategory] = useState<'concepts' | 'frameworks' | 'scoring' | 'tutorials' | 'api'>('concepts');

  if (!isOpen) return null;

  const coreConcepts = [
    {
      id: 'cspm',
      title: '1. Cloud Security Posture Management (CSPM)',
      badge: 'FOUNDATION',
      color: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300',
      icon: ShieldCheck,
      summary: 'Automated continuous assessment and remediation of security risks, misconfigurations, and compliance drifts across multi-cloud environments (AWS, Azure, GCP, Kubernetes).',
      details: [
        'Unlike traditional static file scanners, CSPM monitors live cloud control planes, identity permissions, network routing tables, and storage buckets.',
        'Prevents cloud leaks, accidental public ingress (0.0.0.0/0), and account takeovers before adversaries can exploit them.',
        'Continuously reconciles active cloud state against established benchmarks (SOC2, CIS, HIPAA, PCI-DSS).'
      ]
    },
    {
      id: 'attack-graphs',
      title: '2. Attack Path Graphs & Privilege Escalation',
      badge: 'GRAPH THEORY',
      color: 'border-rose-500/30 bg-rose-950/20 text-rose-300',
      icon: Network,
      summary: 'Directed mathematical graphs G = (V, E) mapping cloud assets as vertices and actionable trust/network/IAM relationships as edges to detect multi-hop lateral traversal paths to root.',
      details: [
        'iam:PassRole Exploits: Allows a developer or service principal to assign high-privilege roles (like AdministratorAccess) to new compute instances (EC2/Lambda).',
        'iam:CreatePolicyVersion: Enables authoring new default policy versions granting {"Action": "*", "Resource": "*"}, bypassing least privilege.',
        'iam:AttachUserPolicy / iam:AttachRolePolicy: Direct attachment of full administrative managed policies.',
        'Wildcard Permissions (Action: *): Violates SOC2 CC6.3 by giving unchecked permissions across all cloud APIs.'
      ]
    },
    {
      id: 'purple-team',
      title: '3. Autonomous AI Purple-Teaming & Breach Simulation',
      badge: 'ADVERSARY SIMULATION',
      color: 'border-purple-500/30 bg-purple-950/20 text-purple-300',
      icon: Bot,
      summary: 'Convergence of Red Team adversarial traversal simulation and Blue Team automated posture hardening to mathematically determine blast radius and sever attack paths.',
      details: [
        'Simulates threat actors (e.g., APT-29 / Midnight Blizzard, Scattered Spider) against your live cloud graph topology.',
        'Blast Radius Formula: (|Descendants(G, Entry Node)| + 1) / |V| * 100% calculating exact reachable cloud infrastructure.',
        'Target Crown Jewels: Customer PII Data Lakes, Kubernetes Control Planes, Master KMS Encryption Keys, and Cloud Root Admin.',
        'Kill-Chain Cut-Points: Pinpoints the single security group rule or IAM permission whose revocation drops breach probability to 0%.'
      ]
    },
    {
      id: 'drift-radar',
      title: '4. Temporal Infrastructure Drift & Provenance',
      badge: 'FORENSICS',
      color: 'border-blue-500/30 bg-blue-950/20 text-blue-300',
      icon: History,
      summary: 'Tracking divergence between declared Infrastructure-as-Code (Terraform) baselines and out-of-band manual changes made in cloud web consoles or emergency CLI sessions.',
      details: [
        'T0 Genesis Baseline: Verified golden state deployed via CI/CD pipeline (Score: ~98/100, Grade A+).',
        'T1 Feature Expansion: Additions of microservices and storage nodes with minor credential aging (Score: ~84/100, Grade B).',
        'T2 Out-of-Band Drift: Emergency manual console changes introducing 0.0.0.0/0 ingress and wildcard IAM roles (Score: ~46/100, Grade F).',
        'T3 Remediated Enclave: Post-Sentinara zero-touch auto-patch state restoring least privilege (Score: ~99/100, Grade A+).',
        'Forensic Attribution: Captures triggering actor ARN, commit hash, CloudTrail digest, and net score degradation.'
      ]
    },
    {
      id: 'ebpf-telemetry',
      title: '5. eBPF Runtime Packet Telemetry & Threat Correlation',
      badge: 'KERNEL RUNTIME',
      color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
      icon: Radio,
      summary: 'Sandboxed Linux kernel-level bytecode execution to capture raw socket flows and correlate runtime C2 beacons with static cloud IAM vulnerabilities.',
      details: [
        'Kernel JIT Kprobes: Attaches non-intrusively to sys_enter_connect(), tcp_v4_connect(), and security_socket_bind().',
        'Real-time Threat Correlation: Maps suspicious outbound C2 beacons directly to vulnerable IAM roles and attack paths.',
        'Zero-Overhead Observability: Sub-millisecond runtime packet inspection without kernel modules or agent crashes.'
      ]
    },
    {
      id: 'zero-touch',
      title: '6. 1-Click Zero-Touch Auto-Remediation & GitOps Defense',
      badge: 'AUTOMATION',
      color: 'border-teal-500/30 bg-teal-950/20 text-teal-300',
      icon: Zap,
      summary: 'Automated generation and deployment of least-privilege Infrastructure-as-Code (Terraform) patches with dry-run verification and instant cryptographic rollback.',
      details: [
        'Synthetic Plan Verification: Compiles non-destructive HCL code and validates schema compatibility before applying.',
        'Cryptographic State Lock: Creates a state digest snapshot to prevent race conditions during execution.',
        'Instant Rollback Checkpoint: Generates a signed rollback token (rbk-xxxx) enabling one-click reversion.'
      ]
    }
  ];

  const complianceFrameworks = [
    {
      framework: 'SOC 2 Type II Common Criteria',
      controls: [
        { code: 'CC6.1', title: 'Logical Access Controls', desc: 'Restricts logical access to registered users; mandates Multi-Factor Authentication (MFA) on all console and API accounts.' },
        { code: 'CC6.3', title: 'Least Privilege & RBAC', desc: 'Restricts administrative privileges to authorized roles; strictly forbids wildcard (*) permissions and dangerous iam:PassRole vectors.' },
        { code: 'CC6.6', title: 'Boundary Protection & Ingress', desc: 'Prevents direct unconstrained public internet exposure (0.0.0.0/0) on management ports (SSH 22, RDP 3389, DB 3306).' },
        { code: 'CC6.7', title: 'Data Transmission Security', desc: 'Enforces server-side AES-256 / KMS encryption-at-rest on S3 data lakes and TLS 1.3 encryption-in-transit.' },
        { code: 'CC6.8', title: 'Threat Detection & Anomaly Prevention', desc: 'Enforces continuous monitoring, logging (CloudTrail / Flow Logs), and runtime threat anomaly prevention.' }
      ]
    },
    {
      framework: 'CIS Foundations Benchmarks',
      controls: [
        { code: 'CIS AWS v3.0', title: 'IAM, Logging & S3 Benchmarks', desc: 'Hardware MFA for root, strict password policies, CloudTrail multi-region logging, and S3 Public Access Block.' },
        { code: 'CIS Azure v2.0', title: 'NSG & RBAC Benchmarks', desc: 'Restricts Azure Network Security Group ingress, privileged role assignments, and storage account shared keys.' },
        { code: 'CIS K8s v1.8', title: 'Cluster Security & RBAC', desc: 'Prohibits binding default ServiceAccounts to cluster-admin and mandates namespace network policies.' }
      ]
    },
    {
      framework: 'MITRE ATT&CK Cloud Matrix',
      controls: [
        { code: 'T1190', title: 'Exploit Public-Facing Application', desc: 'Initial access via exposed security group ingress or public S3 ACLs.' },
        { code: 'T1078.004', title: 'Valid Accounts: Cloud Accounts', desc: 'Compromise via stale unrotated access keys or disabled MFA.' },
        { code: 'T1068', title: 'Exploitation for Privilege Escalation', desc: 'Escalation via iam:PassRole and Kubernetes ClusterRoleBindings.' },
        { code: 'T1530', title: 'Data from Cloud Storage Object', desc: 'Exfiltration of unauthenticated S3 GetObject data streams.' },
        { code: 'T1048', title: 'Exfiltration Over Alternative Protocol', desc: 'Egress exfiltration detected via live eBPF socket streams.' }
      ]
    }
  ];

  const tutorials = [
    {
      step: '01',
      title: 'Ingesting Cloud Configurations',
      desc: 'Use pre-built benchmark scenarios (Fintech Banking, CryptoMiner Breach, Health DataLake) or upload a custom cloud JSON export to run static graph analysis in <200ms.',
      action: () => {
        onClose();
        if (onOpenEnvHub) onOpenEnvHub();
      },
      actionText: 'Open Scenarios'
    },
    {
      step: '02',
      title: 'Interpreting the Executive Scorecard',
      desc: 'Review the 0–100 Posture Score, letter grade (A+ to F), SOC2/CIS compliance pass rates, and prioritized board-ready executive risk summaries.',
      action: () => {
        onClose();
        if (onNavigateToTab) onNavigateToTab('overview');
      },
      actionText: 'View Scorecard'
    },
    {
      step: '03',
      title: 'Analyzing Multi-Hop Attack Graphs',
      desc: 'Inspect interactive Cytoscape.js directed graphs. Track flashing red edges showing step-by-step lateral traversal from unprivileged compute to Cloud Root.',
      action: () => {
        onClose();
        if (onNavigateToTab) onNavigateToTab('graph');
      },
      actionText: 'Open Graph'
    },
    {
      step: '04',
      title: 'Executing Autonomous AI Purple-Team Simulations',
      desc: 'Simulate adversary campaigns (Ransomware Lockdown, Data Exfiltration, K8s Takeover). Review blast radius %, kill-chain logs, and optimal cut-points.',
      action: () => {
        onClose();
        if (onNavigateToTab) onNavigateToTab('purple_team');
      },
      actionText: 'Run Simulation'
    },
    {
      step: '05',
      title: 'Forensic Investigation with Temporal Drift Radar',
      desc: 'Scrub through epochs T0 (Genesis Baseline) to T2 (Drift) and T3 (Remediated). Pinpoint actor ARN, commit hash, and score degradation.',
      action: () => {
        onClose();
        if (onNavigateToTab) onNavigateToTab('drift');
      },
      actionText: 'Inspect Drift'
    },
    {
      step: '06',
      title: 'Intercepting Live eBPF Kernel Telemetry',
      desc: 'Monitor real-time Linux 6.8 kernel JIT socket hooks (sys_enter_connect). Correlate suspicious C2 traffic with static IAM vulnerabilities.',
      action: () => {
        onClose();
        if (onNavigateToTab) onNavigateToTab('ebpf');
      },
      actionText: 'View Telemetry'
    },
    {
      step: '07',
      title: 'Deploying 1-Click Zero-Touch Terraform Patches',
      desc: 'Run dry-run synthetic plans or 1-click apply least-privilege HCL patches. Instant cryptographic rollback token ensures operational safety.',
      action: () => {
        onClose();
        if (onNavigateToTab) onNavigateToTab('remediation');
      },
      actionText: 'View Patches'
    },
    {
      step: '08',
      title: 'Generating Auditor-Certified CISO Reports',
      desc: 'Export formal executive audit summaries with official auditor sign-off blocks, framework scorecards, and complete Terraform appendices for PDF printing.',
      action: () => {
        onClose();
        if (onOpenReport) onOpenReport();
      },
      actionText: 'View CISO Report'
    },
    {
      step: '09',
      title: 'Integrating GitHub Action PR Security Sentinel',
      desc: 'Automate PR scanning via .github/workflows/sentinara-sentinel.yml to block critical IAM privilege escalation before deployment.',
      action: undefined,
      actionText: undefined
    },
    {
      step: '10',
      title: 'Running the Standalone CLI Scanner & Live AWS Collector',
      desc: 'Execute sentinara_cli.py on local JSON dumps or use aws_live_collector.py to snapshot live AWS IAM, S3, and Security Groups.',
      action: undefined,
      actionText: undefined
    }
  ];

  const apiEndpoints = [
    { method: 'GET', route: '/', desc: 'Health check, engine status, and supported framework list.' },
    { method: 'GET', route: '/api/environments', desc: 'Catalog of available cloud environments and metadata.' },
    { method: 'GET', route: '/api/environments/{env_id}', desc: 'Fetches raw cloud configuration JSON dump.' },
    { method: 'POST', route: '/api/environments/upload', desc: 'Ingests custom user-uploaded cloud JSON dump.' },
    { method: 'GET', route: '/api/audit/{env_id}', desc: 'Executes compliance rules and attack path analysis.' },
    { method: 'POST', route: '/api/audit/custom', desc: 'Audits an in-memory custom JSON payload.' },
    { method: 'GET', route: '/api/remediation/environment/{env_id}', desc: 'Generates batch Terraform least-privilege patches.' },
    { method: 'GET', route: '/api/remediation/download/{env_id}', desc: 'Downloads combined .tf remediation file.' },
    { method: 'GET', route: '/api/reports/html/{env_id}', desc: 'Generates auditor-certified standalone CISO HTML report.' },
    { method: 'POST', route: '/api/advanced/purple-team/simulate', desc: '🤖 Simulates adversary kill-chain & computes blast radius %.' },
    { method: 'GET', route: '/api/advanced/drift/timeline/{env_id}', desc: '⏱️ Returns 4-epoch temporal drift evolution & score deltas.' },
    { method: 'POST', route: '/api/advanced/telemetry/stream', desc: '📡 Generates synthetic Linux 6.8 eBPF socket stream.' },
    { method: 'POST', route: '/api/advanced/remediation/zero-touch', desc: '⚡ Executes 1-click zero-touch cloud auto-remediation.' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 sm:p-6 font-tech overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl border border-white/20 bg-zinc-950/95 shadow-[0_0_80px_rgba(255,255,255,0.15)] overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-black px-6 py-4">
          <div className="flex items-center gap-3">
            <SentinaraLogo size="xs" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black font-orbitron text-white">
                  CYBERSECURITY CONCEPTS & OPERATOR GUIDE
                </h3>
                <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/30">
                  OFFICIAL KNOWLEDGE BASE
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Comprehensive Reference for CSPM, Attack Path Graphs, Frameworks & Zero-Touch Defense
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

        {/* Category Navigation Bar */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] bg-zinc-900/60 px-6 py-2.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveCategory('concepts')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-mono font-bold transition whitespace-nowrap ${
              activeCategory === 'concepts'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Core Concepts (6)</span>
          </button>

          <button
            onClick={() => setActiveCategory('frameworks')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-mono font-bold transition whitespace-nowrap ${
              activeCategory === 'frameworks'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>SOC2 & CIS Frameworks</span>
          </button>

          <button
            onClick={() => setActiveCategory('scoring')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-mono font-bold transition whitespace-nowrap ${
              activeCategory === 'scoring'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Scoring Algorithm</span>
          </button>

          <button
            onClick={() => setActiveCategory('tutorials')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-mono font-bold transition whitespace-nowrap ${
              activeCategory === 'tutorials'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>10 Operator Tutorials</span>
          </button>

          <button
            onClick={() => setActiveCategory('api')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-mono font-bold transition whitespace-nowrap ${
              activeCategory === 'api'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>API Endpoints</span>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 space-y-6 overflow-y-auto bg-black/60 flex-1">
          {/* TAB 1: CORE CONCEPTS */}
          {activeCategory === 'concepts' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold font-orbitron text-white">
                    CORE CLOUD SECURITY DEFINITIONS & MECHANICS
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono">
                    Essential concepts governing Sentinara's automated static graph and dynamic runtime analysis.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coreConcepts.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-2xl border ${item.color} bg-black/60 backdrop-blur-md space-y-3 shadow-lg hover:border-white/40 transition`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-white/10 border border-white/20 text-white">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-400">
                            {item.badge}
                          </span>
                        </div>
                      </div>

                      <h5 className="text-sm font-bold font-orbitron text-white leading-snug">
                        {item.title}
                      </h5>

                      <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                        {item.summary}
                      </p>

                      <div className="pt-2 border-t border-white/10 space-y-1.5">
                        {item.details.map((d, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px] text-zinc-400 font-mono">
                            <span className="text-cyan-400">&bull;</span>
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: COMPLIANCE & FRAMEWORKS */}
          {activeCategory === 'frameworks' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10">
                <h4 className="text-sm font-bold font-orbitron text-white">
                  COMPLIANCE FRAMEWORKS & STANDARDIZED BENCHMARKS
                </h4>
                <p className="text-xs text-zinc-400 font-mono">
                  Sentinara automatically aligns all cloud topology discoveries with recognized cybersecurity standards.
                </p>
              </div>

              <div className="space-y-6">
                {complianceFrameworks.map((fw, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                      <h5 className="text-sm font-bold font-orbitron text-white flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>{fw.framework}</span>
                      </h5>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {fw.controls.length} Automated Controls
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {fw.controls.map((ctrl, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-1.5 hover:border-white/20 transition"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-cyan-300">
                              {ctrl.code}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 font-semibold">
                              {ctrl.title}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                            {ctrl.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SCORING ALGORITHM */}
          {activeCategory === 'scoring' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-zinc-900/80 border border-white/15 space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-cyan-400" />
                  <h4 className="text-sm font-bold font-orbitron text-white">
                    DETERMINISTIC POSTURE SCORING ALGORITHM
                  </h4>
                </div>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  Sentinara calculates an objective 0–100 Security Posture Index based on detected finding severities, privilege escalation paths, and lateral reachability:
                </p>

                <div className="p-4 rounded-xl bg-black border border-cyan-500/40 font-mono text-xs text-cyan-300 text-center font-bold tracking-wide shadow-inner">
                  Posture Score = max(15, 100 - (22 × N_Critical) - (12 × N_High) - (5 × N_Medium))
                </div>
              </div>

              {/* Grading Table */}
              <div className="rounded-2xl border border-white/10 bg-zinc-900/40 overflow-hidden shadow-xl">
                <div className="px-5 py-3 border-b border-white/10 bg-black flex items-center justify-between">
                  <span className="text-xs font-bold font-orbitron text-white">
                    AUDITOR LETTER GRADE SCALE & RISK MATRICES
                  </span>
                </div>
                <div className="divide-y divide-white/10">
                  <div className="p-4 flex items-center justify-between bg-emerald-950/20">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                        A+ (90–100)
                      </span>
                      <span className="text-xs font-mono font-bold text-white">Low / Compliant</span>
                    </div>
                    <p className="text-xs text-zinc-400 font-sans max-w-md text-right">
                      Golden baseline enclave; 0 critical attack paths; SOC2 & CIS benchmarks fully satisfied.
                    </p>
                  </div>

                  <div className="p-4 flex items-center justify-between bg-zinc-900/20">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-600 text-xs font-mono font-bold">
                        B (80–89)
                      </span>
                      <span className="text-xs font-mono font-bold text-white">Moderate Risk</span>
                    </div>
                    <p className="text-xs text-zinc-400 font-sans max-w-md text-right">
                      Low risk; minor credential aging or non-blocking policy warning.
                    </p>
                  </div>

                  <div className="p-4 flex items-center justify-between bg-amber-950/20">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
                        C (70–79)
                      </span>
                      <span className="text-xs font-mono font-bold text-white">Elevated Risk</span>
                    </div>
                    <p className="text-xs text-zinc-400 font-sans max-w-md text-right">
                      Multiple medium-severity findings; missing encryption or ingress scope alerts.
                    </p>
                  </div>

                  <div className="p-4 flex items-center justify-between bg-rose-950/20">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold">
                        D (50–69)
                      </span>
                      <span className="text-xs font-mono font-bold text-white">High Risk</span>
                    </div>
                    <p className="text-xs text-zinc-400 font-sans max-w-md text-right">
                      High-risk IAM privileges or exposed public database ports identified.
                    </p>
                  </div>

                  <div className="p-4 flex items-center justify-between bg-rose-950/40">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl bg-rose-600/30 text-rose-400 border border-rose-500 text-xs font-mono font-bold animate-pulse">
                        F (0–49)
                      </span>
                      <span className="text-xs font-mono font-bold text-rose-300">Critical Breach Path</span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans max-w-md text-right font-medium">
                      Active multi-hop breach path to cloud root; immediate remediation required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 10 OPERATOR TUTORIALS */}
          {activeCategory === 'tutorials' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold font-orbitron text-white">
                    STEP-BY-STEP OPERATOR & USER TUTORIALS
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono">
                    End-to-end operational guide for security teams, DevOps engineers, and CISOs.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {tutorials.map((tut) => (
                  <div
                    key={tut.step}
                    className="p-4 rounded-2xl bg-zinc-900/50 border border-white/10 space-y-3 hover:border-white/30 transition shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-mono font-black border border-cyan-500/30">
                          {tut.step}
                        </span>
                        <h5 className="text-xs font-bold font-orbitron text-white">
                          {tut.title}
                        </h5>
                      </div>
                      <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                        {tut.desc}
                      </p>
                    </div>

                    {tut.action && (
                      <div className="pt-2 border-t border-white/[0.08]">
                        <button
                          onClick={tut.action}
                          className="btn-tech-primary px-3.5 py-1.5 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-sm hover:scale-105 transition"
                        >
                          <span>{tut.actionText}</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: API REFERENCE */}
          {activeCategory === 'api' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10">
                <h4 className="text-sm font-bold font-orbitron text-white">
                  REST API & FASTAPI ENDPOINTS REFERENCE
                </h4>
                <p className="text-xs text-zinc-400 font-mono">
                  Full programmatic API reference for CI/CD integrations and automated cloud posture polling.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-900/40 overflow-hidden shadow-xl">
                <div className="divide-y divide-white/10">
                  {apiEndpoints.map((ep, i) => (
                    <div key={i} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/[0.02] transition">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          ep.method === 'GET' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                          'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          {ep.method}
                        </span>
                        <span className="text-white font-bold">{ep.route}</span>
                      </div>
                      <span className="text-xs text-zinc-400 font-sans">{ep.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-white/[0.08] bg-black px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span>Official Guide:</span>
            <span className="text-white font-bold">SECURITY CONCEPTS AND USER GUIDE.md</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="btn-tech-primary px-5 py-2 rounded-xl text-xs font-mono font-bold shadow-lg hover:scale-105 transition"
            >
              Close & Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
