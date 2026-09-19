export type CloudProvider = 'AWS' | 'Azure' | 'Kubernetes' | 'Hybrid';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface Finding {
  id: string;
  rule_id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  provider: CloudProvider;
  frameworks: string[];
  affected_resource_id: string;
  affected_resource_type: string;
  risk_impact: string;
  privilege_escalation_vector?: string;
  remediation_steps: string;
  remediation_terraform_id?: string;
}

export interface FrameworkComplianceScore {
  framework: string;
  score_percentage: number;
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
  status: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
}

export interface PostureScore {
  overall_score: number;
  letter_grade: string;
  risk_rating: string;
  total_findings: number;
  severity_breakdown: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
    INFO: number;
  };
  framework_scores: FrameworkComplianceScore[];
  top_risks: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  provider: CloudProvider;
  severity: SeverityLevel;
  is_compromised: boolean;
  is_target: boolean;
  metadata: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  relationship: string;
  is_attack_path: boolean;
  risk_weight: number;
}

export interface AttackPath {
  path_id: string;
  title: string;
  severity: SeverityLevel;
  entry_point: string;
  target: string;
  hop_count: number;
  steps: string[];
  cve_or_technique: string;
  remediation_summary: string;
}

export interface PermissionGraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  attack_paths: AttackPath[];
  total_nodes: number;
  total_edges: number;
  critical_attack_chains_count: number;
}

export interface TerraformPatch {
  finding_id: string;
  rule_id: string;
  resource_id: string;
  resource_type: string;
  title: string;
  original_config_snippet: string;
  remediated_terraform_hcl: string;
  file_name: string;
  rationale: string;
}

export interface RemediationBatchResponse {
  patches: TerraformPatch[];
  total_patches: number;
  combined_terraform: string;
}

export interface AuditResponse {
  environment_id: string;
  environment_name: string;
  provider: CloudProvider;
  timestamp: string;
  posture_score: PostureScore;
  findings: Finding[];
  graph_data: PermissionGraphResponse;
  remediation_patches: TerraformPatch[];
  executive_summary: string;
}

export interface EnvironmentSummary {
  id: string;
  file_name: string;
  name: string;
  description: string;
  cloud_provider: CloudProvider;
  created_at: string;
  classification: string;
  tier: string;
}
