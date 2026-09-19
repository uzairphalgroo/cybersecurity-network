import React, { useState } from 'react';
import { Finding, SeverityLevel } from '../types/audit';
import { Search, Filter, AlertOctagon, AlertTriangle, ChevronDown, ChevronUp, Wrench, Shield } from 'lucide-react';

interface FindingsTableProps {
  findings: Finding[];
  onSelectFindingForRemediation?: (finding: Finding) => void;
}

export const FindingsTable: React.FC<FindingsTableProps> = ({
  findings,
  onSelectFindingForRemediation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedFramework, setSelectedFramework] = useState<string>('ALL');
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null);

  // Filter findings
  const filteredFindings = findings.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.affected_resource_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.rule_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = selectedSeverity === 'ALL' || f.severity === selectedSeverity;
    const matchesFramework =
      selectedFramework === 'ALL' || f.frameworks.some((fw: string) => fw.includes(selectedFramework));

    return matchesSearch && matchesSeverity && matchesFramework;
  });

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-rose-950/60 px-2.5 py-0.5 text-[10px] font-mono font-bold text-rose-400 border border-rose-500/50">
            <AlertOctagon className="h-3 w-3" /> CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-950/60 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-400 border border-amber-500/50">
            <AlertTriangle className="h-3 w-3" /> HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-zinc-300 border border-zinc-700">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-zinc-400 border border-zinc-800">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-black/85 backdrop-blur-2xl shadow-2xl overflow-hidden font-tech">
      {/* Header & Filter Bar */}
      <div className="border-b border-white/[0.08] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold font-orbitron text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-white" />
              COMPLIANCE FINDINGS MATRIX ({filteredFindings.length})
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              Evaluated against SOC2 CC6 Controls & CIS Benchmarks
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search findings, rules, ARNs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-zinc-950 pl-10 pr-4 py-2.5 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:border-white focus:outline-none shadow-inner"
            />
          </div>
        </div>

        {/* Filter Pills with Tech Gradient Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Severity filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-400 font-mono mr-1">SEVERITY:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`btn-tech-gradient rounded-xl px-3.5 py-1.5 text-xs font-mono font-bold transition-all ${
                  selectedSeverity === sev
                    ? 'bg-white text-black shadow-md border-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Framework Dropdown Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-400" />
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-1.5 text-xs font-mono font-medium text-zinc-300 focus:border-white focus:outline-none"
            >
              <option value="ALL">All Compliance Frameworks</option>
              <option value="SOC2 CC6.1">SOC2 CC6.1 (Logical Access)</option>
              <option value="SOC2 CC6.3">SOC2 CC6.3 (Least Privilege)</option>
              <option value="SOC2 CC6.6">SOC2 CC6.6 (Boundary Defense)</option>
              <option value="SOC2 CC6.7">SOC2 CC6.7 (Data Encryption)</option>
              <option value="CIS AWS">CIS AWS Foundations</option>
              <option value="CIS Microsoft Azure">CIS Microsoft Azure</option>
              <option value="CIS Kubernetes">CIS Kubernetes Benchmark</option>
            </select>
          </div>
        </div>
      </div>

      {/* Findings List */}
      <div className="divide-y divide-white/[0.06]">
        {filteredFindings.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Shield className="mx-auto h-12 w-12 text-zinc-700 mb-3" />
            <p className="text-sm font-mono font-medium">ZERO FINDINGS DETECTED</p>
          </div>
        ) : (
          filteredFindings.map((finding) => {
            const isExpanded = expandedFindingId === finding.id;

            return (
              <div
                key={finding.id}
                className={`transition-colors ${isExpanded ? 'bg-zinc-900/60' : 'hover:bg-zinc-900/30'}`}
              >
                {/* Main Row */}
                <div
                  onClick={() => setExpandedFindingId(isExpanded ? null : finding.id)}
                  className="flex items-center justify-between p-4 cursor-pointer gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5">{getSeverityBadge(finding.severity)}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-100 truncate">{finding.title}</h4>
                        <span className="rounded bg-zinc-850 px-1.5 py-0.2 text-[9px] font-mono text-zinc-400 border border-white/5">
                          {finding.rule_id}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5 font-mono">
                        Target: <span className="text-zinc-300">{finding.affected_resource_id}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden md:flex flex-wrap gap-1 max-w-[200px] justify-end">
                      {finding.frameworks.slice(0, 2).map((fw: string) => (
                        <span
                          key={fw}
                          className="rounded-md bg-zinc-900 border border-white/10 px-2 py-0.5 text-[9px] font-mono text-zinc-300 truncate"
                        >
                          {fw.split(' ')[0]} {fw.split(' ')[1]}
                        </span>
                      ))}
                    </div>

                    <button className="text-zinc-400 hover:text-white p-1">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="border-t border-white/[0.06] bg-black/60 px-6 py-4 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-mono font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                          ROOT CAUSE DESCRIPTION
                        </span>
                        <p className="mt-1 text-zinc-300 leading-relaxed font-sans">{finding.description}</p>
                      </div>

                      <div>
                        <span className="font-mono font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                          SECURITY RISK & IMPACT
                        </span>
                        <p className="mt-1 text-rose-300 leading-relaxed font-sans">{finding.risk_impact}</p>
                      </div>
                    </div>

                    {finding.privilege_escalation_vector && (
                      <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3 font-mono">
                        <span className="font-bold text-purple-300 uppercase text-[10px] tracking-wider">
                          PRIVILEGE ESCALATION CHAIN
                        </span>
                        <p className="mt-1 text-xs text-purple-200">
                          {finding.privilege_escalation_vector}
                        </p>
                      </div>
                    )}

                    <div className="rounded-xl border border-white/10 bg-zinc-950/80 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-zinc-300 uppercase text-[10px] tracking-wider">
                          REMEDIATION ADVISORY
                        </span>
                        {onSelectFindingForRemediation && (
                          <button
                            onClick={() => onSelectFindingForRemediation(finding)}
                            className="btn-tech-gradient flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-mono font-bold text-white shadow-sm"
                          >
                            <Wrench className="h-3 w-3 text-zinc-300" />
                            View Terraform Patch
                          </button>
                        )}
                      </div>
                      <p className="text-zinc-300 font-sans">{finding.remediation_steps}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
