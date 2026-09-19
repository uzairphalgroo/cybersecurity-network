import { AuditResponse, EnvironmentSummary } from '../types/audit';

export const MOCK_ENVIRONMENTS_CATALOG: EnvironmentSummary[] = [
  {
    id: 'crypto_miner_breach_vector',
    file_name: '04_crypto_miner_breach_vector.json',
    name: 'Crypto-Miner Breach Vector (PassRole Escalation)',
    description: 'Junior Dev possesses iam:PassRole combined with ec2:RunInstances, allowing execution of EC2 instances with high-privileged AdminRole.',
    cloud_provider: 'AWS',
    created_at: '2026-09-12T09:15:00Z',
    classification: 'High Breach Risk',
    tier: 'Vulnerable Research Sandbox'
  },
  {
    id: 'fintech_prod_banking',
    file_name: '01_fintech_prod_banking.json',
    name: 'Fintech Tier-1 Production Banking Cloud',
    description: 'SOC2 CC6.1/6.3 and CIS AWS 3.0 hardened production environment with strict least-privilege RBAC, KMS-CMK encryption, and zero open public ingress.',
    cloud_provider: 'AWS',
    created_at: '2026-09-15T08:00:00Z',
    classification: 'PCI-DSS / SOC2 Type II Hardened',
    tier: 'Production Banking'
  },
  {
    id: 'aerospace_defense_cloud',
    file_name: '02_aerospace_defense_cloud.json',
    name: 'Aerospace & Defense Sovereign Enclave',
    description: 'FedRAMP High & CIS AWS Benchmark v3.0 certified enclave with zero wildcard permissions, hardware MFA enforcement, and zero direct internet ingress.',
    cloud_provider: 'AWS',
    created_at: '2026-09-16T10:00:00Z',
    classification: 'ITAR / FedRAMP High',
    tier: 'Mission-Critical Enclave'
  },
  {
    id: 'shadow_it_dev_sandbox',
    file_name: '03_shadow_it_dev_sandbox.json',
    name: 'Shadow IT Dev Sandbox',
    description: 'Unmonitored developer sandbox environment containing open 0.0.0.0/0 ingress for SSH & RDP, unauthenticated S3 read/write, and missing MFA.',
    cloud_provider: 'AWS',
    created_at: '2026-09-10T14:20:00Z',
    classification: 'Non-Compliant',
    tier: 'Development Sandbox'
  },
  {
    id: 'leaky_health_datalake',
    file_name: '05_leaky_health_datalake.json',
    name: 'Leaky Health DataLake (HIPAA Violation)',
    description: 'Healthcare analytics environment storing Electronic Protected Health Information (ePHI) in an unencrypted S3 bucket with public read ACLs and disabled public access blocks.',
    cloud_provider: 'AWS',
    created_at: '2026-09-08T11:45:00Z',
    classification: 'HIPAA ePHI Critical Exposure',
    tier: 'Data Engineering'
  },
  {
    id: 'k8s_cluster_takeover',
    file_name: '06_k8s_cluster_takeover.json',
    name: 'Kubernetes Cluster Takeover Vector',
    description: 'Production EKS/GKE cluster with an overly permissive default namespace ServiceAccount bound to cluster-admin, allowing any container compromised in default namespace full cluster root access.',
    cloud_provider: 'Kubernetes',
    created_at: '2026-09-14T16:00:00Z',
    classification: 'CIS K8s Critical Violation',
    tier: 'Kubernetes Ingress Cluster'
  },
  {
    id: 'stale_key_exfiltration',
    file_name: '07_stale_key_exfiltration.json',
    name: 'Stale IAM Key Exfiltration Risk',
    description: 'Enterprise environment containing unrotated access keys older than 180 days, missing MFA enforcement on privileged IAM users, and dormant accounts with full admin policies.',
    cloud_provider: 'AWS',
    created_at: '2026-09-01T15:30:00Z',
    classification: 'Credential Hygiene Failure',
    tier: 'Core Infrastructure'
  },
  {
    id: 'multi_cloud_hybrid_transit',
    file_name: '08_multi_cloud_hybrid_transit.json',
    name: 'Multi-Cloud Hybrid Transit (Azure + AWS)',
    description: 'Hybrid cloud interconnect with Azure NSG allowing direct Internet inbound to database ports (3306 MySQL, 5432 PostgreSQL) and AWS IAM wildcard cross-account trust policies.',
    cloud_provider: 'Hybrid',
    created_at: '2026-09-11T13:00:00Z',
    classification: 'Multi-Cloud Ingress Flaw',
    tier: 'Hybrid Transit Network'
  },
  {
    id: 'ecommerce_pci_noncompliant',
    file_name: '09_ecommerce_pci_noncompliant.json',
    name: 'E-Commerce Cardholder Data Environment (PCI Violation)',
    description: 'Retail checkout payment architecture with unencrypted S3 cardholder exports, overly permissive database security groups exposing port 3306 to public subnets, and missing MFA.',
    cloud_provider: 'AWS',
    created_at: '2026-09-05T14:10:00Z',
    classification: 'PCI-DSS Scope Failure',
    tier: 'PCI Scope CDE'
  },
  {
    id: 'ransomware_target_enterprise',
    file_name: '10_ransomware_target_enterprise.json',
    name: 'Ransomware Blast Radius (Wipeout Vector)',
    description: 'Enterprise cloud with vulnerable IAM policy creation rights (`iam:CreatePolicyVersion`) allowing low-privilege users to elevate themselves to root, combined with unversioned critical S3 storage vulnerable to destructive encryption/deletion.',
    cloud_provider: 'AWS',
    created_at: '2026-09-02T10:15:00Z',
    classification: 'Critical Ransomware Blast Radius',
    tier: 'Enterprise Operations'
  }
];

