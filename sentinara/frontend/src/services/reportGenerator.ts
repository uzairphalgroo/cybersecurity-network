import { AuditResponse } from '../types/audit';

function escapeHtml(str: string | number | undefined | null): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateClientSideReportHtml(audit: AuditResponse): string {
  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#eab308';
      case 'LOW': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return '#10b981';
    if (grade.startsWith('B')) return '#06b6d4';
    if (grade.startsWith('C')) return '#f59e0b';
    return '#ef4444';
  };

  const frameworkRows = audit.posture_score.framework_scores.map(f => `
    <div style="background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 16px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-weight: 700; color: #f8fafc; font-size: 14px;">${escapeHtml(f.framework)}</span>
        <span style="font-weight: 700; color: ${f.score_percentage >= 80 ? '#10b981' : f.score_percentage >= 50 ? '#f59e0b' : '#ef4444'}; font-size: 14px;">
          ${escapeHtml(f.score_percentage)}% Pass Rate
        </span>
      </div>
      <div style="width: 100%; height: 6px; background: #1e293b; border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
        <div style="width: ${Math.min(100, Math.max(0, f.score_percentage))}%; height: 100%; background: ${f.score_percentage >= 80 ? '#10b981' : f.score_percentage >= 50 ? '#f59e0b' : '#ef4444'};"></div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; font-family: monospace;">
        <span>Passed: ${escapeHtml(f.passed_checks)} / ${escapeHtml(f.total_checks)}</span>
        <span>Failed: ${escapeHtml(f.failed_checks)}</span>
        <span style="text-transform: uppercase; font-weight: 600;">Status: ${escapeHtml(f.status)}</span>
      </div>
    </div>
  `).join('');

  const findingsRows = audit.findings.map(f => `
    <div style="background: #0f172a; border: 1px solid #334155; border-left: 4px solid ${getSeverityColor(f.severity)}; border-radius: 8px; padding: 14px 18px; margin-bottom: 12px; page-break-inside: avoid;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-weight: 700; color: #ffffff; font-size: 13px;">${escapeHtml(f.title)}</span>
        <span style="padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; background: ${getSeverityColor(f.severity)}22; color: ${getSeverityColor(f.severity)}; border: 1px solid ${getSeverityColor(f.severity)}55;">
          ${escapeHtml(f.severity)}
        </span>
      </div>
      <p style="font-size: 12px; color: #cbd5e1; margin-bottom: 8px; line-height: 1.5;">${escapeHtml(f.description)}</p>
      <div style="display: flex; flex-wrap: wrap; gap: 12px; font-size: 10px; color: #94a3b8; font-family: monospace;">
        <span><strong>Rule:</strong> ${escapeHtml(f.rule_id)}</span>
        <span><strong>Resource:</strong> ${escapeHtml(f.affected_resource_id)}</span>
        <span><strong>Impact:</strong> ${escapeHtml(f.risk_impact)}</span>
      </div>
      <div style="margin-top: 8px; padding: 6px 10px; background: #020617; border-radius: 6px; font-size: 11px; color: #38bdf8;">
        <strong>Remediation:</strong> ${escapeHtml(f.remediation_steps)}
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sentinara Executive Audit: ${escapeHtml(audit.environment_name)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #000000;
      color: #f8fafc;
      line-height: 1.6;
      padding: 30px 20px;
    }
    .report-container {
      max-width: 950px;
      margin: 0 auto;
      background: #090d16;
      border: 1px solid #1e293b;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .header {
      background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
      padding: 35px 40px;
      border-bottom: 1px solid #1e293b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo-badge {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #ffffff;
    }
    .logo-sub {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-family: monospace;
    }
    .report-meta {
      text-align: right;
      font-size: 11px;
      color: #94a3b8;
      font-family: monospace;
      line-height: 1.8;
    }
    .report-meta strong { color: #ffffff; }
    .content { padding: 35px 40px; }
    
    .score-card {
      background: #020617;
      border: 1px solid #1e293b;
      border-radius: 14px;
      padding: 25px;
      display: flex;
      align-items: center;
      gap: 30px;
      margin-bottom: 30px;
    }
    .score-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 4px solid ${getGradeColor(audit.posture_score.letter_grade)};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: #0f172a;
    }
    .score-number {
      font-size: 32px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1;
    }
    .score-grade {
      font-size: 14px;
      font-weight: 700;
      color: ${getGradeColor(audit.posture_score.letter_grade)};
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      flex: 1;
    }
    .stat-item {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .stat-label {
      font-size: 10px;
      color: #94a3b8;
      font-family: monospace;
      text-transform: uppercase;
    }
    .stat-value {
      font-size: 20px;
      font-weight: 800;
      margin-top: 4px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #ffffff;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .signoff-section {
      background: #020617;
      border: 1px dashed #334155;
      border-radius: 12px;
      padding: 25px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 30px;
      page-break-inside: avoid;
    }
    .signoff-field {
      border-bottom: 1px solid #475569;
      padding-bottom: 8px;
      margin-top: 25px;
      font-size: 11px;
      color: #94a3b8;
      font-family: monospace;
    }
    .footer {
      background: #020617;
      padding: 20px 40px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      font-family: monospace;
      border-top: 1px solid #1e293b;
    }
    
    /* Mobile & Tablet Responsive Media Queries */
    @media (max-width: 768px) {
      body { padding: 12px 8px; }
      .report-container { border-radius: 12px; }
      .header {
        padding: 20px 16px;
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      .logo-title { font-size: 20px; }
      .report-meta { text-align: left; }
      .content { padding: 18px 14px; }
      .score-card {
        flex-direction: column;
        align-items: center;
        gap: 20px;
        padding: 18px 14px;
      }
      .score-circle {
        width: 100px;
        height: 100px;
      }
      .score-number { font-size: 26px; }
      .score-grade { font-size: 13px; }
      .stats-grid {
        width: 100%;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .stat-item { padding: 10px 8px; }
      .stat-value { font-size: 16px; }
      .signoff-section {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 16px;
      }
      .footer { padding: 16px; }
    }

    @media (max-width: 420px) {
      body { padding: 8px 4px; }
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }
      .stat-label { font-size: 9px; }
      .stat-value { font-size: 15px; }
    }

    @media print {
      body { background-color: #ffffff !important; color: #000000 !important; padding: 0 !important; }
      .report-container { border: none !important; box-shadow: none !important; background: #ffffff !important; }
      .header { background: #f8fafc !important; color: #000000 !important; border-bottom: 2px solid #cbd5e1 !important; }
      .logo-title { color: #000000 !important; }
      .score-card, .stat-item, .signoff-section { background: #f8fafc !important; border-color: #cbd5e1 !important; color: #000000 !important; }
      .score-circle { background: #ffffff !important; }
      .score-number { color: #000000 !important; }
      .section-title { color: #000000 !important; }
      .signoff-field { border-bottom-color: #000000 !important; color: #334155 !important; }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <header class="header">
      <div class="logo-badge">
        <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 50 6 L 88 20 L 88 52 C 88 77 50 94 50 94 C 50 94 12 77 12 52 L 12 20 Z" fill="#020617" stroke="#FFFFFF" stroke-width="3"/>
          <path d="M 28 18 L 43 32 L 28 37 Z" fill="#FFFFFF"/>
          <path d="M 72 18 L 72 37 L 57 32 Z" fill="#FFFFFF"/>
          <polygon points="50,20 64,34 50,44 36,34" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
          <path d="M 33 60 L 50 80 L 67 60 L 59 66 L 50 74 L 41 66 Z" fill="#FFFFFF"/>
          <circle cx="50" cy="45" r="4" fill="#38BDF8"/>
        </svg>
        <div>
          <h1 class="logo-title">SENTINARA</h1>
          <div class="logo-sub">Autonomous Multi-Cloud Security & Compliance Audit</div>
        </div>
      </div>
      <div class="report-meta">
        <div>Environment: <strong>${escapeHtml(audit.environment_name)}</strong></div>
        <div>Provider: <strong>${escapeHtml(audit.provider)}</strong></div>
        <div>Timestamp: <strong>${escapeHtml(new Date(audit.timestamp).toUTCString())}</strong></div>
        <div>Report ID: <strong>SNT-${escapeHtml(audit.environment_id.substring(0, 8).toUpperCase())}</strong></div>
      </div>
    </header>

    <main class="content">
      <section class="score-card">
        <div class="score-circle">
          <div class="score-number">${escapeHtml(audit.posture_score.overall_score)}</div>
          <div class="score-grade">Grade ${escapeHtml(audit.posture_score.letter_grade)}</div>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">Critical Risks</div>
            <div class="stat-value" style="color: #ef4444;">${escapeHtml(audit.posture_score.severity_breakdown.CRITICAL)}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">High Risks</div>
            <div class="stat-value" style="color: #f97316;">${escapeHtml(audit.posture_score.severity_breakdown.HIGH)}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Medium Risks</div>
            <div class="stat-value" style="color: #eab308;">${escapeHtml(audit.posture_score.severity_breakdown.MEDIUM)}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Attack Chains</div>
            <div class="stat-value" style="color: #c084fc;">${escapeHtml(audit.graph_data?.attack_paths?.length || 0)}</div>
          </div>
        </div>
      </section>

      <section style="margin-bottom: 30px;">
        <h2 class="section-title">Compliance Framework Scores</h2>
        ${frameworkRows}
      </section>

      <section style="margin-bottom: 30px;">
        <h2 class="section-title">Security & Compliance Findings (${audit.findings.length})</h2>
        ${findingsRows}
      </section>

      <section class="signoff-section">
        <div>
          <h3 style="font-size: 13px; font-weight: 700; color: #ffffff; text-transform: uppercase;">Lead Security Auditor Sign-Off</h3>
          <div class="signoff-field">Authorized Signature</div>
          <div class="signoff-field">Printed Name: Sentinara Autonomous Sentinel</div>
          <div class="signoff-field">Date: ${escapeHtml(new Date().toLocaleDateString())}</div>
        </div>
        <div>
          <h3 style="font-size: 13px; font-weight: 700; color: #ffffff; text-transform: uppercase;">Executive Risk Acceptance</h3>
          <div class="signoff-field">CISO / VP Infrastructure Signature</div>
          <div class="signoff-field">Remediation Target Date: +14 Days</div>
          <div class="signoff-field">Audit Status: ${audit.posture_score.overall_score >= 80 ? 'APPROVED' : 'REMEDIATION REQUIRED'}</div>
        </div>
      </section>
    </main>

    <footer class="footer">
      Generated automatically by Sentinara Enterprise &bull; SOC2 CC6.1, CC6.3 & CIS v3.0 Compliance Certified
    </footer>
  </div>
</body>
</html>`;
}
