import React, { useState, useRef } from 'react';
import { Upload, FileCode, ArrowRight, ShieldCheck, ShieldAlert, Sparkles, Download, Layers, HelpCircle, CheckCircle2, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import { EnvironmentSummary, AuditResponse } from '../types/audit';
import { uploadAndAudit } from '../services/api';

interface EmptyUploadLaunchpadProps {
  environments: EnvironmentSummary[];
  onSelectEnv: (envId: string) => void;
  onAuditComplete: (audit: AuditResponse) => void;
  onOpenHowToUse: () => void;
  onOpenSecurityConcepts?: () => void;
}

export const EmptyUploadLaunchpad: React.FC<EmptyUploadLaunchpadProps> = ({
  environments,
  onSelectEnv,
  onAuditComplete,
  onOpenHowToUse,
  onOpenSecurityConcepts,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.json') && selectedFile.type !== 'application/json') {
      setError('Only .json synthetic configuration dump files are supported.');
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('Uploaded file exceeds maximum allowed limit of 5MB.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadAndAudit(selectedFile);
      onAuditComplete(result);
    } catch (err: any) {
      setError(err.message || 'Failed to parse and audit configuration.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleLoadSampleDirectly = async () => {
    setUploading(true);
    setError(null);
    try {
      const sampleDump = {
        environment_id: "sample_opensource_cloud_dump",
        environment_name: "Open-Source Multi-Cloud Telemetry Sample",
        cloud_provider: "AWS",
        timestamp: new Date().toISOString(),
        iam_users: [
          {
            user_name: "security-auditor",
            arn: "arn:aws:iam::123456789012:user/security-auditor",
            mfa_enabled: false,
            access_keys: [{ access_key_id: "AKIAIOSFODNN7EXAMPLE", status: "Active", age_days: 140 }],
            attached_policies: [
              {
                policy_name: "AdministratorAccess",
                policy_document: {
                  Version: "2012-10-17",
                  Statement: [{ Effect: "Allow", Action: "*", Resource: "*" }]
                }
              }
            ]
          },
          {
            user_name: "app-developer",
            arn: "arn:aws:iam::123456789012:user/app-developer",
            mfa_enabled: false,
            access_keys: [{ access_key_id: "AKIAI44QH8DHBEXAMPLE", status: "Active", age_days: 45 }],
            attached_policies: [
              {
                policy_name: "PassRoleComputePolicy",
                policy_document: {
                  Version: "2012-10-17",
                  Statement: [
                    { Effect: "Allow", Action: ["ec2:RunInstances"], Resource: "*" },
                    { Effect: "Allow", Action: ["iam:PassRole"], Resource: "arn:aws:iam::123456789012:role/AdminRole" }
                  ]
                }
              }
            ]
          }
        ],
        s3_buckets: [
          {
            bucket_name: "financial-backups-bucket",
            arn: "arn:aws:s3:::financial-backups-bucket",
            public_access_block_enabled: false,
            server_side_encryption_kms: false,
            versioning_enabled: false
          }
        ],
        security_groups: [
          {
            group_id: "sg-01ab23cd45ef6789a",
            group_name: "production-app-sg",
            inbound_rules: [
              { protocol: "tcp", from_port: 22, to_port: 22, cidr_ip: "0.0.0.0/0", description: "Public SSH Access" },
              { protocol: "tcp", from_port: 3306, to_port: 3306, cidr_ip: "0.0.0.0/0", description: "Public MySQL Database" }
            ]
          }
        ]
      };

      const jsonBlob = new Blob([JSON.stringify(sampleDump)], { type: 'application/json' });
      const sampleFile = new File([jsonBlob], 'sample_opensource_cloud_dump.json', { type: 'application/json' });
      const result = await uploadAndAudit(sampleFile);
      onAuditComplete(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load open-source sample telemetry.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadSample = () => {
    const sampleDump = {
      environment_id: "custom_cloud_infrastructure_dump",
      environment_name: "Enterprise Multi-Cloud Infrastructure",
      cloud_provider: "AWS",
      timestamp: new Date().toISOString(),
      iam_users: [
        {
          user_name: "devops-engineer",
          arn: "arn:aws:iam::123456789012:user/devops-engineer",
          mfa_enabled: false,
          access_keys: [{ access_key_id: "AKIAIOSFODNN7EXAMPLE", status: "Active", age_days: 120 }],
          attached_policies: [
            {
              policy_name: "FullAdminAccess",
              policy_document: {
                Version: "2012-10-17",
                Statement: [{ Effect: "Allow", Action: "*", Resource: "*" }]
              }
            }
          ]
        }
      ],
      s3_buckets: [
        {
          bucket_name: "prod-customer-backups-2026",
          arn: "arn:aws:s3:::prod-customer-backups-2026",
          public_access_block_enabled: false,
          server_side_encryption_kms: false,
          versioning_enabled: false
        }
      ],
      security_groups: [
        {
          group_id: "sg-01ab23cd45ef6789a",
          group_name: "production-app-sg",
          inbound_rules: [
            { protocol: "tcp", from_port: 22, to_port: 22, cidr_ip: "0.0.0.0/0", description: "Public SSH Access" },
            { protocol: "tcp", from_port: 3306, to_port: 3306, cidr_ip: "0.0.0.0/0", description: "Public Database" }
          ]
        }
      ]
    };

    const blob = new Blob([JSON.stringify(sampleDump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_opensource_cloud_dump.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-zinc-900/90 px-4 py-1.5 text-xs font-mono font-bold text-zinc-300 shadow-lg backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span>AUTONOMOUS MULTI-CLOUD AUDIT ENGINE</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-orbitron tracking-tight text-white">
          UPLOAD CLOUD CONFIGURATION TO BEGIN
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 font-mono leading-relaxed">
          Ingest AWS IAM/S3 and Azure topographies to compute deterministic SOC2 & CIS posture scores, traverse lateral privilege escalation graphs, and synthesize production-ready Terraform defense patches.
        </p>

        {/* Free Open Source Data & Concepts Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-md">
            <span>💡</span>
            <span>
              <b>Instant Testing:</b> You can test Sentinara immediately using the <b>Free Open-Source Sample Data</b> button beside uploading or explore any benchmark scenario below!
            </span>
          </div>

          {onOpenSecurityConcepts && (
            <button
              onClick={onOpenSecurityConcepts}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs font-mono font-bold text-purple-300 hover:text-white hover:bg-purple-900/50 shadow-md hover:scale-105 transition-all"
            >
              <BookOpen className="h-3.5 w-3.5 text-purple-400" />
              <span>📚 Security Concepts & Operator Guide</span>
            </button>
          )}

          <button
            onClick={onOpenHowToUse}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-white/20 text-xs font-mono font-bold text-zinc-300 hover:text-white hover:border-white/40 shadow-md hover:scale-105 transition-all"
          >
            <span>🐶 Beginner 5-Yr Guide</span>
          </button>
        </div>
      </div>

      {/* Primary Ingestion Dropzone */}
      <div className="relative rounded-3xl border border-white/20 bg-zinc-950/90 backdrop-blur-2xl p-8 sm:p-12 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 flex flex-col items-center justify-center space-y-5 ${
            dragActive
              ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01] shadow-[0_0_30px_rgba(6,182,212,0.2)]'
              : 'border-white/15 bg-black/60 hover:border-white/40 hover:bg-zinc-900/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="h-20 w-20 rounded-2xl border border-white/20 bg-zinc-900/90 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            {uploading ? (
              <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
            ) : (
              <Upload className="h-10 w-10 text-zinc-200 animate-bounce" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold font-orbitron text-white">
              {uploading ? 'INGESTING & ANALYZING TOPOGRAPHY...' : 'DRAG & DROP CLOUD CONFIG (JSON)'}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              Supports AWS IAM Users/Roles/Policies, S3 Buckets, Azure RBAC, and Kubernetes RBAC dumps (Max 5MB)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* 1. Browse Local JSON */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              disabled={uploading}
              className="btn-tech-primary px-5 py-3 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
            >
              <FileCode className="h-4 w-4" />
              <span>Browse Local JSON</span>
            </button>

            {/* 2. Free Open Source Data Instant Test Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSampleDirectly();
              }}
              disabled={uploading}
              className="btn-tech-gradient px-5 py-3 rounded-xl text-xs font-mono font-bold flex items-center gap-2 text-cyan-300 border-cyan-500/40 bg-cyan-950/30 hover:text-white shadow-lg hover:scale-105 transition-all"
            >
              <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
              <span>⚡ Test Free Open-Source Data</span>
            </button>

            {/* 3. Download Template JSON */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadSample();
              }}
              className="btn-tech-gradient px-4 py-3 rounded-xl text-xs font-mono font-bold flex items-center gap-2 text-zinc-300 hover:text-white shadow-md hover:scale-105 transition-all"
              title="Download Sample JSON template"
            >
              <Download className="h-4 w-4 text-zinc-400" />
              <span>Download Template</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs font-mono text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Actions Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-4 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Zero Data Storage • In-Memory Client & API Processing</span>
          </div>
          <button
            onClick={onOpenHowToUse}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-cyan-400 transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Need Help? Read How It Works Guide →</span>
          </button>
        </div>
      </div>

      {/* Alternative: 10 Preloaded Benchmark Scenarios */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold font-orbitron text-white">OR EXPLORE PRE-LOADED BENCHMARK SCENARIOS</h2>
          </div>
          <span className="text-xs font-mono text-zinc-500">10 Scenarios Ready</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {environments.map((env) => {
            const isCompliant = env.id.includes('banking') || env.id.includes('aerospace');

            return (
              <div
                key={env.id}
                onClick={() => onSelectEnv(env.id)}
                className="group cursor-pointer rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl p-5 shadow-lg transition-all duration-300 hover:border-white/30 hover:bg-zinc-900/90 hover:scale-[1.02] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-zinc-300 uppercase">
                      {env.cloud_provider}
                    </span>
                    {isCompliant ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Hardened (A+)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-950/60 border border-rose-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-rose-400">
                        <ShieldAlert className="h-3 w-3" />
                        <span>High Risk</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold font-orbitron text-white group-hover:text-cyan-300 transition-colors">
                    {env.name}
                  </h3>

                  <p className="text-xs text-zinc-400 font-mono line-clamp-2 leading-relaxed">
                    {env.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.08] pt-3 text-xs font-mono font-bold text-zinc-400 group-hover:text-white transition-colors">
                  <span>Audit Scenario</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform text-cyan-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
