"""Ingestion Engine - Loads, validates, and normalizes cloud environment dumps."""
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional
from pydantic import ValidationError

from app.models.schemas import (
    CloudEnvironmentDump,
    CloudProvider,
    IAMUser,
    IAMRole,
    IAMPolicy,
    IAMPolicyStatement,
    IAMAccessKey,
    S3Bucket,
    SecurityGroup,
    SecurityGroupRule,
    AzureRoleAssignment,
    AzureNSG,
    AzureNSGRule,
    K8sRoleBinding,
    K8sSubject,
    K8sPolicyRule
)
from app.config import DATA_DIR

logger = logging.getLogger(__name__)


class IngestionEngine:
    """Handles ingestion, parsing, and normalization of multi-cloud configuration dumps."""

    @staticmethod
    def normalize_dict(data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes various JSON dump schemas into AuditHound's standard schema."""
        normalized: Dict[str, Any] = {}

        # 1. Environment ID & Name
        env_id = data.get("id") or data.get("environment_id") or data.get("env_id") or "custom_audit_env"
        normalized["id"] = str(env_id)
        normalized["name"] = data.get("name") or data.get("title") or "Custom Cloud Environment Dump"
        normalized["description"] = data.get("description") or "Custom uploaded cloud infrastructure dump."

        # 2. Cloud Provider
        raw_provider = str(data.get("cloud_provider") or "AWS").upper()
        if "AZURE" in raw_provider:
            normalized["cloud_provider"] = CloudProvider.AZURE
        elif "KUBE" in raw_provider or "K8S" in raw_provider:
            normalized["cloud_provider"] = CloudProvider.KUBERNETES
        elif "HYBRID" in raw_provider:
            normalized["cloud_provider"] = CloudProvider.HYBRID
        else:
            normalized["cloud_provider"] = CloudProvider.AWS

        # 3. Timestamps & Metadata
        normalized["created_at"] = data.get("created_at") or datetime.now(timezone.utc).isoformat()
        normalized["version"] = str(data.get("version") or "1.0")
        normalized["metadata"] = data.get("metadata") or {
            "classification": data.get("classification", "Custom Assessment"),
            "tier": data.get("tier", "Uploaded Environment")
        }

        # Extracted policies repository
        extracted_policies: Dict[str, Dict[str, Any]] = {}
        for pol in data.get("iam_policies", []):
            if isinstance(pol, dict) and "policy_name" in pol:
                extracted_policies[pol["policy_name"]] = pol

        # 4. IAM Users
        users = []
        for u in data.get("iam_users", []):
            if not isinstance(u, dict):
                continue
            username = u.get("username") or u.get("user_name") or u.get("name") or "unknown_user"
            arn = u.get("arn") or f"arn:aws:iam::123456789012:user/{username}"
            mfa_enabled = bool(u.get("mfa_enabled", False))

            # Attached policies normalization
            attached_policy_names = []
            for p in u.get("attached_policies", []):
                if isinstance(p, str):
                    attached_policy_names.append(p)
                elif isinstance(p, dict):
                    p_name = p.get("policy_name") or f"{username}-inline-policy"
                    p_doc = p.get("policy_document") or {}
                    attached_policy_names.append(p_name)
                    
                    # Convert policy statements
                    statements = []
                    for stmt in p_doc.get("Statement", []):
                        action = stmt.get("Action", [])
                        if isinstance(action, str):
                            action = [action]
                        resource = stmt.get("Resource", [])
                        if isinstance(resource, str):
                            resource = [resource]
                        statements.append({
                            "effect": stmt.get("Effect", "Allow"),
                            "action": action,
                            "resource": resource
                        })
                    
                    extracted_policies[p_name] = {
                        "policy_name": p_name,
                        "arn": f"arn:aws:iam::123456789012:policy/{p_name}",
                        "policy_document": p_doc,
                        "statements": statements,
                        "is_admin_policy": "*" in [stmt.get("Action") for stmt in p_doc.get("Statement", []) if isinstance(stmt, dict)]
                    }

            # Access keys normalization
            access_keys = []
            for k in u.get("access_keys", []):
                if isinstance(k, dict):
                    access_keys.append({
                        "access_key_id": k.get("access_key_id", "AKIAUNKNOWNKEY"),
                        "status": k.get("status", "Active"),
                        "create_date": k.get("create_date") or k.get("created_date") or "2026-01-01T00:00:00Z",
                        "last_rotated_days_ago": k.get("last_rotated_days_ago", 0)
                    })

            users.append({
                "username": username,
                "arn": arn,
                "mfa_enabled": mfa_enabled,
                "access_keys": access_keys,
                "attached_policies": attached_policy_names,
                "attached_roles": u.get("attached_roles", []),
                "groups": u.get("groups", [])
            })
        normalized["iam_users"] = users

        # 5. IAM Roles
        roles = []
        for r in data.get("iam_roles", []):
            if not isinstance(r, dict):
                continue
            role_name = r.get("role_name") or r.get("name") or "unknown_role"
            arn = r.get("arn") or f"arn:aws:iam::123456789012:role/{role_name}"
            assume_policy = r.get("assume_role_policy") or {}

            attached_policy_names = []
            for p in r.get("attached_policies", []):
                if isinstance(p, str):
                    attached_policy_names.append(p)
                elif isinstance(p, dict):
                    p_name = p.get("policy_name") or f"{role_name}-policy"
                    p_doc = p.get("policy_document") or {}
                    attached_policy_names.append(p_name)
                    extracted_policies[p_name] = {
                        "policy_name": p_name,
                        "arn": f"arn:aws:iam::123456789012:policy/{p_name}",
                        "policy_document": p_doc,
                        "statements": [],
                        "is_admin_policy": False
                    }

            roles.append({
                "role_name": role_name,
                "arn": arn,
                "assume_role_policy": assume_policy,
                "attached_policies": attached_policy_names,
                "inline_policies": r.get("inline_policies", []),
                "trusts_wildcard": bool(r.get("trusts_wildcard", False))
            })
        normalized["iam_roles"] = roles

        # Put back extracted policies
        normalized["iam_policies"] = list(extracted_policies.values())

        # 6. S3 Buckets
        buckets = []
        for b in data.get("s3_buckets", []):
            if not isinstance(b, dict):
                continue
            b_name = b.get("name") or b.get("bucket_name") or "unnamed-bucket"
            b_arn = b.get("arn") or f"arn:aws:s3:::{b_name}"
            
            # Encryption check
            enc_enabled = b.get("encryption_enabled", False)
            if isinstance(b.get("encryption"), dict):
                enc_enabled = b.get("encryption", {}).get("enabled", False)

            # Versioning check
            ver_enabled = b.get("versioning_enabled", False)
            if isinstance(b.get("versioning"), dict):
                ver_enabled = b.get("versioning", {}).get("enabled", False)

            # Public access block
            pab = b.get("public_access_block") or {
                "BlockPublicAcls": not b.get("is_public", False),
                "IgnorePublicAcls": not b.get("is_public", False),
                "BlockPublicPolicy": not b.get("is_public", False),
                "RestrictPublicBuckets": not b.get("is_public", False)
            }

            buckets.append({
                "name": b_name,
                "arn": b_arn,
                "region": b.get("region", "us-east-1"),
                "versioning_enabled": ver_enabled,
                "encryption_enabled": enc_enabled,
                "kms_key_id": b.get("kms_key_id"),
                "public_access_block": pab,
                "acl_grants": b.get("acl_grants", []),
                "bucket_policy": b.get("bucket_policy"),
                "contains_sensitive_data": bool(b.get("contains_sensitive_data", False)),
                "data_classification": b.get("data_classification", "General")
            })
        normalized["s3_buckets"] = buckets

        # 7. Security Groups
        sgs = []
        for sg in data.get("security_groups", []):
            if not isinstance(sg, dict):
                continue
            sg_id = sg.get("group_id") or sg.get("id") or "sg-custom"
            sg_name = sg.get("group_name") or sg.get("name") or "custom-sg"
            vpc_id = sg.get("vpc_id") or "vpc-custom"

            ingress_rules = []
            for rule in sg.get("ingress_rules", []):
                cidr = rule.get("cidr_ip")
                if not cidr and isinstance(rule.get("cidr_blocks"), list) and rule.get("cidr_blocks"):
                    cidr = rule["cidr_blocks"][0]
                ingress_rules.append({
                    "protocol": str(rule.get("protocol", "-1")),
                    "from_port": rule.get("from_port"),
                    "to_port": rule.get("to_port"),
                    "cidr_ip": cidr or "0.0.0.0/0",
                    "description": rule.get("description", "")
                })

            egress_rules = []
            for rule in sg.get("egress_rules", []):
                cidr = rule.get("cidr_ip")
                if not cidr and isinstance(rule.get("cidr_blocks"), list) and rule.get("cidr_blocks"):
                    cidr = rule["cidr_blocks"][0]
                egress_rules.append({
                    "protocol": str(rule.get("protocol", "-1")),
                    "from_port": rule.get("from_port"),
                    "to_port": rule.get("to_port"),
                    "cidr_ip": cidr or "0.0.0.0/0",
                    "description": rule.get("description", "")
                })

            sgs.append({
                "group_id": sg_id,
                "group_name": sg_name,
                "vpc_id": vpc_id,
                "ingress_rules": ingress_rules,
                "egress_rules": egress_rules,
                "attached_resources": sg.get("attached_resources", [])
            })
        normalized["security_groups"] = sgs

        # 8. Azure Assets
        normalized["azure_role_assignments"] = data.get("azure_role_assignments", [])
        normalized["azure_nsgs"] = data.get("azure_nsgs", [])

        # 9. Kubernetes Assets
        k8s_bindings = data.get("k8s_role_bindings", [])
        if not k8s_bindings and isinstance(data.get("kubernetes_rbac"), dict):
            rbac = data["kubernetes_rbac"]
            for b in rbac.get("cluster_role_bindings", []):
                role_ref = b.get("role_ref", {})
                is_admin = role_ref.get("name") == "cluster-admin"
                subjects = []
                for s in b.get("subjects", []):
                    subjects.append({
                        "kind": s.get("kind", "ServiceAccount"),
                        "name": s.get("name", "default"),
                        "namespace": s.get("namespace", "default")
                    })
                k8s_bindings.append({
                    "name": b.get("binding_name") or b.get("name") or "custom-binding",
                    "namespace": "default",
                    "role_kind": role_ref.get("kind", "ClusterRole"),
                    "role_name": role_ref.get("name", "cluster-admin"),
                    "subjects": subjects,
                    "rules": [],
                    "is_cluster_admin": is_admin
                })
        normalized["k8s_role_bindings"] = k8s_bindings

        return normalized

    @staticmethod
    def load_environment_from_file(file_path: Path) -> CloudEnvironmentDump:
        """Loads and validates a single cloud environment JSON file."""
        if not file_path.exists():
            raise FileNotFoundError(f"Environment file not found at: {file_path}")
        
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        return IngestionEngine.parse_environment_dict(data)

    @staticmethod
    def parse_environment_dict(data: Dict[str, Any]) -> CloudEnvironmentDump:
        """Parses, normalizes, and validates a dictionary into a CloudEnvironmentDump model."""
        try:
            normalized_data = IngestionEngine.normalize_dict(data)
            return CloudEnvironmentDump.model_validate(normalized_data)
        except ValidationError as e:
            logger.error(f"Validation error during ingestion: {e.json()}")
            raise ValueError(f"Invalid cloud configuration dump schema: {e}")

    @staticmethod
    def list_available_mock_environments() -> List[Dict[str, Any]]:
        """Scans the mock environments directory and returns basic metadata."""
        environments = []
        if not DATA_DIR.exists():
            return environments

        for json_file in sorted(DATA_DIR.glob("*.json")):
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    environments.append({
                        "id": data.get("id", json_file.stem),
                        "file_name": json_file.name,
                        "name": data.get("name", json_file.stem.replace("_", " ").title()),
                        "description": data.get("description", ""),
                        "cloud_provider": data.get("cloud_provider", "AWS"),
                        "created_at": data.get("created_at", ""),
                        "classification": data.get("metadata", {}).get("classification", "Unknown"),
                        "tier": data.get("metadata", {}).get("tier", "Unknown")
                    })
            except Exception as e:
                logger.warning(f"Failed to read mock environment {json_file.name}: {e}")

        return environments

    @staticmethod
    def load_mock_environment_by_id(env_id: str) -> CloudEnvironmentDump:
        """Finds and loads a mock environment by its unique ID or filename."""
        if not DATA_DIR.exists():
            raise FileNotFoundError(f"Mock environments directory not found: {DATA_DIR}")

        for json_file in DATA_DIR.glob("*.json"):
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if data.get("id") == env_id or json_file.stem == env_id or json_file.name == env_id:
                        return IngestionEngine.parse_environment_dict(data)
            except Exception:
                continue

        raise FileNotFoundError(f"Mock environment with ID '{env_id}' not found.")
