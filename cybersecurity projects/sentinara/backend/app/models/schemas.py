"""Sentinara Data Models and Schemas."""
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class CloudProvider(str, Enum):
    AWS = "AWS"
    AZURE = "Azure"
    KUBERNETES = "Kubernetes"
    HYBRID = "Hybrid"


class SeverityLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


class ComplianceFramework(str, Enum):
    SOC2_CC6_1 = "SOC2 CC6.1 (Logical Access)"
    SOC2_CC6_3 = "SOC2 CC6.3 (Least Privilege & RBAC)"
    SOC2_CC6_6 = "SOC2 CC6.6 (Boundary Protection)"
    SOC2_CC6_7 = "SOC2 CC6.7 (Data Transmission Security)"
    SOC2_CC6_8 = "SOC2 CC6.8 (Unauthorized Changes)"
    CIS_AWS_V3 = "CIS AWS Foundations Benchmark v3.0"
    CIS_AZURE_V2 = "CIS Microsoft Azure Benchmark v2.0"
    CIS_K8S_V1_8 = "CIS Kubernetes Benchmark v1.8"


# Ingestion Schemas
class IAMAccessKey(BaseModel):
    access_key_id: str
    status: str = "Active"  # Active | Inactive
    create_date: str
    last_rotated_days_ago: int = 0


class IAMPolicyStatement(BaseModel):
    effect: str = "Allow"  # Allow | Deny
    action: List[str] = Field(default_factory=list)
    resource: List[str] = Field(default_factory=list)
    condition: Optional[Dict[str, Any]] = None


class IAMPolicy(BaseModel):
    policy_name: str
    arn: str
    policy_document: Dict[str, Any] = Field(default_factory=dict)
    statements: List[IAMPolicyStatement] = Field(default_factory=list)
    is_admin_policy: bool = False


class IAMRole(BaseModel):
    role_name: str
    arn: str
    assume_role_policy: Dict[str, Any] = Field(default_factory=dict)
    attached_policies: List[str] = Field(default_factory=list)  # ARNs or Names
    inline_policies: List[IAMPolicy] = Field(default_factory=list)
    trusts_wildcard: bool = False


class IAMUser(BaseModel):
    username: str
    arn: str
    mfa_enabled: bool = False
    access_keys: List[IAMAccessKey] = Field(default_factory=list)
    attached_policies: List[str] = Field(default_factory=list)
    attached_roles: List[str] = Field(default_factory=list)
    groups: List[str] = Field(default_factory=list)


class S3Bucket(BaseModel):
    name: str
    arn: str
    region: str = "us-east-1"
    versioning_enabled: bool = False
    encryption_enabled: bool = False
    kms_key_id: Optional[str] = None
    public_access_block: Dict[str, bool] = Field(default_factory=lambda: {
        "BlockPublicAcls": False,
        "IgnorePublicAcls": False,
        "BlockPublicPolicy": False,
        "RestrictPublicBuckets": False
    })
    acl_grants: List[Dict[str, str]] = Field(default_factory=list)
    bucket_policy: Optional[Dict[str, Any]] = None
    contains_sensitive_data: bool = False
    data_classification: str = "General"  # PII, HIPAA, PCI, General


class SecurityGroupRule(BaseModel):
    protocol: str = "-1"  # tcp, udp, icmp, -1 (all)
    from_port: Optional[int] = None
    to_port: Optional[int] = None
    cidr_ip: str = "0.0.0.0/0"
    description: Optional[str] = None


class SecurityGroup(BaseModel):
    group_id: str
    group_name: str
    vpc_id: str
    ingress_rules: List[SecurityGroupRule] = Field(default_factory=list)
    egress_rules: List[SecurityGroupRule] = Field(default_factory=list)
    attached_resources: List[str] = Field(default_factory=list)


# Azure models
class AzureRoleAssignment(BaseModel):
    principal_name: str
    role_definition_name: str
    scope: str
    principal_type: str = "User"  # User, ServicePrincipal, Group


class AzureNSGRule(BaseModel):
    name: str
    priority: int
    direction: str = "Inbound"
    access: str = "Allow"  # Allow | Deny
    protocol: str = "*"
    source_port_range: str = "*"
    destination_port_range: str = "*"
    source_address_prefix: str = "Internet"
    destination_address_prefix: str = "*"


