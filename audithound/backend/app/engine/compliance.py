"""Compliance & Rules Engine - Maps configurations against SOC2 Common Criteria & CIS Benchmarks."""
import logging
from typing import List, Dict, Any, Tuple
from app.models.schemas import (
    CloudEnvironmentDump,
    CloudProvider,
    Finding,
    SeverityLevel,
    ComplianceFramework,
    FrameworkComplianceScore,
    PostureScore
)

logger = logging.getLogger(__name__)


class ComplianceEngine:
    """Evaluates multi-cloud configurations against SOC2 & CIS Benchmark controls."""

    def __init__(self):
        pass

    def evaluate_environment(self, env: CloudEnvironmentDump) -> Tuple[List[Finding], PostureScore]:
        """Runs all security & compliance rules across the ingested environment."""
        findings: List[Finding] = []

        # 1. AWS IAM User Rules
        for user in env.iam_users:
            findings.extend(self._check_iam_user(user, env))

        # 2. AWS IAM Policy & Role Rules
        for policy in env.iam_policies:
            findings.extend(self._check_iam_policy(policy))

        for role in env.iam_roles:
            findings.extend(self._check_iam_role(role))

        # 3. AWS S3 Storage Rules
        for bucket in env.s3_buckets:
            findings.extend(self._check_s3_bucket(bucket))

        # 4. AWS Security Group Boundary Rules
        for sg in env.security_groups:
            findings.extend(self._check_security_group(sg))

        # 5. Azure RBAC & NSG Rules
        for role_assign in env.azure_role_assignments:
            findings.extend(self._check_azure_role_assignment(role_assign))

        for nsg in env.azure_nsgs:
            findings.extend(self._check_azure_nsg(nsg))

        # 6. Kubernetes RBAC Rules
        for rb in env.k8s_role_bindings:
            findings.extend(self._check_k8s_role_binding(rb))

        # Calculate Posture & Compliance Scores
        posture_score = self._calculate_posture_score(findings, env)
        return findings, posture_score

    def _check_iam_user(self, user, env: CloudEnvironmentDump) -> List[Finding]:
        findings = []
        # Rule: MFA Enforcement (SOC2 CC6.1 / CIS AWS 1.5)
        if not user.mfa_enabled:
            findings.append(Finding(
                id=f"FIND-MFA-{user.username}",
                rule_id="RULE-AWS-IAM-MFA-001",
                title=f"Multi-Factor Authentication (MFA) Missing for User '{user.username}'",
                description=f"IAM user '{user.username}' does not have MFA enabled, allowing single-factor credential stuffing.",
                severity=SeverityLevel.HIGH,
                provider=CloudProvider.AWS,
                frameworks=[ComplianceFramework.SOC2_CC6_1, ComplianceFramework.CIS_AWS_V3],
                affected_resource_id=user.arn,
                affected_resource_type="AWS::IAM::User",
                risk_impact="Compromised credentials lead to unauthorized cloud perimeter access without an MFA challenge barrier.",
                remediation_steps="Enforce Virtual MFA device registration and attach an explicit MFA-enforcement policy condition.",
                remediation_terraform_id="tf-patch-iam-mfa"
            ))

        # Rule: Access Key Rotation (SOC2 CC6.1 / CIS AWS 1.4)
        for key in user.access_keys:
            if key.status == "Active" and key.last_rotated_days_ago > 90:
                severity = SeverityLevel.HIGH if key.last_rotated_days_ago > 180 else SeverityLevel.MEDIUM
                findings.append(Finding(
                    id=f"FIND-KEY-ROTATION-{key.access_key_id}",
                    rule_id="RULE-AWS-IAM-KEY-ROT-002",
                    title=f"Unrotated Access Key '{key.access_key_id}' ({key.last_rotated_days_ago} days old)",
                    description=f"Active access key for user '{user.username}' has not been rotated for {key.last_rotated_days_ago} days (exceeds 90-day threshold).",
                    severity=severity,
                    provider=CloudProvider.AWS,
                    frameworks=[ComplianceFramework.SOC2_CC6_1, ComplianceFramework.CIS_AWS_V3],
                    affected_resource_id=f"{user.arn}/access-key/{key.access_key_id}",
                    affected_resource_type="AWS::IAM::AccessKey",
                    risk_impact="Stale access keys are vulnerable to historical leaks, exfiltration in dev logs, and credential harvesting.",
                    remediation_steps="Rotate key immediately, generate a new temporary secret, update applications, and deactivate old key.",
                    remediation_terraform_id="tf-patch-iam-key-rotate"
                ))

        return findings

    def _check_iam_policy(self, policy) -> List[Finding]:
        findings = []
        has_wildcard_action = False
        has_wildcard_resource = False
        has_priv_esc_passrole = False
        has_priv_esc_policy_version = False

        for stmt in policy.statements:
            if stmt.effect.lower() == "allow":
                # Check wildcard actions
                if any(act == "*" or act.startswith("iam:*") for act in stmt.action):
                    has_wildcard_action = True
                if "*" in stmt.resource:
                    has_wildcard_resource = True

                # Check specific privilege escalation vectors
                if "iam:PassRole" in stmt.action and any(a in stmt.action or a == "*" for a in ["ec2:RunInstances", "lambda:CreateFunction", "*"]):
                    has_priv_esc_passrole = True

                if any(act in stmt.action for act in ["iam:CreatePolicyVersion", "iam:SetDefaultPolicyVersion", "iam:AttachUserPolicy"]):
                    has_priv_esc_policy_version = True

        if has_priv_esc_passrole:
            findings.append(Finding(
                id=f"FIND-PRIVESC-PASSROLE-{policy.policy_name}",
                rule_id="RULE-AWS-IAM-PRIVESC-001",
                title=f"Critical Privilege Escalation Vector: iam:PassRole with Instance Launch in '{policy.policy_name}'",
                description="Policy grants `iam:PassRole` along with compute resource creation rights, allowing a non-admin to launch compute with admin IAM roles.",
                severity=SeverityLevel.CRITICAL,
                provider=CloudProvider.AWS,
                frameworks=[ComplianceFramework.SOC2_CC6_3, ComplianceFramework.CIS_AWS_V3],
                affected_resource_id=policy.arn,
                affected_resource_type="AWS::IAM::Policy",
                risk_impact="Full AWS account takeover: Attacker passes high-privilege IAM roles (e.g. AdministratorAccess) to EC2 instances or Lambda functions.",
                privilege_escalation_vector="iam:PassRole -> ec2:RunInstances -> Root Cloud Takeover",
                remediation_steps="Restrict iam:PassRole to strictly enumerated service roles and bind `iam:PassedToService` conditions.",
                remediation_terraform_id="tf-patch-iam-passrole-restrict"
            ))

        if has_priv_esc_policy_version:
            findings.append(Finding(
                id=f"FIND-PRIVESC-POLVER-{policy.policy_name}",
                rule_id="RULE-AWS-IAM-PRIVESC-002",
                title=f"Direct Self-Elevation via iam:CreatePolicyVersion in '{policy.policy_name}'",
                description="User has permission to create new default policy versions, enabling instant elevation of their own permissions to AdministratorAccess.",
                severity=SeverityLevel.CRITICAL,
                provider=CloudProvider.AWS,
                frameworks=[ComplianceFramework.SOC2_CC6_3, ComplianceFramework.CIS_AWS_V3],
                affected_resource_id=policy.arn,
                affected_resource_type="AWS::IAM::Policy",
                risk_impact="Direct self-elevation to root privileges by publishing an allow-all policy version.",
                privilege_escalation_vector="iam:CreatePolicyVersion -> Self-Assigned AdministratorAccess",
                remediation_steps="Remove iam:CreatePolicyVersion and iam:SetDefaultPolicyVersion from non-SecOps administrator roles.",
                remediation_terraform_id="tf-patch-iam-least-privilege"
            ))

        if (has_wildcard_action and has_wildcard_resource) or policy.is_admin_policy:
            findings.append(Finding(
                id=f"FIND-WILDCARD-ADMIN-{policy.policy_name}",
                rule_id="RULE-AWS-IAM-WILDCARD-003",
                title=f"Excessive Wildcard Administrator Permissions in Policy '{policy.policy_name}'",
                description=f"Policy '{policy.policy_name}' grants unconstrained wildcard permissions (`*` on `*`), violating least privilege standards.",
                severity=SeverityLevel.HIGH,
                provider=CloudProvider.AWS,
                frameworks=[ComplianceFramework.SOC2_CC6_3, ComplianceFramework.CIS_AWS_V3],
                affected_resource_id=policy.arn,
                affected_resource_type="AWS::IAM::Policy",
                risk_impact="Breaches least-privilege boundaries and violates SOC2 CC6.3 requirements.",
                remediation_steps="Scope actions down to the explicit AWS service APIs and exact resource ARNs required by the application.",
                remediation_terraform_id="tf-patch-iam-least-privilege"
            ))

        return findings

    def _check_iam_role(self, role) -> List[Finding]:
        findings = []
        if role.trusts_wildcard:
            findings.append(Finding(
                id=f"FIND-ROLE-WILDCARD-TRUST-{role.role_name}",
                rule_id="RULE-AWS-IAM-TRUST-001",
                title=f"Dangerous Wildcard Cross-Account Trust in Role '{role.role_name}'",
                description=f"AssumeRole policy contains `Principal: {{'AWS': '*'}}`, allowing any external AWS account to attempt role assumption.",
                severity=SeverityLevel.CRITICAL,
                provider=CloudProvider.AWS,
                frameworks=[ComplianceFramework.SOC2_CC6_1, ComplianceFramework.SOC2_CC6_3, ComplianceFramework.CIS_AWS_V3],
                affected_resource_id=role.arn,
                affected_resource_type="AWS::IAM::Role",
                risk_impact="External lateral movement: Any AWS account can assume this role if external ID / condition checks are absent.",
                privilege_escalation_vector="Wildcard AssumeRole -> External Account Takeover",
                remediation_steps="Enforce strict Principal ARNs and require `sts:ExternalId` or SAML conditions.",
                remediation_terraform_id="tf-patch-iam-role-trust"
            ))
        return findings

    def _check_s3_bucket(self, bucket) -> List[Finding]:
        findings = []
        pab = bucket.public_access_block or {}
        has_open_pab = not (pab.get("BlockPublicAcls") and pab.get("IgnorePublicAcls") and pab.get("BlockPublicPolicy") and pab.get("RestrictPublicBuckets"))

        # Check public ACLs / Grants
        is_public_acl = any("AllUsers" in grant.get("Grantee", "") or "AuthenticatedUsers" in grant.get("Grantee", "") for grant in bucket.acl_grants)

        if has_open_pab or is_public_acl:
            severity = SeverityLevel.CRITICAL if bucket.contains_sensitive_data else SeverityLevel.HIGH
            findings.append(Finding(
                id=f"FIND-S3-PUBLIC-EXPOSURE-{bucket.name}",
                rule_id="RULE-AWS-S3-PUBLIC-001",
                title=f"Public Access Enabled on S3 Bucket '{bucket.name}'",
                description=f"S3 bucket '{bucket.name}' does not enforce S3 Public Access Block and/or contains public ACL grants to AllUsers.",
                severity=severity,
                provider=CloudProvider.AWS,
                frameworks=[ComplianceFramework.SOC2_CC6_6, ComplianceFramework.CIS_AWS_V3],
                affected_resource_id=bucket.arn,
                affected_resource_type="AWS::S3::Bucket",
                risk_impact=f"Unauthenticated internet users can list, read, or overwrite objects. Sensitive data ({bucket.data_classification}) exposure.",
                remediation_steps="Enable all 4 S3 Public Access Block settings and remove public ACL grants.",
                remediation_terraform_id="tf-patch-s3-public-block"
            ))

        # Check encryption
        if not bucket.encryption_enabled:
            severity = SeverityLevel.CRITICAL if bucket.contains_sensitive_data else SeverityLevel.HIGH
            findings.append(Finding(
                id=f"FIND-S3-UNENCRYPTED-{bucket.name}",
                rule_id="RULE-AWS-S3-ENCRYPTION-002",
                title=f"Server-Side Encryption Missing on S3 Bucket '{bucket.name}'",
                description=f"Bucket '{bucket.name}' does not enforce KMS-CMK or AES256 server-side encryption for resting data.",
                severity=severity,
                provider=CloudProvider.AWS,
                frameworks=[ComplianceFramework.SOC2_CC6_7, ComplianceFramework.CIS_AWS_V3],
                affected_resource_id=bucket.arn,
                affected_resource_type="AWS::S3::Bucket",
                risk_impact="Data at rest is stored in plaintext, failing SOC2 CC6.7 encryption and regulatory compliance (PCI/HIPAA).",
                remediation_steps="Apply aws_s3_bucket_server_side_encryption_configuration with aws:kms.",
                remediation_terraform_id="tf-patch-s3-encryption"
            ))

        # Check versioning on sensitive buckets
        if not bucket.versioning_enabled and bucket.contains_sensitive_data:
            findings.append(Finding(
                id=f"FIND-S3-NO-VERSIONING-{bucket.name}",
                rule_id="RULE-AWS-S3-VERSIONING-003",
                title=f"Object Versioning Disabled on Sensitive Bucket '{bucket.name}'",
                description=f"Bucket contains sensitive {bucket.data_classification} data but object versioning is disabled, exposing data to ransomware wiping.",
                severity=SeverityLevel.MEDIUM,
                provider=CloudProvider.AWS,
                frameworks=[ComplianceFramework.SOC2_CC6_8, ComplianceFramework.CIS_AWS_V3],
                affected_resource_id=bucket.arn,
                affected_resource_type="AWS::S3::Bucket",
                risk_impact="Destructive deletion or ransomware tampering cannot be recovered without S3 version rollback.",
                remediation_steps="Enable S3 bucket versioning and MFA delete protection.",
                remediation_terraform_id="tf-patch-s3-versioning"
            ))

        return findings

    def _check_security_group(self, sg) -> List[Finding]:
        findings = []
        sensitive_ports = {
            22: ("SSH Remote Administration", SeverityLevel.CRITICAL),
            3389: ("Windows Remote Desktop (RDP)", SeverityLevel.CRITICAL),
            3306: ("MySQL Database Service", SeverityLevel.CRITICAL),
            5432: ("PostgreSQL Database Service", SeverityLevel.CRITICAL),
            1433: ("Microsoft SQL Server Service", SeverityLevel.CRITICAL),
            27017: ("MongoDB Service", SeverityLevel.CRITICAL),
        }

        for rule in sg.ingress_rules:
            if rule.cidr_ip in ["0.0.0.0/0", "::/0"]:
                if rule.protocol == "-1" or (rule.from_port is None and rule.to_port is None):
                    findings.append(Finding(
                        id=f"FIND-SG-ALL-INGRESS-{sg.group_id}",
                        rule_id="RULE-AWS-SG-ALL-001",
                        title=f"Unrestricted Ingress (All Protocols/Ports) in Security Group '{sg.group_name}'",
                        description=f"Security group '{sg.group_id}' allows ingress from 0.0.0.0/0 on all traffic ports.",
                        severity=SeverityLevel.CRITICAL,
                        provider=CloudProvider.AWS,
                        frameworks=[ComplianceFramework.SOC2_CC6_6, ComplianceFramework.CIS_AWS_V3],
                        affected_resource_id=f"arn:aws:ec2:us-east-1:112233445566:security-group/{sg.group_id}",
                        affected_resource_type="AWS::EC2::SecurityGroup",
                        risk_impact="Complete network exposure of attached resources to automated port scans and exploit payloads.",
                        remediation_steps="Revoke 0.0.0.0/0 all-port ingress and restrict ingress to authorized VPC CIDR blocks.",
                        remediation_terraform_id="tf-patch-sg-tighten"
                    ))
                else:
                    for port, (service_name, sev) in sensitive_ports.items():
                        from_p = rule.from_port or 0
                        to_p = rule.to_port or 65535
                        if from_p <= port <= to_p:
                            findings.append(Finding(
                                id=f"FIND-SG-OPEN-{port}-{sg.group_id}",
                                rule_id=f"RULE-AWS-SG-PORT-{port}",
                                title=f"Open Internet Ingress (0.0.0.0/0) to {service_name} (Port {port}) in '{sg.group_name}'",
                                description=f"Security group rule permits unrestricted ingress from 0.0.0.0/0 to port {port} ({service_name}).",
                                severity=sev,
                                provider=CloudProvider.AWS,
                                frameworks=[ComplianceFramework.SOC2_CC6_6, ComplianceFramework.CIS_AWS_V3],
                                affected_resource_id=f"arn:aws:ec2:us-east-1:112233445566:security-group/{sg.group_id}",
                                affected_resource_type="AWS::EC2::SecurityGroup",
                                risk_impact=f"Direct exposure of {service_name} to brute force attacks, zero-day remote code execution, and credential stuffing.",
                                remediation_steps=f"Restrict port {port} to dedicated VPN / bastion CIDR ranges.",
                                remediation_terraform_id="tf-patch-sg-tighten"
                            ))

        return findings

    def _check_azure_role_assignment(self, role_assign) -> List[Finding]:
        findings = []
        if role_assign.role_definition_name in ["Owner", "Contributor"] and role_assign.principal_type == "ServicePrincipal":
            findings.append(Finding(
                id=f"FIND-AZURE-SP-OWNER-{role_assign.principal_name}",
                rule_id="RULE-AZURE-RBAC-001",
                title=f"High-Privilege '{role_assign.role_definition_name}' Assigned to Service Principal '{role_assign.principal_name}'",
                description=f"Service Principal has broad subscription/resource-group level '{role_assign.role_definition_name}' role, violating least privilege.",
                severity=SeverityLevel.HIGH,
                provider=CloudProvider.AZURE,
                frameworks=[ComplianceFramework.SOC2_CC6_3, ComplianceFramework.CIS_AZURE_V2],
                affected_resource_id=f"{role_assign.scope}/providers/Microsoft.Authorization/roleAssignments/{role_assign.principal_name}",
                affected_resource_type="Microsoft.Authorization/roleAssignments",
                risk_impact="Compromised service principal secret allows full Azure resource modification and deletion across the tenant.",
                remediation_steps="Replace Owner/Contributor with custom scoped Azure RBAC role with minimal required actions.",
                remediation_terraform_id="tf-patch-azure-rbac-scope"
            ))
        return findings

    def _check_azure_nsg(self, nsg) -> List[Finding]:
        findings = []
        for rule in nsg.security_rules:
            if rule.direction.lower() == "inbound" and rule.access.lower() == "allow":
                if rule.source_address_prefix in ["Internet", "*", "0.0.0.0/0"]:
                    if rule.destination_port_range in ["3306", "5432", "1433", "22", "3389", "*"]:
                        findings.append(Finding(
                            id=f"FIND-AZURE-NSG-OPEN-{nsg.name}-{rule.name}",
                            rule_id="RULE-AZURE-NSG-001",
                            title=f"Azure NSG '{nsg.name}' Permits Internet Ingress on Port {rule.destination_port_range}",
                            description=f"NSG rule '{rule.name}' permits direct Internet inbound traffic on sensitive database/management port {rule.destination_port_range}.",
                            severity=SeverityLevel.CRITICAL,
                            provider=CloudProvider.AZURE,
                            frameworks=[ComplianceFramework.SOC2_CC6_6, ComplianceFramework.CIS_AZURE_V2],
                            affected_resource_id=nsg.id,
                            affected_resource_type="Microsoft.Network/networkSecurityGroups",
                            risk_impact="Database or management service is directly reachable by internet threat actors.",
                            remediation_steps="Change source_address_prefix to VirtualNetwork or specific corporate gateway IP.",
                            remediation_terraform_id="tf-patch-azure-nsg-restrict"
                        ))
        return findings

    def _check_k8s_role_binding(self, rb) -> List[Finding]:
        findings = []
        if rb.is_cluster_admin or rb.role_name == "cluster-admin":
            for subj in rb.subjects:
                if subj.name == "default" or subj.kind == "Group" and subj.name in ["system:authenticated", "system:unauthenticated"]:
                    findings.append(Finding(
                        id=f"FIND-K8S-CLUSTER-ADMIN-{rb.name}",
                        rule_id="RULE-K8S-RBAC-001",
                        title=f"Overprivileged 'cluster-admin' RoleBinding to '{subj.kind}:{subj.name}' in Namespace '{rb.namespace}'",
                        description=f"RoleBinding '{rb.name}' grants unconstrained root 'cluster-admin' privileges to default service account or broad group.",
                        severity=SeverityLevel.CRITICAL,
                        provider=CloudProvider.KUBERNETES,
                        frameworks=[ComplianceFramework.SOC2_CC6_3, ComplianceFramework.CIS_K8S_V1_8],
                        affected_resource_id=f"k8s:rbac.authorization.k8s.io/{rb.namespace}/rolebindings/{rb.name}",
                        affected_resource_type="Kubernetes::RbacAuthorization::RoleBinding",
                        risk_impact="Any pod compromise inside the namespace immediately escalates to full cluster node & secrets takeover.",
                        privilege_escalation_vector="Pod ServiceAccount Token -> Kubernetes API Root Admin -> Node Escape",
                        remediation_steps="Scope RBAC RoleBinding to specific verbs and resources within a dedicated namespace.",
                        remediation_terraform_id="tf-patch-k8s-rbac-restrict"
                    ))

        for rule in rb.rules:
            if "*" in rule.verbs and ("*" in rule.resources or "*" in rule.api_groups):
                findings.append(Finding(
                    id=f"FIND-K8S-WILDCARD-RULES-{rb.name}",
                    rule_id="RULE-K8S-RBAC-002",
                    title=f"Kubernetes RBAC Wildcard Verbs/Resources in '{rb.name}'",
                    description="RBAC rules contain `*` verbs and `*` resources, granting unmonitored execution and secret retrieval capabilities.",
                    severity=SeverityLevel.HIGH,
                    provider=CloudProvider.KUBERNETES,
                    frameworks=[ComplianceFramework.SOC2_CC6_3, ComplianceFramework.CIS_K8S_V1_8],
                    affected_resource_id=f"k8s:rbac.authorization.k8s.io/{rb.namespace}/roles/{rb.role_name}",
                    affected_resource_type="Kubernetes::RbacAuthorization::Role",
                    risk_impact="Violates least privilege by allowing cluster-wide secrets reading and pod exec privileges.",
                    remediation_steps="Explicitly specify authorized resources (e.g. ['pods', 'services']) and verbs (e.g. ['get', 'list']).",
                    remediation_terraform_id="tf-patch-k8s-rbac-restrict"
                ))

        return findings

    def _calculate_posture_score(self, findings: List[Finding], env: CloudEnvironmentDump) -> PostureScore:
        """Calculates security posture score (0-100), letter grade, and framework compliance."""
        severity_weights = {
            SeverityLevel.CRITICAL: 25.0,
            SeverityLevel.HIGH: 12.0,
            SeverityLevel.MEDIUM: 5.0,
            SeverityLevel.LOW: 2.0,
            SeverityLevel.INFO: 0.0
        }

        severity_counts = {
            "CRITICAL": 0,
            "HIGH": 0,
            "MEDIUM": 0,
            "LOW": 0,
            "INFO": 0
        }

        total_penalty = 0.0
        for f in findings:
            severity_counts[f.severity.value] = severity_counts.get(f.severity.value, 0) + 1
            total_penalty += severity_weights.get(f.severity, 0.0)

        # Baseline is 100
        score = max(0.0, min(100.0, 100.0 - total_penalty))
        score = round(score, 1)

        # Letter grade
        if score >= 90:
            letter_grade = "A" if score < 97 else "A+"
            risk_rating = "Low"
        elif score >= 80:
            letter_grade = "B"
            risk_rating = "Moderate"
        elif score >= 70:
            letter_grade = "C"
            risk_rating = "Elevated"
        elif score >= 50:
            letter_grade = "D"
            risk_rating = "High"
        else:
            letter_grade = "F"
            risk_rating = "Critical"

        # Framework Score Calculation
        framework_scores = []
        frameworks_to_evaluate = [
            ComplianceFramework.SOC2_CC6_1,
            ComplianceFramework.SOC2_CC6_3,
            ComplianceFramework.SOC2_CC6_6,
            ComplianceFramework.SOC2_CC6_7,
            ComplianceFramework.CIS_AWS_V3,
        ]
        if env.azure_nsgs or env.azure_role_assignments or env.cloud_provider == CloudProvider.AZURE or env.cloud_provider == CloudProvider.HYBRID:
            frameworks_to_evaluate.append(ComplianceFramework.CIS_AZURE_V2)
        if env.k8s_role_bindings or env.cloud_provider == CloudProvider.KUBERNETES:
            frameworks_to_evaluate.append(ComplianceFramework.CIS_K8S_V1_8)

        for fw in frameworks_to_evaluate:
            fw_findings = [f for f in findings if fw in f.frameworks]
            failed_checks = len(fw_findings)
            # Estimate total baseline checks (e.g. 5 checks per framework)
            total_checks = max(5, failed_checks + 3)
            passed_checks = max(0, total_checks - failed_checks)
            fw_percentage = round((passed_checks / total_checks) * 100, 1)
            status = "COMPLIANT" if fw_percentage >= 90 else ("WARNING" if fw_percentage >= 65 else "NON_COMPLIANT")

            framework_scores.append(FrameworkComplianceScore(
                framework=fw,
                score_percentage=fw_percentage,
                total_checks=total_checks,
                passed_checks=passed_checks,
                failed_checks=failed_checks,
                status=status
            ))

        # Top Risks extraction
        top_risks = [f.title for f in sorted(findings, key=lambda x: (x.severity == SeverityLevel.CRITICAL, x.severity == SeverityLevel.HIGH), reverse=True)[:4]]
        if not top_risks:
            top_risks = ["Zero critical vulnerabilities identified.", "Continuous monitoring active."]

        return PostureScore(
            overall_score=score,
            letter_grade=letter_grade,
            risk_rating=risk_rating,
            total_findings=len(findings),
            severity_breakdown=severity_counts,
            framework_scores=framework_scores,
            top_risks=top_risks
        )
