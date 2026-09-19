"""AWS Live Collector - Extracts live AWS IAM, S3, and Security Group configurations into AuditHound JSON format."""
import json
import argparse
from datetime import datetime, timezone

try:
    import boto3
except ImportError:
    boto3 = None


def collect_live_aws(output_file: str, profile: str = None, region: str = "us-east-1"):
    if boto3 is None:
        print("[!] boto3 is not installed. Install via `pip install boto3` to use the live collector.")
        return

    session = boto3.Session(profile_name=profile, region_name=region) if profile else boto3.Session(region_name=region)
    iam = session.client("iam")
    s3 = session.client("s3")
    ec2 = session.client("ec2")

    print(f"[*] Connecting to AWS using session (Region: {region})...")

    # 1. Collect IAM Users
    print("[*] Collecting IAM Users and attached policies...")
    users = []
    try:
        paginator = iam.get_paginator("list_users")
        for page in paginator.paginate():
            for u in page["Users"]:
                uname = u["UserName"]
                arn = u["Arn"]
                
                # Check MFA
                mfa_res = iam.list_mfa_devices(UserName=uname)
                mfa_enabled = len(mfa_res.get("MFADevices", [])) > 0
                
                # Check Access Keys
                keys_res = iam.list_access_keys(UserName=uname)
                access_keys = []
                for k in keys_res.get("AccessKeyMetadata", []):
                    c_date = k["CreateDate"]
                    days_ago = (datetime.now(timezone.utc) - c_date).days
                    access_keys.append({
                        "access_key_id": k["AccessKeyId"],
                        "status": k["Status"],
                        "create_date": c_date.isoformat(),
                        "last_rotated_days_ago": days_ago
                    })

                # Check Attached Policies
                pol_res = iam.list_attached_user_policies(UserName=uname)
                attached_pols = [p["PolicyArn"] for p in pol_res.get("AttachedPolicies", [])]

                users.append({
                    "username": uname,
                    "arn": arn,
                    "mfa_enabled": mfa_enabled,
                    "access_keys": access_keys,
                    "attached_policies": attached_pols,
                    "attached_roles": [],
                    "groups": []
                })
    except Exception as e:
        print(f"[!] Warning reading IAM users: {e}")

    # 2. Collect S3 Buckets
    print("[*] Collecting S3 Buckets, Public Access Blocks, and Encryption...")
    buckets = []
    try:
        bucket_list = s3.list_buckets().get("Buckets", [])
        for b in bucket_list:
            bname = b["Name"]
            barn = f"arn:aws:s3:::{bname}"

            # Public access block
            pab_data = {"BlockPublicAcls": False, "IgnorePublicAcls": False, "BlockPublicPolicy": False, "RestrictPublicBuckets": False}
            try:
                pab_res = s3.get_public_access_block(Bucket=bname)
                cfg = pab_res.get("PublicAccessBlockConfiguration", {})
                pab_data = {
                    "BlockPublicAcls": cfg.get("BlockPublicAcls", False),
                    "IgnorePublicAcls": cfg.get("IgnorePublicAcls", False),
                    "BlockPublicPolicy": cfg.get("BlockPublicPolicy", False),
                    "RestrictPublicBuckets": cfg.get("RestrictPublicBuckets", False),
                }
            except Exception:
                pass

            # Encryption
            enc_enabled = False
            try:
                s3.get_bucket_encryption(Bucket=bname)
                enc_enabled = True
            except Exception:
                enc_enabled = False

            buckets.append({
                "name": bname,
                "arn": barn,
                "region": region,
                "versioning_enabled": False,
                "encryption_enabled": enc_enabled,
                "public_access_block": pab_data,
                "acl_grants": [],
                "contains_sensitive_data": False,
                "data_classification": "General"
            })
    except Exception as e:
        print(f"[!] Warning reading S3 buckets: {e}")

    # 3. Collect Security Groups
    print("[*] Collecting EC2 Security Groups and Ingress Rules...")
    sgs = []
    try:
        sg_res = ec2.describe_security_groups()
        for sg in sg_res.get("SecurityGroups", []):
            in_rules = []
            for perm in sg.get("IpPermissions", []):
                proto = perm.get("IpProtocol", "-1")
                from_p = perm.get("FromPort")
                to_p = perm.get("ToPort")
                for r in perm.get("IpRanges", []):
                    in_rules.append({
                        "protocol": proto,
                        "from_port": from_p,
                        "to_port": to_p,
                        "cidr_ip": r.get("CidrIp", "0.0.0.0/0"),
                        "description": r.get("Description", "")
                    })

            sgs.append({
                "group_id": sg["GroupId"],
                "group_name": sg["GroupName"],
                "vpc_id": sg.get("VpcId", ""),
                "ingress_rules": in_rules,
                "egress_rules": [],
                "attached_resources": []
            })
    except Exception as e:
        print(f"[!] Warning reading Security Groups: {e}")

    # Assemble AuditHound dump
    dump = {
        "id": f"live_aws_{region}_{int(datetime.now().timestamp())}",
        "name": f"Live AWS Cloud Audit ({region})",
        "description": f"Real-time configuration snapshot collected via AWS SDK on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "cloud_provider": "AWS",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "version": "1.0",
        "metadata": {
            "source": "Live AWS API Collector",
            "region": region
        },
        "iam_users": users,
        "iam_roles": [],
        "iam_policies": [],
        "s3_buckets": buckets,
        "security_groups": sgs,
        "azure_role_assignments": [],
        "azure_nsgs": [],
        "k8s_role_bindings": []
    }

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(dump, f, indent=2)

    print(f"\n[+] Successfully exported live AWS configuration to '{output_file}'!")
    print(f"[*] You can now audit this snapshot using:")
    print(f"    python backend/audithound_cli.py {output_file} --report live_aws_report.html")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Live AWS Configuration Collector for AuditHound")
    parser.add_argument("--output", "-o", default="live_aws_dump.json", help="Output JSON path")
    parser.add_argument("--profile", "-p", default=None, help="AWS CLI profile name")
    parser.add_argument("--region", "-r", default="us-east-1", help="AWS region")
    args = parser.parse_args()
    collect_live_aws(args.output, args.profile, args.region)
