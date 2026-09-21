import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Layers, 
  Network, 
  Wrench, 
  FileText, 
  ShieldCheck, 
  Lightbulb, 
  ArrowRight,
  ShieldAlert,
  Cpu,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SentinaraLogo } from './SentinaraLogo';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: 'overview' | 'graph' | 'findings' | 'remediation') => void;
  onOpenEnvHub?: () => void;
  onOpenReport?: () => void;
  onOpenSecurityConcepts?: () => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenEnvHub,
  onOpenReport,
  onOpenSecurityConcepts,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps = [
    {
      pageNumber: 1,
      title: "1. The Cloud Castle Analogy 🏰",
      subhead: "What is cloud security and why do we audit it?",
      mascotMood: "🐶👋",
      mascotSpeech: "Hi! Think of your AWS or Azure cloud like a giant castle where you keep your most valuable treasures (customer data, credit cards, user passwords). If someone forgets to lock the front door, a sneaky thief can sneak right in!",
      explanation: "Sentinara acts as an autonomous digital guard dog. It scans all your cloud configurations (IAM users, S3 storage buckets, firewalls, and Kubernetes roles) to ensure every single door is locked with military-grade security.",
      bullets: [
        "Cloud environments are made of Users, Storage Buckets, Servers, and Firewalls.",
        "Hackers look for small mistakes like open ports or permissions given to 'Everyone'.",
        "Sentinara continuously checks your castle against official international security laws."
      ],
      actionLabel: "Next: Choose a Castle 👉",
      icon: ShieldCheck,
      color: "from-blue-500/15 via-cyan-500/10 to-transparent",
      borderColor: "border-cyan-500/30",
      pillBg: "bg-cyan-950/60 text-cyan-300 border-cyan-500/40",
      onAction: () => setCurrentStep(1)
    },
    {
      pageNumber: 2,
      title: "2. The 10 Cloud Scenarios 🕹️",
      subhead: "How to test realistic compliant & breached clouds",
      mascotMood: "🐶🏰",
      mascotSpeech: "You don't need real AWS accounts! I built 10 realistic synthetic castles for you. Some are fortress-strong like banking apps, while others are experiencing active ransomware attacks!",
      explanation: "Click 'Scenario Hub' at the top or use the horizontal Scenarios pill bar below the navbar to switch between all 10 mock environments instantly with zero latency.",
      bullets: [
        "🏦 Fintech Prod Banking & Aerospace Defense: Grade A Compliant baseline models.",
        "⚡ CryptoMiner Breach: EC2 instance with PassRole exploit running illegal mining scripts.",
        "🔓 Leaky Health DataLake: Unauthenticated S3 bucket exposing patient records.",
        "☸️ Kubernetes Takeover: Unsegmented namespace with cluster-admin privilege escalation."
      ],
      actionLabel: "Open Scenario Matrix 🚀",
      icon: Layers,
      color: "from-purple-500/15 via-indigo-500/10 to-transparent",
      borderColor: "border-purple-500/30",
      pillBg: "bg-purple-950/60 text-purple-300 border-purple-500/40",
      onAction: () => {
        onClose();
        if (onOpenEnvHub) onOpenEnvHub();
      }
    },
    {
      pageNumber: 3,
      title: "3. 3D Radar & Posture Scorecard 🎯",
      subhead: "How to read security scores (0 to 100)",
      mascotMood: "🐶📊",
      mascotSpeech: "The giant 3D Holographic Gauge gives your castle a letter grade from Grade A+ (Super Safe!) down to Grade F (Active Exploit Path Found!).",
      explanation: "The Posture Score calculates risk by weighting severe vulnerabilities like unrotated admin access keys, open internet ingress (0.0.0.0/0), and privilege escalation paths.",
      bullets: [
        "Overall Score: 100 is flawless security; below 60 requires immediate remediation.",
        "Severity Counters: Tracks CRITICAL (red), HIGH (orange), and MEDIUM (yellow) risks.",
        "Active Attack Chains: Counts how many multi-hop exploit paths exist in the cloud."
      ],
      actionLabel: "View Executive Scorecard 📈",
      icon: Cpu,
      color: "from-emerald-500/15 via-teal-500/10 to-transparent",
      borderColor: "border-emerald-500/30",
      pillBg: "bg-emerald-950/60 text-emerald-300 border-emerald-500/40",
      onAction: () => {
        onClose();
        if (onNavigateToTab) onNavigateToTab('overview');
      }
    },
    {
      pageNumber: 4,
      title: "4. Official Compliance Frameworks 📜",
      subhead: "SOC2 CC6 & CIS Benchmarks Explained",
      mascotMood: "🐶🎓",
      mascotSpeech: "Real companies have to pass strict audits from government regulators! We map every single setting against SOC2 Common Criteria and CIS Benchmarks.",
      explanation: "Framework scores show the percentage of mandatory automated controls your environment passes.",
      bullets: [
        "SOC2 CC6.1 (Logical Access): Checks that access is restricted to authorized identities.",
        "SOC2 CC6.3 (Least Privilege): Verifies users only have permissions they strictly need.",
        "CIS AWS/Azure/K8s Benchmarks: Verifies multi-factor auth (MFA), key rotation, and encryption."
      ],
      actionLabel: "Explore Compliance Checks 📋",
      icon: CheckCircle2,
      color: "from-blue-500/15 via-indigo-500/10 to-transparent",
      borderColor: "border-blue-500/30",
      pillBg: "bg-blue-950/60 text-blue-300 border-blue-500/40",
      onAction: () => {
        onClose();
        if (onNavigateToTab) onNavigateToTab('findings');
      }
    },
    {
      pageNumber: 5,
      title: "5. Privilege Escalation Graph 🗺️⚡",
      subhead: "The visual treasure map of hacker movements",
      mascotMood: "🐶🕸️",
      mascotSpeech: "This is the coolest part! It's an interactive network graph powered by graph theory. The glowing red arrows show how a robber starts from an unprivileged server and jumps step-by-step into full Administrator access!",
      explanation: "Click on the 'Privilege Escalation Graph' tab. You can pan, zoom, drag nodes, and click on any circle (node) to see its full IAM policy document in the side inspector.",
      bullets: [
        "Square/Circle Nodes: Represent EC2 instances, IAM Roles, S3 Buckets, and Users.",
        "Red Flashing Edges: The critical attack vector path (e.g. iam:PassRole + ec2:RunInstances).",
        "Layout Switcher: Switch between Force-Directed (COSE), Breadth-First, and Concentric layouts."
      ],
      actionLabel: "Explore 3D Attack Graph 🕸️",
      icon: Network,
      color: "from-rose-500/15 via-pink-500/10 to-transparent",
      borderColor: "border-rose-500/30",
      pillBg: "bg-rose-950/60 text-rose-300 border-rose-500/40",
      onAction: () => {
        onClose();
        if (onNavigateToTab) onNavigateToTab('graph');
      }
    },
    {
      pageNumber: 6,
      title: "6. Compliance Findings Matrix 🔍",
      subhead: "How to filter, search, and inspect alerts",
      mascotMood: "🐶🔍",
      mascotSpeech: "Every problem found in your cloud is listed here in a clean, searchable matrix. You can filter by Critical, High, Medium, or search for specific ARNs or rule names.",
      explanation: "Click on any finding card to expand it. You will see the full affected resource ID, risk impact, and step-by-step human remediation advisory.",
      bullets: [
        "Search Filter: Type 's3', 'admin', or rule IDs like 'IAM-001' to filter findings instantly.",
        "Severity Badges: Red (Critical Risk), Orange (High Risk), Yellow (Medium Risk).",
        "Direct Fix Button: Click 'View Terraform Patch' to jump straight to the auto-fix!"
      ],
      actionLabel: "Open Findings Matrix 📋",
      icon: ShieldAlert,
      color: "from-amber-500/15 via-yellow-500/10 to-transparent",
      borderColor: "border-amber-500/30",
      pillBg: "bg-amber-950/60 text-amber-300 border-amber-500/40",
      onAction: () => {
        onClose();
        if (onNavigateToTab) onNavigateToTab('findings');
      }
    },
    {
      pageNumber: 7,
      title: "7. Autonomous Terraform Patches 🪄🛠️",
      subhead: "Auto-generate least-privilege Infrastructure-as-Code",
      mascotMood: "🐶🪄",
      mascotSpeech: "Instead of telling you what is broken and leaving you stuck, Sentinara generates ready-to-use Terraform (.tf) code patches that automatically lock all vulnerabilities!",
      explanation: "Go to the 'Terraform Patches' tab. Each patch removes wildcard permissions (*:*) and applies granular resource-level least privilege.",
      bullets: [
        "Side-by-Side Comparison: Shows the Vulnerable State vs. Remediated State.",
        "Copy or Download: Click 'Copy HCL' or 'Download .tf' for individual files.",
        "Batch Bundle: Click 'Download All .tf Patches' to get the full infrastructure remediation package."
      ],
      actionLabel: "Open Terraform Workbench 🛠️",
      icon: Wrench,
      color: "from-indigo-500/15 via-purple-500/10 to-transparent",
      borderColor: "border-indigo-500/30",
      pillBg: "bg-indigo-950/60 text-indigo-300 border-indigo-500/40",
      onAction: () => {
        onClose();
        if (onNavigateToTab) onNavigateToTab('remediation');
      }
    },
    {
      pageNumber: 8,
      title: "8. Executive Report & PDF Export 🏆📄",
      subhead: "Print or download official auditor scorecards",
      mascotMood: "🐶🎓",
      mascotSpeech: "You're now a cloud security master! Click 'Executive Report' in the top bar to generate a publication-ready audit document complete with auditor sign-offs, ready to print or save as PDF.",
      explanation: "The executive report combines your environment's posture score, framework pass rates, critical finding summaries, and official sign-off blocks.",
      bullets: [
        "Print / Save as PDF: Triggers the browser's native print-to-PDF dialog formatted for standard A4/Letter.",
        "Download HTML: Saves a standalone, self-contained .html report file to your computer.",
        "Auditor Sign-off: Includes Lead Security Auditor & CISO Risk Acceptance verification blocks."
      ],
      actionLabel: "Open Executive Report 📑",
      icon: FileText,
      color: "from-emerald-500/15 via-teal-500/10 to-transparent",
      borderColor: "border-emerald-500/30",
      pillBg: "bg-emerald-950/60 text-emerald-300 border-emerald-500/40",
      onAction: () => {
        onClose();
        if (onOpenReport) onOpenReport();
      }
    }
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 sm:p-6 font-tech overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-white/20 bg-black/95 shadow-[0_0_60px_rgba(255,255,255,0.12)] overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-zinc-950/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <SentinaraLogo size="xs" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-orbitron text-white">
                  HOW TO USE SENTINARA
                </h3>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-mono font-bold text-cyan-300 border border-cyan-500/30">
                  PAGE {currentStep + 1} OF {steps.length}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">{current.subhead}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-tech-gradient rounded-xl p-2 text-zinc-400 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-zinc-900 h-1.5 flex">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 transition-all duration-500 h-full ${
                idx <= currentStep ? 'bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Main Body (Scrollable) */}
        <div className={`p-6 sm:p-8 space-y-6 overflow-y-auto bg-gradient-to-b ${current.color}`}>
          {/* Animated Mascot Speech Bubble Card */}
          <div className="flex flex-col sm:flex-row items-start gap-4 p-5 rounded-2xl bg-zinc-900/90 border border-white/15 shadow-xl relative">
            {/* Mascot Avatar */}
            <div className="relative flex-shrink-0 flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-black border-2 border-white/20 shadow-inner group">
              <span className="text-3xl sm:text-4xl transform group-hover:scale-110 transition-transform">
                {current.mascotMood}
              </span>
              <div className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
            </div>

            {/* Speech Dialogue */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-300 animate-pulse" />
                  Agent Hound Explains:
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${current.pillBg}`}>
                  EASY TO UNDERSTAND
                </span>
              </div>
              <p className="text-sm sm:text-base text-zinc-200 font-medium leading-relaxed font-sans">
                "{current.mascotSpeech}"
              </p>
            </div>
          </div>

          {/* Step Detail Card */}
          <div className={`p-6 rounded-2xl bg-black/85 border ${current.borderColor} space-y-4 shadow-xl`}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white border border-white/20">
                <current.icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-lg font-bold font-orbitron text-white">
                  {current.title}
                </h4>
                <p className="text-xs text-zinc-400 font-mono">Core Concept & Instructions</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed font-space">
              {current.explanation}
            </p>

            {/* Key Bullet Points */}
            <div className="space-y-2 pt-1 border-t border-white/[0.08]">
              {current.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-zinc-300 font-sans">
                  <span className="text-cyan-400 mt-0.5">&bull;</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>

            {/* Quick Action Button for Direct Jump */}
            <div className="pt-2">
              <button
                onClick={current.onAction}
                className="btn-tech-primary px-5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-md hover:scale-105 transition-all"
              >
                <span>{current.actionLabel}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Tip Pill & Deep Dive */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-zinc-400 font-mono">
            <div className="flex items-center gap-2.5">
              <Lightbulb className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Tip:</strong> Navigate using <strong>Next</strong> & <strong>Previous</strong> or jump straight into the feature!
              </span>
            </div>

            {onOpenSecurityConcepts && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSecurityConcepts();
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:text-white hover:bg-purple-900/60 text-[11px] font-mono font-bold transition shadow-sm shrink-0"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Full Concepts Guide &rarr;</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-white/[0.08] bg-zinc-950 px-6 py-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="btn-tech-gradient flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold text-zinc-300 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1.5 overflow-x-auto px-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-6 bg-white'
                    : 'bg-zinc-700 hover:bg-zinc-500'
                }`}
                title={`Page ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="btn-tech-primary flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-mono font-bold shadow-lg hover:scale-105 transition-all"
          >
            <span>{currentStep === steps.length - 1 ? 'Got it, Let’s Audit! 🚀' : 'Next Step'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