class AzureNSG(BaseModel):
    id: str
    name: str
    resource_group: str
    security_rules: List[AzureNSGRule] = Field(default_factory=list)


# Kubernetes models
class K8sSubject(BaseModel):
    kind: str  # User, Group, ServiceAccount
    name: str
    namespace: Optional[str] = None


class K8sPolicyRule(BaseModel):
    api_groups: List[str] = Field(default_factory=list)
    resources: List[str] = Field(default_factory=list)
    verbs: List[str] = Field(default_factory=list)


class K8sRoleBinding(BaseModel):
    name: str
    namespace: str = "default"
    role_kind: str = "ClusterRole"  # Role | ClusterRole
    role_name: str
    subjects: List[K8sSubject] = Field(default_factory=list)
    rules: List[K8sPolicyRule] = Field(default_factory=list)
    is_cluster_admin: bool = False


class CloudEnvironmentDump(BaseModel):
    id: str
    name: str
    description: str
    cloud_provider: CloudProvider = CloudProvider.AWS
    created_at: str
    version: str = "1.0"
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    # AWS Assets
    iam_users: List[IAMUser] = Field(default_factory=list)
    iam_roles: List[IAMRole] = Field(default_factory=list)
    iam_policies: List[IAMPolicy] = Field(default_factory=list)
    s3_buckets: List[S3Bucket] = Field(default_factory=list)
    security_groups: List[SecurityGroup] = Field(default_factory=list)
    
    # Azure Assets
    azure_role_assignments: List[AzureRoleAssignment] = Field(default_factory=list)
    azure_nsgs: List[AzureNSG] = Field(default_factory=list)
    
    # Kubernetes Assets
    k8s_role_bindings: List[K8sRoleBinding] = Field(default_factory=list)


# Findings and Compliance
class Finding(BaseModel):
    id: str
    rule_id: str
    title: str
    description: str
    severity: SeverityLevel
    provider: CloudProvider
    frameworks: List[ComplianceFramework]
    affected_resource_id: str
    affected_resource_type: str
    risk_impact: str
    privilege_escalation_vector: Optional[str] = None
    remediation_steps: str
    remediation_terraform_id: Optional[str] = None


class FrameworkComplianceScore(BaseModel):
    framework: ComplianceFramework
    score_percentage: float
    total_checks: int
    passed_checks: int
    failed_checks: int
    status: str  # COMPLIANT, WARNING, NON_COMPLIANT


class PostureScore(BaseModel):
    overall_score: float  # 0 to 100
    letter_grade: str     # A+, A, B, C, D, F
    risk_rating: str      # Low, Medium, High, Critical
    total_findings: int
    severity_breakdown: Dict[str, int]
    framework_scores: List[FrameworkComplianceScore]
    top_risks: List[str]


# Graph Visualizer
class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # user, role, policy, bucket, security_group, pod, internet, resource
    provider: CloudProvider
    severity: SeverityLevel = SeverityLevel.INFO
    is_compromised: bool = False
    is_target: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    relationship: str  # ASSUMES, GRANTS, INGRESS_TO, STORES_DATA, BINDS_TO, ATTACK_STEP
    is_attack_path: bool = False
    risk_weight: int = 1


class AttackPath(BaseModel):
    path_id: str
    title: str
    severity: SeverityLevel
    entry_point: str
    target: str
    hop_count: int
    steps: List[str]
    cve_or_technique: str
    remediation_summary: str


class PermissionGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    attack_paths: List[AttackPath]
    total_nodes: int
    total_edges: int
    critical_attack_chains_count: int


# Remediation
class TerraformPatch(BaseModel):
    finding_id: str
    rule_id: str
    resource_id: str
    resource_type: str
    title: str
    original_config_snippet: str
    remediated_terraform_hcl: str
    file_name: str
    rationale: str


class RemediationBatchResponse(BaseModel):
    patches: List[TerraformPatch]
    total_patches: int
    combined_terraform: str


# Full Audit Result
class AuditResponse(BaseModel):
    environment_id: str
    environment_name: str
    provider: CloudProvider
    timestamp: str
    posture_score: PostureScore
    findings: List[Finding]
    graph_data: PermissionGraphResponse
    remediation_patches: List[TerraformPatch]
    executive_summary: str
