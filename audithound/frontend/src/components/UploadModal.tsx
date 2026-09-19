import React, { useState, useRef } from 'react';
import { Upload, X, FileCode, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { uploadAndAudit } from '../services/api';
import { AuditResponse } from '../types/audit';
import { AuditHoundLogo } from './AuditHoundLogo';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuditComplete: (audit: AuditResponse) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onAuditComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile.name.endsWith('.json') && droppedFile.type !== 'application/json') {
        setError('Only .json synthetic configuration dump files are supported.');
        return;
      }
      if (droppedFile.size > MAX_FILE_SIZE) {
        setError('Uploaded file exceeds maximum allowed limit of 5MB.');
        return;
      }
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('Uploaded file exceeds maximum allowed limit of 5MB.');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const result = await uploadAndAudit(file);
      onAuditComplete(result);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to ingest and audit custom configuration.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 font-tech">
      <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-black/95 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <AuditHoundLogo size="xs" showText={false} />
            <h3 className="text-base font-bold font-orbitron text-white">UPLOAD CLOUD DUMP (JSON)</h3>
          </div>
          <button
            onClick={onClose}
            className="btn-tech-gradient rounded-xl p-1 text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            dragActive
              ? 'border-white bg-zinc-900/80 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
              : file
              ? 'border-emerald-500/50 bg-emerald-950/20'
              : 'border-white/15 bg-zinc-950/60 hover:border-white/30'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          {file ? (
            <div className="space-y-2">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400 animate-bounce" />
              <p className="text-sm font-bold text-white font-mono">{file.name}</p>
              <p className="text-xs text-zinc-400 font-mono">
                {(file.size / 1024).toFixed(1)} KB &bull; Click or drop another to replace
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <FileCode className="mx-auto h-12 w-12 text-white opacity-90" />
              <p className="text-sm font-semibold text-zinc-100 font-mono">
                Drag & drop JSON configuration dump here, or browse
              </p>
              <p className="text-xs text-zinc-400 font-mono text-[11px]">
                Accepts AWS IAM, S3, Security Groups, Azure NSG, and Kubernetes RBAC dumps
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300 font-mono">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="btn-tech-gradient rounded-xl px-4 py-2 text-xs font-mono font-bold text-zinc-400 hover:text-white transition-all"
          >
            CANCEL
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || uploading}
            className="btn-tech-primary flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-black" />
                <span>Auditing Cloud Dump...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Run Autonomous Audit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
