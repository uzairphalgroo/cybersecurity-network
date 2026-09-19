"""Sentinara CLI - Autonomous Cloud Security Scanner & Remediation Generator."""
import argparse
import sys
import json
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.engine.ingestion import IngestionEngine
from app.engine.compliance import ComplianceEngine
from app.engine.attack_paths import AttackPathEngine
from app.engine.remediation import RemediationEngine
from app.engine.reporter import ReporterEngine
from app.models.schemas import AuditResponse
from datetime import datetime, timezone


def print_banner():
    print(r"""
================================================================================
   _             _ _ _   _   _                         _ 
  /_\  _   _  __| (_) |_| |_| | ___  _   _ _ __   __| |
 //_\\| | | |/ _` | | __|  _  |/ _ \| | | | '_ \ / _` |
/  _  \ |_| | (_| | | |_| | | | (_) | |_| | | | | (_| |
\_/ \_/\__,_|\__,_|_|\__|_| |_|\___/ \__,_|_| |_|\__,_|
               Autonomous Cloud Security & Compliance Engine
================================================================================
""")


def scan_file(file_path: str, output_report: str = None, output_tf: str = None):
    print_banner()
    path = Path(file_path)
    if not path.exists():
        print(f"[!] Error: File not found at '{file_path}'")
        sys.exit(1)

    print(f"[*] Ingesting cloud configuration from: {path.name}...")
    try:
        env = IngestionEngine.load_environment_from_file(path)
    except Exception as e:
        print(f"[!] Ingestion failed: {e}")
        sys.exit(1)

    print(f"[+] Loaded Environment: '{env.name}' ({env.cloud_provider.value})")
    print(f"[*] Running SOC2 & CIS Benchmark rules engine...")

    compliance_engine = ComplianceEngine()
    findings, score = compliance_engine.evaluate_environment(env)

    print(f"[*] Modeling permission graph & analyzing attack paths...")
    attack_engine = AttackPathEngine()
    graph_res = attack_engine.build_and_analyze_graph(env)

    print(f"[*] Generating least-privilege Terraform patches...")
    remediation_engine = RemediationEngine()
    batch_tf = remediation_engine.generate_batch_remediations(findings)

    # Print Summary Table
    print("\n" + "=" * 60)
    print(f" AUDIT SCORECARD: {score.overall_score}/100 (GRADE: {score.letter_grade})")
    print(f" RISK RATING: {score.risk_rating.upper()}")
    print("=" * 60)
    print(f" Total Findings       : {score.total_findings}")
    print(f"  - CRITICAL          : {score.severity_breakdown['CRITICAL']}")
    print(f"  - HIGH              : {score.severity_breakdown['HIGH']}")
    print(f"  - MEDIUM            : {score.severity_breakdown['MEDIUM']}")
    print(f"  - LOW               : {score.severity_breakdown['LOW']}")
    print(f" Attack Chains Found  : {graph_res.critical_attack_chains_count}")
    print(f" Terraform Patches    : {batch_tf.total_patches} patches generated")
    print("=" * 60)

    # Print Compliance breakdown
    print("\n--- Compliance Standards ---")
    for fw in score.framework_scores:
        print(f"  [{fw.status}] {fw.framework}: {fw.score_percentage}% ({fw.passed_checks}/{fw.total_checks} passed)")

    # Print Top Attack Paths
    if graph_res.attack_paths:
        print("\n--- Critical Privilege Escalation Attack Chains ---")
        for idx, ap in enumerate(graph_res.attack_paths, 1):
            print(f"  {idx}. {ap.title} ({ap.hop_count} hops)")
            print(f"     Path: {ap.entry_point} -> {ap.target}")
            print(f"     Technique: {ap.cve_or_technique}")

    # Output HTML Report if requested
    if output_report:
        timestamp_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        audit_res = AuditResponse(
            environment_id=env.id,
            environment_name=env.name,
            provider=env.cloud_provider,
            timestamp=timestamp_str,
            posture_score=score,
            findings=findings,
            graph_data=graph_res,
            remediation_patches=batch_tf.patches,
            executive_summary=f"Audit completed with score {score.overall_score}/100."
        )
        html_content = ReporterEngine.generate_html_report(audit_res)
        out_path = Path(output_report)
        out_path.write_text(html_content, encoding="utf-8")
        print(f"\n[+] Executive HTML Audit Report saved to: {out_path.resolve()}")

    # Output Terraform Patch file if requested
    if output_tf:
        out_tf_path = Path(output_tf)
        out_tf_path.write_text(batch_tf.combined_terraform, encoding="utf-8")
        print(f"[+] Combined Terraform Remediation bundle saved to: {out_tf_path.resolve()}")


def main():
    parser = argparse.ArgumentParser(
        description="Sentinara: Autonomous Cloud Security & SOC2/CIS Compliance Engine CLI"
    )
    parser.add_argument("file", help="Path to cloud configuration JSON dump")
    parser.add_argument("--report", "-r", help="Output path for executive HTML report (e.g. audit_report.html)")
    parser.add_argument("--tf-out", "-t", help="Output path for combined Terraform .tf patch file (e.g. remediate.tf)")

    args = parser.parse_args()
    scan_file(args.file, args.report, args.tf_out)


if __name__ == "__main__":
    main()