export const STATIC_AUDIT_RESPONSES: Record<string, AuditResponse> = {
  crypto_miner_breach_vector: {
    environment_id: 'crypto_miner_breach_vector',
    environment_name: 'Crypto-Miner Breach Vector (PassRole Escalation)',
    provider: 'AWS',
    timestamp: '2026-09-19 18:00:00 UTC',
    posture_score: {
      overall_score: 58.0,
      letter_grade: 'D',
      risk_rating: 'High',
      total_findings: 3,
      severity_breakdown: { CRITICAL: 1, HIGH: 1, MEDIUM: 1, LOW: 0, INFO: 0 },
      framework_scores: [
        { framework: 'SOC2 CC6.1 (Logical Access)', score_percentage: 60.0, total_checks: 5, passed_checks: 3, failed_checks: 2, status: 'WARNING' },
        { framework: 'SOC2 CC6.3 (Least Privilege & RBAC)', score_percentage: 80.0, total_checks: 5, passed_checks: 4, failed_checks: 1, status: 'WARNING' },
        { framework: 'SOC2 CC6.6 (Boundary Protection)', score_percentage: 100.0, total_checks: 5, passed_checks: 5, failed_checks: 0, status: 'COMPLIANT' },
        { framework: 'SOC2 CC6.7 (Data Transmission Security)', score_percentage: 100.0, total_checks: 5, passed_checks: 5, failed_checks: 0, status: 'COMPLIANT' },
        { framework: 'CIS AWS Foundations Benchmark v3.0', score_percentage: 50.0, total_checks: 6, passed_checks: 3, failed_checks: 3, status: 'NON_COMPLIANT' }
      ],
      top_risks: [
        "Critical Privilege Escalation: iam:PassRole combined with ec2:RunInstances",
        "Multi-Factor Authentication (MFA) Missing for User 'jr_developer_dave'",
        "Unrotated Access Key 'AKIADAVEDEVKEY004455' (120 days old)"
      ]
    },
    findings: [
      {
        id: 'FIND-PRIVESC-PASSROLE-PassRoleAndEC2LaunchPolicy',
        rule_id: 'RULE-AWS-IAM-PRIVESC-001',
        title: "Critical Privilege Escalation: iam:PassRole with Instance Launch in 'PassRoleAndEC2LaunchPolicy'",
        description: "Policy grants `iam:PassRole` along with compute resource creation rights, allowing a non-admin user to launch EC2 compute instances equipped with root-level Administrator IAM roles.",
        severity: 'CRITICAL',
        provider: 'AWS',
        frameworks: ['SOC2 CC6.3 (Least Privilege & RBAC)', 'CIS AWS Foundations Benchmark v3.0'],
        affected_resource_id: 'arn:aws:iam::445566778899:policy/PassRoleAndEC2LaunchPolicy',
        affected_resource_type: 'AWS::IAM::Policy',
        risk_impact: 'Full AWS Account Compromise: Attacker extracts administrator temporary STS credentials from the instance IMDSv2 metadata service to achieve root control.',
        privilege_escalation_vector: 'User: jr_developer_dave -> iam:PassRole -> OverPrivilegedAdminInstanceRole -> Full Root Cloud Takeover',
        remediation_steps: 'Scope iam:PassRole to strictly enumerated service roles and require iam:PassedToService = "ec2.amazonaws.com" condition.',
        remediation_terraform_id: 'tf-patch-iam-passrole-restrict'
      },
      {
        id: 'FIND-MFA-jr_developer_dave',
        rule_id: 'RULE-AWS-IAM-MFA-001',
        title: "Multi-Factor Authentication (MFA) Missing for User 'jr_developer_dave'",
        description: "IAM user has active credentials without virtual MFA hardware token enforcement.",
        severity: 'HIGH',
        provider: 'AWS',
        frameworks: ['SOC2 CC6.1 (Logical Access)', 'CIS AWS Foundations Benchmark v3.0'],
        affected_resource_id: 'arn:aws:iam::445566778899:user/jr_developer_dave',
        affected_resource_type: 'AWS::IAM::User',
        risk_impact: 'Compromised developer credentials allow direct password spray and single-factor API authentication.',
        remediation_steps: 'Enforce MFA registration and attach an explicit aws:MultiFactorAuthPresent condition policy.',
        remediation_terraform_id: 'tf-patch-iam-mfa'
      },
      {
        id: 'FIND-KEY-ROTATION-AKIADAVEDEVKEY004455',
        rule_id: 'RULE-AWS-IAM-KEY-ROT-002',
        title: "Unrotated Access Key 'AKIADAVEDEVKEY004455' (120 days old)",
        description: "Active access key has exceeded the 90-day maximum key lifecycle rotation threshold.",
        severity: 'MEDIUM',
        provider: 'AWS',
        frameworks: ['SOC2 CC6.1 (Logical Access)', 'CIS AWS Foundations Benchmark v3.0'],
        affected_resource_id: 'arn:aws:iam::445566778899:user/jr_developer_dave/access-key/AKIADAVEDEVKEY004455',
        affected_resource_type: 'AWS::IAM::AccessKey',
        risk_impact: 'Stale developer API credentials are prone to historical exposure in dev workstations and log artifacts.',
        remediation_steps: 'Rotate API access key and decommission the outdated key identifier.',
        remediation_terraform_id: 'tf-patch-iam-key-rotate'
      }
    ],
    graph_data: {
      nodes: [
        { id: 'internet_threat_actor', label: 'Public Internet (0.0.0.0/0)', type: 'internet', provider: 'AWS', severity: 'CRITICAL', is_compromised: false, is_target: false, metadata: { description: 'External threat actor' } },
        { id: 'user_jr_developer_dave', label: 'User: jr_developer_dave', type: 'user', provider: 'AWS', severity: 'HIGH', is_compromised: true, is_target: false, metadata: { arn: 'arn:aws:iam::445566778899:user/jr_developer_dave', mfa: false } },
        { id: 'policy_PassRoleAndEC2LaunchPolicy', label: 'Policy: PassRoleAndEC2LaunchPolicy', type: 'policy', provider: 'AWS', severity: 'CRITICAL', is_compromised: false, is_target: false, metadata: { actions: ['ec2:RunInstances', 'iam:PassRole'] } },
        { id: 'role_OverPrivilegedAdminInstanceRole', label: 'Role: OverPrivilegedAdminInstanceRole', type: 'role', provider: 'AWS', severity: 'CRITICAL', is_compromised: false, is_target: true, metadata: { policy: 'AdministratorAccess' } },
        { id: 'sg_sg-04cryptominer01', label: 'SG: miner-default-sg', type: 'security_group', provider: 'AWS', severity: 'CRITICAL', is_compromised: false, is_target: false, metadata: { ingress: '0.0.0.0/0 Port 80' } },
        { id: 'res_i-04devbox', label: 'Host: i-04devbox (EC2 GPU Miner)', type: 'resource', provider: 'AWS', severity: 'HIGH', is_compromised: false, is_target: true, metadata: { instance_id: 'i-04devbox' } }
      ],
      edges: [
        { id: 'e1', source: 'user_jr_developer_dave', target: 'policy_PassRoleAndEC2LaunchPolicy', label: 'Attaches Policy', relationship: 'GRANTS_PERMISSION', is_attack_path: true, risk_weight: 4 },
        { id: 'e2', source: 'policy_PassRoleAndEC2LaunchPolicy', target: 'role_OverPrivilegedAdminInstanceRole', label: 'iam:PassRole Escalation', relationship: 'PASS_ROLE_ESCALATION', is_attack_path: true, risk_weight: 5 },
        { id: 'e3', source: 'internet_threat_actor', target: 'sg_sg-04cryptominer01', label: '0.0.0.0/0 Ingress (Port 80)', relationship: 'OPEN_INGRESS', is_attack_path: true, risk_weight: 4 },
        { id: 'e4', source: 'sg_sg-04cryptominer01', target: 'res_i-04devbox', label: 'Applies To', relationship: 'PROTECTS', is_attack_path: true, risk_weight: 3 }
      ],
      attack_paths: [
        {
          path_id: 'AP-PASSROLE-jr_developer_dave',
          title: 'PassRole-to-Administrator Compute Privilege Escalation',
          severity: 'CRITICAL',
          entry_point: 'User: jr_developer_dave (No MFA)',
          target: 'AWS Root / AdministratorAccess',
          hop_count: 3,
          steps: [
            "Attacker compromises user credentials for 'jr_developer_dave' (No MFA enforced)",
            "Invokes ec2:RunInstances with attached policy 'PassRoleAndEC2LaunchPolicy'",
            "Passes high-privileged 'OverPrivilegedAdminInstanceRole' to newly launched instance",
            "Queries IMDSv2 metadata endpoint on EC2 instance to extract Administrator temporary STS credentials"
          ],
          cve_or_technique: 'MITRE ATT&CK T1078.004 (Cloud Accounts) & T1068 (Privilege Escalation)',
          remediation_summary: 'Remove wildcard `iam:PassRole` and bind strict resource ARN scope with `iam:PassedToService` restriction.'
        }
      ],
      total_nodes: 6,
      total_edges: 4,
      critical_attack_chains_count: 1
    },
    remediation_patches: [
      {
        finding_id: 'FIND-PRIVESC-PASSROLE-PassRoleAndEC2LaunchPolicy',
        rule_id: 'RULE-AWS-IAM-PRIVESC-001',
        resource_id: 'arn:aws:iam::445566778899:policy/PassRoleAndEC2LaunchPolicy',
        resource_type: 'AWS::IAM::Policy',
        title: 'Remediate PassRole Privilege Escalation',
        original_config_snippet: 'iam:PassRole on resource: [*] with ec2:RunInstances',
        remediated_terraform_hcl: `resource "aws_iam_policy" "remediated_passrole_PassRoleAndEC2LaunchPolicy" {
  name        = "Sentinara_RestrictedPassRole"
  description = "Remediated least-privilege PassRole policy scoped to exact service roles"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowComputeCreation"
        Effect    = "Allow"
        Action    = ["ec2:RunInstances", "ec2:DescribeInstances"]
        Resource  = "*"
      },
      {
        Sid       = "RestrictedPassRoleToSpecificService"
        Effect    = "Allow"
        Action    = "iam:PassRole"
        Resource  = "arn:aws:iam::445566778899:role/ScopedAppWorkerRole"
        Condition = {
          StringEquals = {
            "iam:PassedToService" = "ec2.amazonaws.com"
          }
        }
      }
    ]
  })
}`,
        file_name: 'remediate_passrole_PassRoleAndEC2LaunchPolicy.tf',
        rationale: 'Enforces least privilege by scoping iam:PassRole to explicit non-administrative service roles and requiring iam:PassedToService condition.'
      }
    ],
    executive_summary: "Audit completed for 'Crypto-Miner Breach Vector (PassRole Escalation)' (AWS). Posture Score is 58.0/100 (Grade D, High Risk). Identified 3 total findings (1 Critical, 1 High) and 1 critical privilege escalation chain. Automated Terraform remediation patches are ready."
  },

  fintech_prod_banking: {
    environment_id: 'fintech_prod_banking',
    environment_name: 'Fintech Tier-1 Production Banking Cloud',
    provider: 'AWS',
    timestamp: '2026-09-19 18:00:00 UTC',
    posture_score: {
      overall_score: 96.0,
      letter_grade: 'A+',
      risk_rating: 'Low',
      total_findings: 0,
      severity_breakdown: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 },
      framework_scores: [
        { framework: 'SOC2 CC6.1 (Logical Access)', score_percentage: 100.0, total_checks: 5, passed_checks: 5, failed_checks: 0, status: 'COMPLIANT' },
        { framework: 'SOC2 CC6.3 (Least Privilege & RBAC)', score_percentage: 100.0, total_checks: 5, passed_checks: 5, failed_checks: 0, status: 'COMPLIANT' },
        { framework: 'SOC2 CC6.6 (Boundary Protection)', score_percentage: 100.0, total_checks: 5, passed_checks: 5, failed_checks: 0, status: 'COMPLIANT' },
        { framework: 'SOC2 CC6.7 (Data Transmission Security)', score_percentage: 100.0, total_checks: 5, passed_checks: 5, failed_checks: 0, status: 'COMPLIANT' },
        { framework: 'CIS AWS Foundations Benchmark v3.0', score_percentage: 100.0, total_checks: 6, passed_checks: 6, failed_checks: 0, status: 'COMPLIANT' }
      ],
      top_risks: [
        "Zero critical vulnerabilities identified.",
        "MFA strictly enforced on 100% of IAM users.",
        "KMS-CMK Customer Managed Key encryption active across all S3 storage buckets.",
        "Zero 0.0.0.0/0 open ingress rules in Security Groups."
      ]
    },
    findings: [],
    graph_data: {
      nodes: [
        { id: 'user_lead_secops_auditor', label: 'User: lead_secops_auditor', type: 'user', provider: 'AWS', severity: 'INFO', is_compromised: false, is_target: false, metadata: { mfa: true } },
        { id: 'role_CoreBankingServiceRole', label: 'Role: CoreBankingServiceRole', type: 'role', provider: 'AWS', severity: 'INFO', is_compromised: false, is_target: false, metadata: { trust: 'ecs-tasks' } },
        { id: 's3_apex_bank_audit_logs', label: 'S3: apex-bank-immutable-audit-logs', type: 'bucket', provider: 'AWS', severity: 'INFO', is_compromised: false, is_target: true, metadata: { encrypted: true, classification: 'PCI' } },
        { id: 'sg_banking_tier', label: 'SG: banking-app-tier-sg', type: 'security_group', provider: 'AWS', severity: 'INFO', is_compromised: false, is_target: false, metadata: { cidr: '10.0.0.0/16' } }
      ],
      edges: [
        { id: 'fe1', source: 'user_lead_secops_auditor', target: 'role_CoreBankingServiceRole', label: 'Scoped AssumeRole', relationship: 'ASSUMES', is_attack_path: false, risk_weight: 1 },
        { id: 'fe2', source: 'role_CoreBankingServiceRole', target: 's3_apex_bank_audit_logs', label: 'KMS Encrypted Ledger Write', relationship: 'WRITES_DATA', is_attack_path: false, risk_weight: 1 }
      ],
      attack_paths: [],
      total_nodes: 4,
      total_edges: 2,
      critical_attack_chains_count: 0
    },
    remediation_patches: [],
    executive_summary: "Environment 'Fintech Tier-1 Production Banking Cloud' is fully compliant. Posture Score: 96.0/100 (Grade A+, Low Risk). 0 findings identified."
  }
};
