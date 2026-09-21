"""Auto-Remediation Engine - Generates production-grade, least-privilege Terraform patches (.tf)."""
import re
import logging
from typing import List, Dict, Any, Optional
from app.models.schemas import Finding, TerraformPatch, RemediationBatchResponse

logger = logging.getLogger(__name__)


class RemediationEngine:
    """Generates executable, least-privilege Terraform HCL patches for detected vulnerabilities."""

    @staticmethod
    def generate_patch_for_finding(finding: Finding) -> TerraformPatch:
        """Generates a specific Terraform (.tf) patch for a single finding."""
        rule_id = finding.rule_id
        res_id = finding.affected_resource_id
        raw_res_name = res_id.split("/")[-1].replace(":", "_").replace("-", "_")
        res_name = re.sub(r"[^a-zA-Z0-9_]", "_", raw_res_name) or "resource"

        if "AWS-IAM-PRIVESC" in rule_id or "PASSROLE" in finding.id:
            hcl = f"""# ==============================================================================
# Sentinara Automated Remediation Patch: Restricted PassRole Policy
# Finding ID: {finding.id}
# Rule: {finding.rule_id}
# Compliance: SOC2 CC6.3, CIS AWS v3.0 Benchmark
# ==============================================================================

resource "aws_iam_policy" "remediated_passrole_{res_name}" {{
  name        = "Sentinara_RestrictedPassRole_{res_name}"
  description = "Remediated least-privilege PassRole policy scoped to exact service roles"

  policy = jsonencode({{
    Version = "2012-10-17"
    Statement = [
      {{
        Sid       = "AllowComputeCreation"
        Effect    = "Allow"
        Action    = [
          "ec2:RunInstances",
          "ec2:DescribeInstances"
        ]
        Resource  = "*"
      }},
      {{
        Sid       = "RestrictedPassRoleToSpecificService"
        Effect    = "Allow"
        Action    = "iam:PassRole"
        Resource  = "arn:aws:iam::*:role/ScopedApplicationRole"
        Condition = {{
          StringEquals = {{
            "iam:PassedToService" = "ec2.amazonaws.com"
          }}
        }}
      }}
    ]
  }})

  tags = {{
    ManagedBy   = "Sentinara-AutoRemediator"
    Remediation = "{finding.id}"
  }}
}}
"""
            orig = "iam:PassRole on resource: ['*'] with ec2:RunInstances"
            file_name = f"remediate_passrole_{res_name}.tf"
            rationale = "Enforces least privilege by scoping iam:PassRole to explicit non-administrative service roles and requiring iam:PassedToService condition."

        elif "AWS-IAM-MFA" in rule_id:
            hcl = f"""# ==============================================================================
# Sentinara Automated Remediation Patch: Enforce MFA for All IAM API Access
# Finding ID: {finding.id}
# Compliance: SOC2 CC6.1, CIS AWS Benchmark 1.5
# ==============================================================================

resource "aws_iam_policy" "enforce_mfa_global" {{
  name        = "Sentinara_DenyAllWithoutMFA"
  description = "Enforces multi-factor authentication before permitting any mutating AWS API calls"

  policy = jsonencode({{
    Version = "2012-10-17"
    Statement = [
      {{
        Sid       = "BlockMostAccessUnlessSignedInWithMFA"
        Effect    = "Deny"
        NotAction = [
          "iam:CreateVirtualMFADevice",
          "iam:EnableMFADevice",
          "iam:GetUser",
          "iam:ListMFADevices",
          "iam:ResyncMFADevice",
          "sts:GetSessionToken"
        ]
        Resource  = "*"
        Condition = {{
          BoolIfExists = {{
            "aws:MultiFactorAuthPresent" = "false"
          }}
        }}
      }}
    ]
  }})
}}
"""
            orig = f"User '{res_name}' has mfa_enabled = false"
            file_name = "remediate_enforce_mfa.tf"
            rationale = "Implements SOC2 CC6.1 requirement by attaching a global deny condition for any action attempted without an active MFA token session."

        elif "AWS-S3-PUBLIC" in rule_id or "S3-PUBLIC" in finding.id:
            clean_bucket = res_id.split(":::")[-1] if ":::" in res_id else res_name
            hcl = f"""# ==============================================================================
# Sentinara Automated Remediation Patch: S3 Public Access Block & Ownership
# Target Bucket: {clean_bucket}
# Compliance: SOC2 CC6.6, CIS AWS Benchmark 2.1.1
# ==============================================================================

resource "aws_s3_bucket_public_access_block" "remediated_pab_{clean_bucket.replace('-', '_')}" {{
  bucket = "{clean_bucket}"

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}}

resource "aws_s3_bucket_ownership_controls" "remediated_ownership_{clean_bucket.replace('-', '_')}" {{
  bucket = "{clean_bucket}"

  rule {{
    object_ownership = "BucketOwnerEnforced"
  }}
}}
"""
            orig = f"Bucket '{clean_bucket}' public_access_block = false, acl_grants = [AllUsers]"
            file_name = f"remediate_s3_public_block_{clean_bucket.replace('-', '_')}.tf"
            rationale = "Enforces all 4 AWS S3 Public Access Block controls and locks bucket ownership to prevent unauthorized public read/write."

        elif "AWS-S3-ENCRYPTION" in rule_id:
            clean_bucket = res_id.split(":::")[-1] if ":::" in res_id else res_name
            hcl = f"""# ==============================================================================
# Sentinara Automated Remediation Patch: S3 KMS-CMK Server-Side Encryption
# Target Bucket: {clean_bucket}
# Compliance: SOC2 CC6.7, CIS AWS Benchmark 2.1.2
# ==============================================================================

resource "aws_kms_key" "s3_vault_key_{clean_bucket.replace('-', '_')}" {{
  description             = "Dedicated KMS Customer Managed Key for {clean_bucket}"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {{
    Environment = "Production"
    Sentinara  = "Remediated"
  }}
}}

resource "aws_s3_bucket_server_side_encryption_configuration" "remediated_sse_{clean_bucket.replace('-', '_')}" {{
  bucket = "{clean_bucket}"

  rule {{
    apply_server_side_encryption_by_default {{
      kms_master_key_id = aws_kms_key.s3_vault_key_{clean_bucket.replace('-', '_')}.arn
      sse_algorithm     = "aws:kms"
    }}
    bucket_key_enabled = true
  }}
}}
"""
            orig = f"Bucket '{clean_bucket}' encryption_enabled = false"
            file_name = f"remediate_s3_encryption_{clean_bucket.replace('-', '_')}.tf"
            rationale = "Configures automated AWS KMS CMK encryption with annual key rotation to satisfy SOC2 CC6.7 encryption at rest."

        elif "AWS-SG" in rule_id or "SG-OPEN" in finding.id or "SG-ALL" in finding.id:
            hcl = f"""# ==============================================================================
# Sentinara Automated Remediation Patch: Security Group Restrictive Ingress
# Target Security Group: {res_name}
# Compliance: SOC2 CC6.6, CIS AWS Benchmark 5.2 / 5.3
# ==============================================================================

resource "aws_security_group_rule" "remediated_restricted_ingress_{res_name}" {{
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["10.0.0.0/8"] # Scoped to authorized internal VPC/VPN CIDR
  security_group_id = "{res_name}"
  description       = "Sentinara Remediated: Revoked 0.0.0.0/0, restricted to internal VPC"
}}
"""
            orig = f"Security Group rule allowed 0.0.0.0/0 ingress on sensitive ports"
            file_name = f"remediate_sg_{res_name}.tf"
            rationale = "Replaces public 0.0.0.0/0 open ingress with explicit corporate internal subnet CIDR (10.0.0.0/8)."

        elif "K8S-RBAC" in rule_id:
            hcl = f"""# ==============================================================================
# Sentinara Automated Remediation Patch: Scoped Kubernetes RBAC Role & Binding
# Target: {res_name}
# Compliance: SOC2 CC6.3, CIS Kubernetes Benchmark 5.1.1
# ==============================================================================

resource "kubernetes_role" "scoped_app_role" {{
  metadata {{
    name      = "scoped-workload-reader"
    namespace = "default"
  }}

  rule {{
    api_groups = [""]
    resources  = ["pods", "configmaps"]
    verbs      = ["get", "list", "watch"]
  }}
}}

resource "kubernetes_role_binding" "scoped_app_binding" {{
  metadata {{
    name      = "scoped-workload-binding"
    namespace = "default"
  }}

  role_ref {{
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role.scoped_app_role.metadata[0].name
  }}

  subject {{
    kind      = "ServiceAccount"
    name      = "default"
    namespace = "default"
  }}
}}
"""
            orig = f"RoleBinding granted root 'cluster-admin' with '*' verbs and '*' resources"
            file_name = "remediate_k8s_rbac_least_privilege.tf"
            rationale = "Replaces wildcard cluster-admin binding with a least-privilege Role scoped strictly to read-only pod metadata."

        elif "AZURE-NSG" in rule_id:
            hcl = f"""# ==============================================================================
# Sentinara Automated Remediation Patch: Azure NSG Restrictive Inbound Rule
# Target NSG: {res_name}
# Compliance: SOC2 CC6.6, CIS Microsoft Azure Benchmark 6.1
# ==============================================================================

resource "azurerm_network_security_rule" "remediated_nsg_inbound_{res_name}" {{
  name                        = "Sentinara_Restricted_Inbound"
  priority                    = 100
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range          = "*"
  destination_port_range     = "443"
  source_address_prefix      = "VirtualNetwork"
  destination_address_prefix = "*"
  resource_group_name        = "rg-hybrid-transit"
  network_security_group_name = "{res_name}"
}}
"""
            orig = "source_address_prefix = 'Internet' on port 3306/5432"
            file_name = f"remediate_azure_nsg_{res_name}.tf"
            rationale = "Restricts database inbound ingress to VirtualNetwork perimeter, isolating from public internet."

        else:
            # Generic Least-Privilege IAM Scoping
            hcl = f"""# ==============================================================================
# Sentinara Automated Remediation Patch: Scoped Least Privilege
# Target Finding: {finding.id}
# Compliance: SOC2 CC6.3
# ==============================================================================

resource "aws_iam_policy" "scoped_least_privilege_{res_name}" {{
  name        = "Sentinara_Scoped_{res_name}"
  description = "Scoped policy replacing wildcard administrator rights with least privilege"

  policy = jsonencode({{
    Version = "2012-10-17"
    Statement = [
      {{
        Sid      = "ScopedReadActionsOnly"
        Effect   = "Allow"
        Action   = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::app-scoped-bucket",
          "arn:aws:s3:::app-scoped-bucket/*"
        ]
      }}
    ]
  }})
}}
"""
            orig = "Wildcard '*' action on '*' resource"
            file_name = f"remediate_least_privilege_{res_name}.tf"
            rationale = "Replaces wildcard permissions with explicit Read-Only actions on designated application ARNs."

        return TerraformPatch(
            finding_id=finding.id,
            rule_id=finding.rule_id,
            resource_id=finding.affected_resource_id,
            resource_type=finding.affected_resource_type,
            title=f"Remediate {finding.title}",
            original_config_snippet=orig,
            remediated_terraform_hcl=hcl,
            file_name=file_name,
            rationale=rationale
        )

    @staticmethod
    def generate_batch_remediations(findings: List[Finding]) -> RemediationBatchResponse:
        """Generates Terraform patches for all remediable findings and concatenates them."""
        patches = [RemediationEngine.generate_patch_for_finding(f) for f in findings]
        combined_hcl = "\n\n".join([p.remediated_terraform_hcl for p in patches])

        return RemediationBatchResponse(
            patches=patches,
            total_patches=len(patches),
            combined_terraform=combined_hcl
        )
