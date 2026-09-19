import React, { useMemo } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { AuditResponse } from '../types/audit';
import { generateClientSideReportHtml } from '../services/reportGenerator';
import { AuditHoundLogo } from './AuditHoundLogo';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditData: AuditResponse;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  auditData,
}) => {
  if (!isOpen || !auditData) return null;

  const htmlContent = useMemo(() => {
    return generateClientSideReportHtml(auditData);
  }, [auditData]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
      // Fallback if onload doesn't fire immediately
      setTimeout(() => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch (e) {
          console.error(e);
        }
      }, 350);
    }
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuditHound_Report_${auditData.environment_name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 sm:p-6 font-tech">
      <div className="flex h-full max-h-[92vh] w-full max-w-5xl flex-col rounded-3xl border border-white/20 bg-black shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-zinc-950 px-6 py-4 gap-4">
          <div className="flex items-center gap-3">
            <AuditHoundLogo size="sm" showText={false} />
            <div>
              <h3 className="text-sm font-bold font-orbitron text-white">
                EXECUTIVE SECURITY AUDIT REPORT
              </h3>
              <p className="text-xs text-zinc-400 font-mono">Scope: {auditData.environment_name} ({auditData.provider})</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Primary Print / Save as PDF Button */}
            <button
              onClick={handlePrint}
              className="btn-tech-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-bold shadow-lg"
              title="Open Browser Print Dialog to Save as PDF"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save as PDF</span>
            </button>

            {/* Download Raw HTML Button */}
            <button
              onClick={handleDownloadHtml}
              className="btn-tech-gradient flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-zinc-200 hover:text-white"
              title="Download standalone HTML report"
            >
              <Download className="h-4 w-4" />
              <span>Download HTML</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="btn-tech-gradient rounded-xl p-2.5 text-zinc-400 hover:text-white transition"
              title="Close Report"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Report Frame using srcDoc */}
        <div className="relative flex-1 bg-[#090d16] overflow-hidden">
          <iframe
            id="report-iframe"
            srcDoc={htmlContent}
            title="Executive Audit Report"
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
};
