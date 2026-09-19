import React, { useMemo } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { AuditResponse } from '../types/audit';
import { generateClientSideReportHtml } from '../services/reportGenerator';
import { SentinaraLogo } from './SentinaraLogo';

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
    a.download = `Sentinara_Report_${auditData.environment_name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-2 sm:p-6 font-tech safe-top safe-bottom">
      <div className="flex h-full max-h-[96dvh] sm:max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl sm:rounded-3xl border border-white/20 bg-black shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] bg-zinc-950 px-4 sm:px-6 py-3 sm:py-4 gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <SentinaraLogo size="xs" showText={false} />
              <div>
                <h3 className="text-xs sm:text-sm font-bold font-orbitron text-white truncate max-w-[200px] xs:max-w-xs sm:max-w-none">
                  EXECUTIVE SECURITY AUDIT REPORT
                </h3>
                <p className="text-[10px] sm:text-xs text-zinc-400 font-mono truncate max-w-[200px] xs:max-w-xs sm:max-w-none">
                  Scope: {auditData.environment_name} ({auditData.provider})
                </p>
              </div>
            </div>

            {/* Mobile-only Close Button */}
            <button
              onClick={onClose}
              className="sm:hidden btn-tech-gradient rounded-lg p-2 text-zinc-400 hover:text-white transition"
              title="Close Report"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            {/* Primary Print / Save as PDF Button */}
            <button
              onClick={handlePrint}
              className="btn-tech-primary flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-mono font-bold shadow-lg cursor-pointer"
              title="Open Browser Print Dialog to Save as PDF"
            >
              <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Print / PDF</span>
            </button>

            {/* Download Raw HTML Button */}
            <button
              onClick={handleDownloadHtml}
              className="btn-tech-gradient flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-mono font-bold text-zinc-200 hover:text-white cursor-pointer"
              title="Download standalone HTML report"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>HTML</span>
            </button>

            {/* Desktop Close Button */}
            <button
              onClick={onClose}
              className="hidden sm:block btn-tech-gradient rounded-xl p-2.5 text-zinc-400 hover:text-white transition cursor-pointer"
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
