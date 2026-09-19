"""Attack Path & Privilege Escalation Graph Engine."""
import logging
import networkx as nx
from typing import List, Dict, Any, Tuple
from app.models.schemas import (
    CloudEnvironmentDump,
    CloudProvider,
    SeverityLevel,
    GraphNode,
    GraphEdge,
    AttackPath,
    PermissionGraphResponse
)

logger = logging.getLogger(__name__)


class AttackPathEngine:
    """Constructs multi-cloud permission graphs and detects lateral movement & privilege escalation attack chains."""

    def __init__(self):
        self.graph = nx.DiGraph()

    def build_and_analyze_graph(self, env: CloudEnvironmentDump) -> PermissionGraphResponse:
        """Constructs graph nodes and edges from cloud dump and performs attack path traversal."""
        G = nx.DiGraph()
        nodes: List[GraphNode] = []
        edges: List[GraphEdge] = []
        attack_paths: List[AttackPath] = []

        # 1. Internet Node (Entry Point)
        has_internet_exposure = any(
            any(r.cidr_ip == "0.0.0.0/0" for r in sg.ingress_rules) for sg in env.security_groups
        ) or any(
            any(r.source_address_prefix in ["Internet", "*"] and r.access.lower() == "allow" for r in nsg.security_rules)
            for nsg in env.azure_nsgs
        ) or any(
            any("AllUsers" in grant.get("Grantee", "") for grant in b.acl_grants) for b in env.s3_buckets
        )

        if has_internet_exposure:
            G.add_node("internet_threat_actor", type="internet", label="Public Internet (0.0.0.0/0)")
            nodes.append(GraphNode(
                id="internet_threat_actor",
                label="Public Internet (0.0.0.0/0)",
                type="internet",
                provider=env.cloud_provider,
                severity=SeverityLevel.CRITICAL,
                metadata={"description": "Unauthenticated external threat vector"}
            ))

        # 2. Add IAM Users
        for user in env.iam_users:
            node_id = f"user_{user.username}"
            user_sev = SeverityLevel.HIGH if not user.mfa_enabled or any(k.last_rotated_days_ago > 180 for k in user.access_keys) else SeverityLevel.INFO
            G.add_node(node_id, type="user", label=user.username, provider="AWS")
            nodes.append(GraphNode(
                id=node_id,
                label=f"User: {user.username}",
                type="user",
                provider=CloudProvider.AWS,
                severity=user_sev,
                metadata={
                    "arn": user.arn,
                    "mfa_enabled": user.mfa_enabled,
                    "access_keys_count": len(user.access_keys),
                    "groups": user.groups
                }
            ))

        # 3. Add IAM Roles
        for role in env.iam_roles:
            node_id = f"role_{role.role_name}"
            is_admin_role = any("admin" in p.lower() for p in role.attached_policies) or role.trusts_wildcard
            role_sev = SeverityLevel.CRITICAL if role.trusts_wildcard or is_admin_role else SeverityLevel.MEDIUM
            G.add_node(node_id, type="role", label=role.role_name, provider="AWS")
            nodes.append(GraphNode(
                id=node_id,
                label=f"Role: {role.role_name}",
                type="role",
                provider=CloudProvider.AWS,
                severity=role_sev,
                is_target=is_admin_role,
                metadata={
                    "arn": role.arn,
                    "trusts_wildcard": role.trusts_wildcard,
                    "attached_policies": role.attached_policies
                }
            ))

            # If role trusts wildcard (*), link from internet threat actor
            if role.trusts_wildcard and "internet_threat_actor" in G:
                edge_id = f"edge_internet_to_{node_id}"
                G.add_edge("internet_threat_actor", node_id, relationship="ASSUMES_WILDCARD")
                edges.append(GraphEdge(
                    id=edge_id,
                    source="internet_threat_actor",
                    target=node_id,
                    label="Wildcard AssumeRole (*)",
                    relationship="ASSUMES_WILDCARD",
                    is_attack_path=True,
                    risk_weight=5
                ))

        # 4. Add IAM Policies
        for policy in env.iam_policies:
            node_id = f"policy_{policy.policy_name}"
            is_admin_pol = policy.is_admin_policy or any("*" in s.action and "*" in s.resource for s in policy.statements)
            G.add_node(node_id, type="policy", label=policy.policy_name, provider="AWS")
            nodes.append(GraphNode(
                id=node_id,
                label=f"Policy: {policy.policy_name}",
                type="policy",
                provider=CloudProvider.AWS,
                severity=SeverityLevel.CRITICAL if is_admin_pol else SeverityLevel.INFO,
                metadata={"arn": policy.arn, "statement_count": len(policy.statements)}
            ))

        # 5. Add S3 Buckets
        for bucket in env.s3_buckets:
            node_id = f"s3_{bucket.name}"
            is_public = any("AllUsers" in grant.get("Grantee", "") for grant in bucket.acl_grants) or (
                bucket.public_access_block and not bucket.public_access_block.get("BlockPublicAcls", True)
            )
            bucket_sev = SeverityLevel.CRITICAL if (is_public or not bucket.encryption_enabled) and bucket.contains_sensitive_data else SeverityLevel.MEDIUM
            G.add_node(node_id, type="bucket", label=bucket.name, provider="AWS")
            nodes.append(GraphNode(
                id=node_id,
                label=f"S3: {bucket.name}",
                type="bucket",
                provider=CloudProvider.AWS,
                severity=bucket_sev,
                is_target=bucket.contains_sensitive_data,
                metadata={
                    "arn": bucket.arn,
                    "encryption": bucket.encryption_enabled,
                    "sensitive_data": bucket.contains_sensitive_data,
                    "classification": bucket.data_classification
                }
            ))

            # Connect Public Internet -> S3 Bucket if public ACL
            if is_public and "internet_threat_actor" in G:
                edge_id = f"edge_internet_to_{node_id}"
                G.add_edge("internet_threat_actor", node_id, relationship="PUBLIC_S3_EXFIL")
                edges.append(GraphEdge(
                    id=edge_id,
                    source="internet_threat_actor",
                    target=node_id,
                    label="Public Read/Write ACL",
                    relationship="PUBLIC_S3_EXFIL",
                    is_attack_path=True,
                    risk_weight=5
                ))

        # 6. Add Security Groups
        for sg in env.security_groups:
            node_id = f"sg_{sg.group_id}"
            has_open_ingress = any(r.cidr_ip in ["0.0.0.0/0", "::/0"] for r in sg.ingress_rules)
            G.add_node(node_id, type="security_group", label=sg.group_name, provider="AWS")
            nodes.append(GraphNode(
                id=node_id,
                label=f"SG: {sg.group_name}",
                type="security_group",
                provider=CloudProvider.AWS,
                severity=SeverityLevel.CRITICAL if has_open_ingress else SeverityLevel.LOW,
                metadata={
                    "vpc_id": sg.vpc_id,
                    "ingress_rules": [r.model_dump() for r in sg.ingress_rules]
                }
            ))

            if has_open_ingress and "internet_threat_actor" in G:
                for rule in sg.ingress_rules:
                    if rule.cidr_ip in ["0.0.0.0/0", "::/0"]:
                        port_str = f"Port {rule.from_port}" if rule.from_port else "All Ports"
                        edge_id = f"edge_internet_to_{node_id}_{rule.from_port}"
                        G.add_edge("internet_threat_actor", node_id, relationship="OPEN_INGRESS")
                        edges.append(GraphEdge(
                            id=edge_id,
                            source="internet_threat_actor",
                            target=node_id,
                            label=f"0.0.0.0/0 Ingress ({port_str})",
                            relationship="OPEN_INGRESS",
                            is_attack_path=True,
                            risk_weight=4
                        ))

            # Attach SG to target resources (e.g. instances, RDS)
            for res in sg.attached_resources:
                res_node_id = f"res_{res}"
                if not any(n.id == res_node_id for n in nodes):
                    nodes.append(GraphNode(
                        id=res_node_id,
                        label=f"Host: {res}",
                        type="resource",
                        provider=CloudProvider.AWS,
                        severity=SeverityLevel.HIGH,
                        is_target=True,
                        metadata={"resource_id": res}
                    ))
                    G.add_node(res_node_id, type="resource", label=res)

                G.add_edge(node_id, res_node_id, relationship="PROTECTS")
                edges.append(GraphEdge(
                    id=f"edge_{node_id}_to_{res_node_id}",
                    source=node_id,
                    target=res_node_id,
                    label="Applies To",
                    relationship="PROTECTS",
                    is_attack_path=has_open_ingress,
                    risk_weight=3
                ))

        # 7. Add Kubernetes Nodes
        for rb in env.k8s_role_bindings:
            rb_node_id = f"k8s_rb_{rb.name}"
            is_root = rb.is_cluster_admin or rb.role_name == "cluster-admin"
            G.add_node(rb_node_id, type="k8s_binding", label=rb.name, provider="Kubernetes")
            nodes.append(GraphNode(
                id=rb_node_id,
                label=f"RBAC: {rb.name}",
                type="k8s_binding",
                provider=CloudProvider.KUBERNETES,
                severity=SeverityLevel.CRITICAL if is_root else SeverityLevel.MEDIUM,
                is_target=is_root,
                metadata={"namespace": rb.namespace, "role_name": rb.role_name}
            ))

            for subj in rb.subjects:
                subj_node_id = f"k8s_sa_{subj.name}"
                if not any(n.id == subj_node_id for n in nodes):
                    nodes.append(GraphNode(
                        id=subj_node_id,
                        label=f"K8s {subj.kind}: {subj.name}",
                        type="pod",
                        provider=CloudProvider.KUBERNETES,
                        severity=SeverityLevel.HIGH if is_root else SeverityLevel.LOW,
                        metadata={"namespace": subj.namespace or rb.namespace}
                    ))
                    G.add_node(subj_node_id, type="pod", label=subj.name)

                G.add_edge(subj_node_id, rb_node_id, relationship="BINDS_TO")
                edges.append(GraphEdge(
                    id=f"edge_{subj_node_id}_to_{rb_node_id}",
                    source=subj_node_id,
                    target=rb_node_id,
                    label="ServiceAccount Binding",
                    relationship="BINDS_TO",
                    is_attack_path=is_root,
                    risk_weight=5 if is_root else 2
                ))

        # 8. Add Azure NSGs & Role Assignments
        for nsg in env.azure_nsgs:
            nsg_node_id = f"azure_nsg_{nsg.name}"
            G.add_node(nsg_node_id, type="azure_nsg", label=nsg.name, provider="Azure")
            nodes.append(GraphNode(
                id=nsg_node_id,
                label=f"Azure NSG: {nsg.name}",
                type="azure_nsg",
                provider=CloudProvider.AZURE,
                severity=SeverityLevel.CRITICAL,
                metadata={"resource_group": nsg.resource_group}
            ))
            if "internet_threat_actor" in G:
                for rule in nsg.security_rules:
                    if rule.source_address_prefix in ["Internet", "*"] and rule.access.lower() == "allow":
                        edge_id = f"edge_internet_to_azure_{nsg.name}_{rule.destination_port_range}"
                        G.add_edge("internet_threat_actor", nsg_node_id, relationship="AZURE_INTERNET_INGRESS")
                        edges.append(GraphEdge(
                            id=edge_id,
                            source="internet_threat_actor",
                            target=nsg_node_id,
                            label=f"Internet Inbound ({rule.destination_port_range})",
                            relationship="AZURE_INTERNET_INGRESS",
                            is_attack_path=True,
                            risk_weight=5
                        ))

        # Connect Users -> Policies & Users -> Roles
        for user in env.iam_users:
            u_node_id = f"user_{user.username}"
            for pol_name_or_arn in user.attached_policies:
                pol_name = pol_name_or_arn.split("/")[-1]
                pol_node_id = f"policy_{pol_name}"
                if any(n.id == pol_node_id for n in nodes):
                    G.add_edge(u_node_id, pol_node_id, relationship="GRANTS_PERMISSION")
                    edges.append(GraphEdge(
                        id=f"edge_{u_node_id}_to_{pol_node_id}",
                        source=u_node_id,
                        target=pol_node_id,
                        label="Attaches Policy",
                        relationship="GRANTS_PERMISSION",
                        risk_weight=2
                    ))

        # Connect Policies -> S3 Buckets / IAM Roles
        for policy in env.iam_policies:
            p_node_id = f"policy_{policy.policy_name}"
            for stmt in policy.statements:
                if stmt.effect.lower() == "allow":
                    # PassRole connection
                    if "iam:PassRole" in stmt.action:
                        for res in stmt.resource:
                            role_name = res.split("/")[-1]
                            r_node_id = f"role_{role_name}"
                            if any(n.id == r_node_id for n in nodes):
                                G.add_edge(p_node_id, r_node_id, relationship="PASS_ROLE_ESCALATION")
                                edges.append(GraphEdge(
                                    id=f"edge_{p_node_id}_to_{r_node_id}",
                                    source=p_node_id,
                                    target=r_node_id,
                                    label="iam:PassRole Escalation",
                                    relationship="PASS_ROLE_ESCALATION",
                                    is_attack_path=True,
                                    risk_weight=5
                                ))

                    # S3 bucket access
                    if any("s3:" in a or a == "*" for a in stmt.action):
                        for bucket in env.s3_buckets:
                            b_node_id = f"s3_{bucket.name}"
                            if any(r == "*" or bucket.name in r for r in stmt.resource):
                                G.add_edge(p_node_id, b_node_id, relationship="ACCESSES_BUCKET")
                                edges.append(GraphEdge(
                                    id=f"edge_{p_node_id}_to_{b_node_id}",
                                    source=p_node_id,
                                    target=b_node_id,
                                    label="Read/Write Data",
                                    relationship="ACCESSES_BUCKET",
                                    is_attack_path=bucket.contains_sensitive_data,
                                    risk_weight=3
                                ))

        # 9. Detect Critical Attack Chains & Privilege Escalation Paths
        # Vector 1: PassRole Escalation Chain
        for user in env.iam_users:
            for pol_arn in user.attached_policies:
                pol_name = pol_arn.split("/")[-1]
                pol = next((p for p in env.iam_policies if p.policy_name == pol_name or p.arn == pol_arn), None)
                if pol:
                    all_actions = [act for stmt in pol.statements for act in stmt.action]
                    has_passrole = "iam:PassRole" in all_actions or "*" in all_actions
                    has_compute = any(act in all_actions or act == "*" for act in ["ec2:RunInstances", "lambda:CreateFunction", "ecs:RunTask"])
                    if has_passrole and has_compute:
                        attack_paths.append(AttackPath(
                            path_id=f"AP-PASSROLE-{user.username}",
                            title="PassRole-to-Administrator Compute Privilege Escalation",
                            severity=SeverityLevel.CRITICAL,
                            entry_point=f"User: {user.username}",
                            target="AWS Root / AdministratorAccess",
                            hop_count=3,
                            steps=[
                                f"Attacker compromises user credentials for '{user.username}' (No MFA)",
                                f"Invokes ec2:RunInstances with attached policy '{pol.policy_name}'",
                                "Passes high-privileged 'OverPrivilegedAdminInstanceRole' to newly launched instance",
                                "Queries IMDSv2 metadata endpoint on EC2 instance to extract Administrator temporary STS credentials"
                            ],
                            cve_or_technique="MITRE ATT&CK T1078.004 (Cloud Accounts) & T1068 (Privilege Escalation)",
                            remediation_summary="Remove wildcard `iam:PassRole` and bind strict resource ARN scope with `iam:PassedToService` restriction."
                        ))

        # Vector 2: Internet Open Ingress to Compute / DB
        for sg in env.security_groups:
            open_rules = [r for r in sg.ingress_rules if r.cidr_ip in ["0.0.0.0/0", "::/0"]]
            if open_rules:
                for rule in open_rules:
                    port_text = f"Port {rule.from_port}" if rule.from_port else "All Ports"
                    attack_paths.append(AttackPath(
                        path_id=f"AP-INGRESS-{sg.group_id}-{rule.from_port}",
                        title=f"Direct Internet Ingress Breach Path ({port_text})",
                        severity=SeverityLevel.CRITICAL,
                        entry_point="Public Internet (0.0.0.0/0)",
                        target=f"Internal Workloads ({sg.group_name})",
                        hop_count=2,
                        steps=[
                            f"Internet threat actor discovers open ingress on {port_text} via Shodan/Censys port scanning",
                            f"Launches automated brute-force / unauthenticated exploit against {sg.group_name}",
                            "Gains initial shell execution inside VPC boundary and begins lateral subnet pivoting"
                        ],
                        cve_or_technique="MITRE ATT&CK T1190 (Exploit Public-Facing Application)",
                        remediation_summary=f"Revoke 0.0.0.0/0 ingress rule on {sg.group_name} and restrict traffic to authorized internal subnets."
                    ))

        # Vector 3: S3 Leaky Data Lake
        for bucket in env.s3_buckets:
            is_pub = any("AllUsers" in g.get("Grantee", "") for g in bucket.acl_grants)
            if is_pub and bucket.contains_sensitive_data:
                attack_paths.append(AttackPath(
                    path_id=f"AP-S3-LEAK-{bucket.name}",
                    title=f"Unauthenticated Data Exfiltration from S3 Bucket '{bucket.name}'",
                    severity=SeverityLevel.CRITICAL,
                    entry_point="Public Internet (0.0.0.0/0)",
                    target=f"Sensitive Data Lake ({bucket.data_classification})",
                    hop_count=1,
                    steps=[
                        f"Anonymous threat actor issues unsigned HTTP GET to https://{bucket.name}.s3.amazonaws.com",
                        "Bucket ACL grants READ permission to http://acs.amazonaws.com/groups/global/AllUsers",
                        f"Exfiltrates bulk customer / {bucket.data_classification} records with zero authentication barriers"
                    ],
                    cve_or_technique="MITRE ATT&CK T1530 (Data from Cloud Storage Object)",
                    remediation_summary="Apply AWS S3 Public Access Block (all 4 settings) and revoke AllUsers ACL grant."
                ))

        # Vector 4: Kubernetes Cluster Admin Takeover
        for rb in env.k8s_role_bindings:
            if rb.is_cluster_admin or rb.role_name == "cluster-admin":
                attack_paths.append(AttackPath(
                    path_id=f"AP-K8S-TAKEOVER-{rb.name}",
                    title=f"Kubernetes Cluster Root Takeover via ServiceAccount '{rb.name}'",
                    severity=SeverityLevel.CRITICAL,
                    entry_point="Compromised Pod Container",
                    target="Kubernetes API Server Root Control",
                    hop_count=2,
                    steps=[
                        f"Threat actor achieves remote code execution in any pod running in namespace '{rb.namespace}'",
                        "Mounts default ServiceAccount token mounted at `/var/run/secrets/kubernetes.io/serviceaccount/token`",
                        "RoleBinding grants cluster-admin root privileges with `*` verbs on `*` resources",
                        "Attacker deploys privileged DaemonSets to compromise underlying node host kernel"
                    ],
                    cve_or_technique="MITRE ATT&CK T1610 (Deploy Container) & T1611 (Escape to Host)",
                    remediation_summary="Delete default cluster-admin RoleBinding and scope ServiceAccount RBAC with granular Roles."
                ))

        return PermissionGraphResponse(
            nodes=nodes,
            edges=edges,
            attack_paths=attack_paths,
            total_nodes=len(nodes),
            total_edges=len(edges),
            critical_attack_chains_count=len(attack_paths)
        )
