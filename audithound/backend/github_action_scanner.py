#!/usr/bin/env python3
"""
Sentinara CI/CD GitOps Sentinel & GitHub Action Scanner
Analyzes cloud configuration dumps in Pull Requests, evaluates posture deltas,
and generates rich markdown PR comment summaries for automated merge blocking.
"""

import argparse
import sys
import json
from pathlib import Path
from app.engine.ingestion import IngestionEngine
from app.engine.attack_paths import AttackPathEngine
from app.engine.compliance import ComplianceEngine
from app.engine.remediation import RemediationEngine

def run_ci_scan(file_path: str, fail_severity: str = "CRITICAL", output_comment_path: str = None) -> int:
    print(f"🐾 [Sentinara GitOps Sentinel] Analyzing file: {file_path}")
    
    path_obj = Path(file_path)
    if not path_obj.exists():
        print(f"❌ Error: File '{file_path}' not found.")
        return 1

    try:
        data = IngestionEngine.load_environment_from_file(str(path_obj))
    except Exception as e:
        print(f"❌ Ingestion error: {e}")
        return 1

    # Run Analysis
    findings, posture = ComplianceEngine.evaluate(data)
    graph_data = AttackPathEngine.build_graph(data)
    remediations = RemediationEngine.generate_patches(findings)

    critical_count = posture.severity_breakdown.get("CRITICAL", 0)
    high_count = posture.severity_breakdown.get("HIGH", 0)
    attack_paths_count = len(graph_data.attack_paths)

    print("\n" + "="*70)
    print(f"🛡️  AUDITHOUND CI/CD SCAN RESULTS: {data.environment_name}")
    print(f"📊 Posture Score : {posture.overall_score}/100 [Grade {posture.letter_grade}]")
    print(f"🚨 Findings      : {len(findings)} Total (CRITICAL: {critical_count}, HIGH: {high_count})")
    print(f"🕸️  Attack Paths  : {attack_paths_count} Exploit Chains")
    print(f"🛠️  Terraform (.tf): {len(remediations)} Auto-Patches Ready")
    print("="*70 + "\n")

    # Generate PR Comment Markdown
    comment_md = f"""## 🛡️ Sentinara CI/CD Security Gate

### Assessment Summary for `{data.environment_name}` ({data.cloud_provider})
| Posture Score | Grade | Critical Risks | High Risks | Attack Paths |
|:---:|:---:|:---:|:---:|:---:|
| **{posture.overall_score}/100** | **{posture.letter_grade}** | **{critical_count}** | **{high_count}** | **{attack_paths_count}** |

### 🎯 Compliance Benchmark Evaluation
"""
    for fw in posture.framework_scores:
        status_icon = "✅" if fw.status == "COMPLIANT" else "⚠️" if fw.status == "WARNING" else "🚨"
        comment_md += f"- {status_icon} **{fw.framework}**: {fw.score_percentage}% ({fw.status})\n"

    if findings:
        comment_md += "\n### 🚨 Top Identified Security Findings\n"
        for f in findings[:5]:
            comment_md += f"- **[{f.severity}]** `{f.id}`: {f.title}\n  - *Impact*: {f.risk_impact}\n"

    if remediations:
        comment_md += f"\n### 🛠️ Automated Remediation\nSentinara generated **{len(remediations)} scoped Terraform (`.tf`) patches** to resolve these violations.\n"

    comment_md += "\n---\n*Generated autonomously by [Sentinara Security Sentinel](https://github.com/uzairphalgroo/cybersecurity-network/tree/main/audithound)*\n"

    if output_comment_path:
        with open(output_comment_path, "w", encoding="utf-8") as f:
            f.write(comment_md)
        print(f"📄 PR Comment markdown written to: {output_comment_path}")

    # Determine exit code
    if fail_severity.upper() == "CRITICAL" and critical_count > 0:
        print(f"\n❌ BUILD FAILED: {critical_count} CRITICAL security violations found.")
        return 1
    elif fail_severity.upper() == "HIGH" and (critical_count > 0 or high_count > 0):
        print(f"\n❌ BUILD FAILED: Security violations found above threshold '{fail_severity}'.")
        return 1

    print("\n✅ Security gate passed.")
    return 0

def main():
    parser = argparse.ArgumentParser(description="Sentinara CI/CD GitOps Security Sentinel")
    parser.add_argument("--file", required=True, help="Path to JSON cloud configuration dump")
    parser.add_argument("--fail-on", default="CRITICAL", choices=["CRITICAL", "HIGH", "MEDIUM", "NEVER"], help="Severity threshold to trigger non-zero exit")
    parser.add_argument("--output-comment", default="audithound_pr_comment.md", help="Path to write GitHub PR comment markdown")
    args = parser.parse_args()

    exit_code = run_ci_scan(args.file, args.fail_on, args.output_comment)
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
