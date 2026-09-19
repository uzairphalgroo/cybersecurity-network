"""Executive Audit Report Generator - Generates executive-ready HTML and printable reports."""
from datetime import datetime
from typing import Dict, Any
from jinja2 import Template
from app.models.schemas import AuditResponse

REPORT_HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sentinara Executive Security Audit: {{ audit.environment_name }}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
      line-height: 1.6;
      padding: 40px 20px;
    }
    .report-container {
      max-width: 1000px;
      margin: 0 auto;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
      padding: 40px;
      border-bottom: 1px solid #334155;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo-badge {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 22px;
      color: white;
    }
    .logo-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(to right, #ffffff, #cbd5e1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .logo-sub {
      font-size: 13px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 600;
    }
    .report-meta {
      text-align: right;
      font-size: 13px;
      color: #94a3b8;
    }
    .report-meta strong {
      color: #f1f5f9;
    }
    .content {
      padding: 40px;
    }
    .score-card {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 30px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 14px;
      padding: 30px;
      margin-bottom: 35px;
      align-items: center;
    }
    .score-circle {
      text-align: center;
      padding: 20px;
      border-radius: 12px;
      background: #1e293b;
      border: 2px solid {% if audit.posture_score.overall_score >= 80 %}#10b981{% elif audit.posture_score.overall_score >= 60 %}#f59e0b{% else %}#ef4444{% endif %};
    }
    .score-number {
      font-size: 52px;
      font-weight: 800;
      line-height: 1;
      color: {% if audit.posture_score.overall_score >= 80 %}#34d399{% elif audit.posture_score.overall_score >= 60 %}#fbbf24{% else %}#f87171{% endif %};
    }
    .score-grade {
      font-size: 18px;
      font-weight: 700;
      margin-top: 6px;
      color: #e2e8f0;
    }
    .score-rating {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
      color: #94a3b8;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
    }
    .stat-item {
      background: #1e293b;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #334155;
    }
    .stat-label {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    .stat-value {
      font-size: 22px;
      font-weight: 700;
      margin-top: 4px;
    }
    .stat-critical { color: #f87171; }
    .stat-high { color: #fb923c; }
    .stat-medium { color: #facc15; }
    .stat-low { color: #60a5fa; }
    
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #334155;
    }
    .framework-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 35px;
    }
    .framework-card {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 20px;
    }
    .framework-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .framework-name {
      font-size: 14px;
      font-weight: 600;
      color: #f1f5f9;
    }
    .framework-score {
      font-size: 14px;
      font-weight: 700;
      color: #38bdf8;
    }
    .progress-bar-bg {
      background: #334155;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 10px;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 4px;
      background: linear-gradient(90deg, #6366f1, #38bdf8);
    }
    .framework-details {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #94a3b8;
    }
    .findings-list {
      margin-bottom: 35px;
    }
    .finding-item {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 15px;
      border-left: 4px solid #ef4444;
    }
    .finding-item.sev-high { border-left-color: #f97316; }
    .finding-item.sev-medium { border-left-color: #eab308; }
    .finding-item.sev-low { border-left-color: #3b82f6; }
    
    .finding-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .finding-title {
      font-size: 15px;
      font-weight: 600;
      color: #f8fafc;
    }
    .badge {
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-critical { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }
    .badge-high { background: rgba(249, 115, 22, 0.2); color: #fb923c; border: 1px solid #f97316; }
    .badge-medium { background: rgba(234, 179, 8, 0.2); color: #facc15; border: 1px solid #eab308; }
    .badge-low { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid #3b82f6; }
    
    .finding-desc {
      font-size: 13px;
      color: #cbd5e1;
      margin-bottom: 10px;
    }
    .finding-meta {
      display: flex;
      gap: 20px;
      font-size: 12px;
      color: #94a3b8;
    }
    .attack-chain-box {
      background: #1e1b4b;
      border: 1px solid #4338ca;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 35px;
    }
    .signoff-section {
      background: #0f172a;
      border: 1px dashed #475569;
      border-radius: 10px;
      padding: 25px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }
    .signoff-field {
      border-bottom: 1px solid #475569;
      padding-bottom: 10px;
      margin-top: 25px;
      font-size: 13px;
      color: #94a3b8;
    }
    .footer {
      background: #0f172a;
      padding: 20px 40px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #334155;
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
      .score-container {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .score-card { padding: 16px; }
      .score-number { font-size: 40px; }
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .stat-item { padding: 10px 8px; }
      .stat-value { font-size: 18px; }
      .framework-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
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
      body { background-color: #ffffff; color: #000000; padding: 0; }
      .report-container { border: none; box-shadow: none; background: #ffffff; }
      .header { background: #f8fafc; color: #000000; border-bottom: 2px solid #cbd5e1; }
      .logo-title { -webkit-text-fill-color: #000000; }
      .score-card, .framework-card, .finding-item, .stat-item, .signoff-section { background: #f8fafc; border-color: #cbd5e1; color: #000000; }
      .score-grade, .section-title, .finding-title, .framework-name { color: #000000; }
      .finding-desc { color: #334155; }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <header class="header">
      <div class="logo-badge">
        <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 50 6 L 88 20 L 88 52 C 88 77 50 94 50 94 C 50 94 12 77 12 52 L 12 20 Z" fill="#020617" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>
          <path d="M 28 18 L 43 32 L 28 37 Z" fill="#FFFFFF"/>
          <path d="M 72 18 L 72 37 L 57 32 Z" fill="#FFFFFF"/>
          <polygon points="50,20 64,34 50,44 36,34" fill="#0F172A" stroke="#E2E8F0" stroke-width="2"/>
          <path d="M 20 38 L 36 34 L 40 56 L 24 56 Z" fill="#1E293B" stroke="#CBD5E1" stroke-width="1.5"/>
          <path d="M 80 38 L 76 56 L 60 56 L 64 34 Z" fill="#1E293B" stroke="#CBD5E1" stroke-width="1.5"/>
          <path d="M 33 60 L 50 80 L 67 60 L 59 66 L 50 74 L 41 66 Z" fill="#FFFFFF"/>
          <polygon points="50,38 57,45 50,52 43,45" fill="#38BDF8"/>
          <circle cx="50" cy="45" r="4" fill="#FFFFFF" stroke="#F43F5E" stroke-width="1.5"/>
        </svg>
        <div>
          <h1 class="logo-title">Sentinara</h1>
          <div class="logo-sub">Autonomous Cloud Security Sentinel</div>
        </div>
      </div>
      <div class="report-meta">
        <div>Environment: <strong>{{ audit.environment_name }}</strong></div>
        <div>Provider: <strong>{{ audit.provider }}</strong></div>
        <div>Timestamp: <strong>{{ audit.timestamp }}</strong></div>
        <div>Report ID: <strong>AH-{{ audit.environment_id[:8] }}</strong></div>
      </div>
    </header>

    <main class="content">
      <!-- Executive Scorecard -->
      <section class="score-card">
        <div class="score-circle">
          <div class="score-number">{{ audit.posture_score.overall_score }}</div>
          <div class="score-grade">Grade {{ audit.posture_score.letter_grade }}</div>
          <div class="score-rating">{{ audit.posture_score.risk_rating }} Risk</div>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">Critical Risks</div>
            <div class="stat-value stat-critical">{{ audit.posture_score.severity_breakdown.CRITICAL }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">High Severity</div>
            <div class="stat-value stat-high">{{ audit.posture_score.severity_breakdown.HIGH }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Medium Risks</div>
            <div class="stat-value stat-medium">{{ audit.posture_score.severity_breakdown.MEDIUM }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Total Findings</div>
            <div class="stat-value">{{ audit.posture_score.total_findings }}</div>
          </div>
        </div>
      </section>

      <!-- Compliance Framework Status -->
      <h2 class="section-title">Compliance Framework Alignment</h2>
      <div class="framework-grid">
        {% for fw in audit.posture_score.framework_scores %}
        <div class="framework-card">
          <div class="framework-header">
            <span class="framework-name">{{ fw.framework }}</span>
            <span class="framework-score">{{ fw.score_percentage }}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: {{ fw.score_percentage }}%;"></div>
          </div>
          <div class="framework-details">
            <span>Status: <strong>{{ fw.status }}</strong></span>
            <span>Passed: {{ fw.passed_checks }} / {{ fw.total_checks }} Controls</span>
          </div>
        </div>
        {% endfor %}
      </div>

      <!-- Critical Attack Chains -->
      {% if audit.graph_data.attack_paths %}
      <h2 class="section-title">Critical Privilege Escalation & Attack Chains</h2>
      <div class="attack-chain-box">
        {% for ap in audit.graph_data.attack_paths %}
        <div style="margin-bottom: 20px;">
          <h3 style="color: #f87171; font-size: 15px; margin-bottom: 6px;">{{ ap.title }} ({{ ap.hop_count }} Hops)</h3>
          <div style="font-size: 12px; color: #a5b4fc; margin-bottom: 8px;">Entry: {{ ap.entry_point }} &rarr; Target: {{ ap.target }} | {{ ap.cve_or_technique }}</div>
          <ol style="margin-left: 20px; font-size: 13px; color: #cbd5e1;">
            {% for step in ap.steps %}
            <li style="margin-bottom: 4px;">{{ step }}</li>
            {% endfor %}
          </ol>
        </div>
        {% endfor %}
      </div>
      {% endif %}

      <!-- Findings List -->
      <h2 class="section-title">Detailed Vulnerability & Compliance Findings ({{ audit.findings|length }})</h2>
      <div class="findings-list">
        {% for f in audit.findings %}
        <div class="finding-item sev-{{ f.severity.value.lower() }}">
          <div class="finding-header">
            <div class="finding-title">{{ f.title }}</div>
            <span class="badge badge-{{ f.severity.value.lower() }}">{{ f.severity.value }}</span>
          </div>
          <div class="finding-desc">{{ f.description }}</div>
          <div class="finding-meta">
            <span>Resource: <code>{{ f.affected_resource_id }}</code></span>
            <span>Impact: {{ f.risk_impact }}</span>
          </div>
          <div style="margin-top: 8px; font-size: 12px; color: #38bdf8;">
            <strong>Remediation:</strong> {{ f.remediation_steps }}
          </div>
        </div>
        {% endfor %}
      </div>

      <!-- Executive Auditor Signoff -->
      <h2 class="section-title">Executive Auditor Review & Sign-Off</h2>
      <div class="signoff-section">
        <div>
          <div><strong>Principal Cloud Security Auditor</strong></div>
          <div class="signoff-field">Signature / Timestamp: Sentinara Autonomous Engine v1.0</div>
          <div class="signoff-field">Audit Status: Official Security Assessment Complete</div>
        </div>
        <div>
          <div><strong>Chief Information Security Officer (CISO) Approval</strong></div>
          <div class="signoff-field">Reviewed By: _________________________________</div>
          <div class="signoff-field">Date: _______________________________________</div>
        </div>
      </div>
    </main>

    <footer class="footer">
      Generated automatically by Sentinara Security Platform &bull; ISO/IEC 27001 & SOC2 Type II Certified Pipeline
    </footer>
  </div>
</body>
</html>
"""


class ReporterEngine:
    """Renders executive-grade HTML reports from AuditResponse data."""

    @staticmethod
    def generate_html_report(audit_data: AuditResponse) -> str:
        """Renders the HTML report string using Jinja2 with autoescaping enabled."""
        template = Template(REPORT_HTML_TEMPLATE, autoescape=True)
        return template.render(audit=audit_data)
