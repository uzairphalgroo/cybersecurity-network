# 🛡️ Sentinara: Cybersecurity Glossary, Definitions & Operator Guide

Welcome to the comprehensive technical guide and terminology reference for **Sentinara** — the Autonomous Cloud Security Posture Management (CSPM), Attack Graph Engine, and Zero-Touch Remediation Platform.

This guide provides exhaustive definitions of every security term, compliance benchmark, and architectural concept utilized in Sentinara, followed by a detailed end-to-end operator tutorial for security teams, DevOps engineers, and CISOs.

---

## 📑 Table of Contents
1. [Core Cybersecurity Concepts & Definitions](#-core-cybersecurity-concepts--definitions)
   - [Cloud Security Posture Management (CSPM)](#1-cloud-security-posture-management-cspm)
   - [Attack Path Graphs & Privilege Escalation](#2-attack-path-graphs--privilege-escalation)
   - [Autonomous AI Purple-Teaming & Breach Simulation](#3-autonomous-ai-purple-teaming--breach-simulation)
   - [Temporal Infrastructure Drift & Provenance](#4-temporal-infrastructure-drift--provenance)
   - [eBPF Runtime Packet Telemetry & Threat Correlation](#5-ebpf-runtime-packet-telemetry--threat-correlation)
   - [1-Click Zero-Touch Auto-Remediation & GitOps Defense](#6-1-click-zero-touch-auto-remediation--gitops-defense)
2. [Compliance Frameworks & Standardized Benchmarks](#-compliance-frameworks--standardized-benchmarks)
   - [SOC 2 Type II Common Criteria (CC6.1–CC6.8)](#soc-2-type-ii-common-criteria)
   - [CIS Foundations Benchmarks (AWS, Azure, Kubernetes)](#cis-foundations-benchmarks)
   - [MITRE ATT&CK Cloud Matrix](#mitre-attck-cloud-matrix)
3. [Sentinara Posture Scoring Algorithm & Grading](#-sentinara-posture-scoring-algorithm--grading)
4. [Step-by-Step Operator & User Guide](#-step-by-step-operator--user-guide)
   - [Tutorial 1: Launching & Ingesting Cloud Data (Upload vs Benchmark Scenarios)](#tutorial-1-launching--ingesting-cloud-data)
   - [Tutorial 2: Interpreting the Executive Scorecard & Findings Matrix](#tutorial-2-interpreting-the-executive-scorecard--findings-matrix)
   - [Tutorial 3: Analyzing Multi-Hop Attack Graphs](#tutorial-3-analyzing-multi-hop-attack-graphs)
   - [Tutorial 4: Executing Autonomous AI Purple-Team Simulations](#tutorial-4-executing-autonomous-ai-purple-team-simulations)
   - [Tutorial 5: Forensic Investigation with Temporal Drift Radar](#tutorial-5-forensic-investigation-with-temporal-drift-radar)
   - [Tutorial 6: Intercepting Live eBPF Kernel Telemetry Streams](#tutorial-6-intercepting-live-ebpf-kernel-telemetry-streams)
   - [Tutorial 7: Deploying 1-Click Zero-Touch Terraform Patches & Rollbacks](#tutorial-7-deploying-1-click-zero-touch-terraform-patches--rollbacks)
   - [Tutorial 8: Generating Auditor-Certified CISO Executive Reports](#tutorial-8-generating-auditor-certified-ciso-executive-reports)
   - [Tutorial 9: Integrating GitHub Action PR Security Sentinel Gate](#tutorial-9-integrating-github-action-pr-security-sentinel-gate)
   - [Tutorial 10: Running the Standalone CLI Scanner & Live AWS Collector](#tutorial-10-running-the-standalone-cli-scanner--live-aws-collector)
5. [Backend API Reference & Endpoints](#-backend-api-reference--endpoints)

---

## 📖 Core Cybersecurity Concepts & Definitions

### 1. Cloud Security Posture Management (CSPM)
**CSPM** is an automated practice of identifying, assessing, and remediating security risks and compliance misconfigurations across multi-cloud environments (AWS, Azure, Google Cloud, Kubernetes). Unlike traditional static vulnerability scanners that inspect code files on disk, CSPM continuously monitors live cloud control planes, identity permissions, network routing tables, and storage buckets to prevent cloud leaks, lateral traversal, and account takeovers.

### 2. Attack Path Graphs & Privilege Escalation
An **Attack Path Graph** is a directed mathematical graph $G = (V, E)$ where:
- **Vertices ($V$)** represent cloud assets: IAM Users, Roles, Policies, EC2 Instances, S3 Buckets, Security Groups, and ServiceAccounts.
- **Edges ($E$)** represent actionable trust relationships, network routes, or identity permissions (e.g., `CONNECTS_TO`, `ASSUMES_ROLE`, `CAN_PASS_ROLE`, `EXPOSES_PORT_22`).

#### Key IAM Privilege Escalation Vectors:
- **`iam:PassRole`**: An AWS permission allowing a service principal or user to assign an IAM role to a compute asset (such as an EC2 instance or Lambda function). If a developer role possesses `iam:PassRole` and `ec2:RunInstances` without strict resource scoping, an attacker can launch an instance attached to the `AdministratorAccess` role and gain root control of the cloud account.
- **`iam:CreatePolicyVersion`**: Allows a principal to create a new default policy version. If an attacker has this permission on an existing policy, they can author a policy statement granting `{"Action": "*", "Resource": "*"}` to themselves, instantly bypassing least-privilege constraints.
- **`iam:AttachUserPolicy` / `iam:AttachRolePolicy`**: Grants permission to attach administrative managed policies directly to user identities or service roles.
- **Wildcard Actions (`Action: *`)**: Overly broad permission definitions granting full administrative capabilities across all APIs, violating SOC2 CC6.3.

---

### 3. Autonomous AI Purple-Teaming & Breach Simulation
**Purple Teaming** is the active convergence of Red Team (offensive adversarial simulation) and Blue Team (defensive posture hardening). 

In Sentinara, the **Autonomous AI Purple-Teaming Agent** simulates real-world threat actors (such as **APT-29 / Midnight Blizzard** or **Scattered Spider**) against your cloud graph:
- **Blast Radius Percentage**: The mathematical proportion of reachable cloud assets from an initial compromised node:
  $$\text{Blast Radius} = \frac{|\text{Descendants}(G, \text{Entry Node})| + 1}{|V|} \times 100\%$$
- **Crown Jewels**: High-value critical targets within an organization (e.g., Customer PII Data Lakes, Kubernetes Control Planes, Master KMS Encryption Keys, Root Admin IAM roles).
- **Kill-Chain Cut-Points**: The precise network security rule or IAM permission boundary whose deletion will immediately sever the multi-hop traversal path, dropping breach probability to 0%.

---

### 4. Temporal Infrastructure Drift & Provenance
**Infrastructure Drift** occurs when manual changes made directly in cloud web consoles or emergency CLI sessions cause the actual running cloud infrastructure to diverge from the declared Infrastructure-as-Code (Terraform/CloudFormation) baseline.

Sentinara’s **Temporal Drift Radar** tracks 4 distinct evolutionary snapshots:
- **$T_0$ Genesis Baseline**: The golden state deployed via verified CI/CD pipeline (Score: ~98/100, Auditor Grade: A+).
- **$T_1$ Feature Expansion**: Addition of microservices and storage nodes with minor credential aging (Score: ~84/100, Auditor Grade: B).
- **$T_2$ Out-of-Band Drift**: Emergency out-of-band console changes bypassing GitOps gates, creating open `0.0.0.0/0` ingress and wildcard IAM roles (Score: ~46/100, Auditor Grade: F).
- **$T_3$ Remediated Enclave**: Post-Sentinara auto-patch state restoring least-privilege boundaries (Score: ~99/100, Auditor Grade: A+).
- **Forensic Attribution**: Identifies triggering user ARN, commit hash, CloudTrail digest, and exact score degradation delta.

---

### 5. eBPF Runtime Packet Telemetry & Threat Correlation
**eBPF (Extended Berkeley Packet Filter)** is a revolutionary Linux kernel technology that allows executing sandboxed, high-performance bytecode programs directly within the kernel without altering kernel source code or loading kernel modules.

In Sentinara:
- **Kernel JIT Kprobes**: Attaches probes to `sys_enter_connect()`, `tcp_v4_connect()`, and `security_socket_bind()` to monitor socket connections with zero performance overhead.
- **Threat Correlation**: Binds real-time runtime network beacons (e.g., suspicious C2 traffic to external rogue IPs or unauthenticated Kubernetes API server probes) directly to static IAM vulnerabilities and NetworkX attack paths.

---

### 6. 1-Click Zero-Touch Auto-Remediation & GitOps Defense
**Zero-Touch Remediation** is an automated mechanism for fixing security misconfigurations without requiring manual coding:
- **Synthetic Plan Verification**: Compiles non-destructive HCL code and verifies schema compatibility before execution.
- **Cryptographic State Lock**: Creates a state digest snapshot to prevent race conditions during execution.
- **Instant Rollback Checkpoint**: Generates a cryptographically signed rollback token (`rbk-xxxx`) allowing instantaneous one-click reversion if operational issues arise.

---

## 📋 Compliance Frameworks & Standardized Benchmarks

### SOC 2 Type II Common Criteria
| Trust Services Criteria | Title | Requirement & Sentinara Rule |
| :--- | :--- | :--- |
| **CC6.1** | **Logical Access Controls** | Restricts logical access to registered users; requires Multi-Factor Authentication (MFA) on all console and API users. |
| **CC6.3** | **Least Privilege & RBAC** | Restricts administrative privileges to authorized roles; forbids wildcard `*` permissions and dangerous `iam:PassRole` vectors. |
| **CC6.6** | **Boundary Protection & Ingress** | Prevents direct unconstrained public internet exposure (`0.0.0.0/0`) on management ports (SSH 22, RDP 3389, MySQL 3306). |
| **CC6.7** | **Data Transmission Security** | Enforces server-side AES-256 / KMS encryption-at-rest on data lakes and TLS 1.3 encryption-in-transit. |
| **CC6.8** | **Threat Detection & Prevention** | Enforces continuous monitoring, logging (AWS CloudTrail / Flow Logs), and runtime threat anomaly prevention. |

---

### CIS Foundations Benchmarks
- **CIS AWS Foundations Benchmark v3.0**: Standard guidelines for IAM password policies, hardware MFA, CloudTrail integrity validation, and S3 Public Access Block enforcement.
- **CIS Microsoft Azure Benchmark v2.0**: Benchmarks for Azure Network Security Groups (NSGs), role-based assignments, and storage account access keys.
- **CIS Kubernetes Benchmark v1.8**: Prohibits binding default ServiceAccounts to the `cluster-admin` ClusterRole and requires namespaces isolation.

---

### MITRE ATT&CK Cloud Matrix
Sentinara maps all findings and simulation steps to MITRE ATT&CK techniques:
- **`T1190`**: Exploit Public-Facing Application (Open Security Group Ingress / S3 Public ACL).
- **`T1078.004`**: Valid Accounts: Cloud Accounts (Stale Access Keys / MFA Disabled).
- **`T1068`**: Exploitation for Privilege Escalation (AWS IAM PassRole / K8s ClusterRoleBinding).
- **`T1530`**: Data from Cloud Storage Object (Unauthenticated S3 GetObject Exfiltration).
- **`T1048`**: Exfiltration Over Alternative Protocol (eBPF-detected C2 egress socket streams).

---

## 🧮 Sentinara Posture Scoring Algorithm & Grading

Sentinara computes a deterministic 0–100 Security Posture Index based on detected findings, severities, and lateral reachability:

$$\text{Posture Score} = \max\left(15, \, 100 - (22 \times N_{\text{Critical}}) - (12 \times N_{\text{High}}) - (5 \times N_{\text{Medium}})\right)$$

| Score Range | Auditor Grade | Risk Rating | Status Description |
| :--- | :---: | :---: | :--- |
| **90 – 100** | **`A+`** | **Low / Compliant** | Golden baseline enclave; 0 critical attack paths; SOC2 & CIS benchmarks satisfied. |
| **80 – 89** | **`B`** | **Moderate** | Low risk; minor credential aging or non-blocking policy warning. |
| **70 – 79** | **`C`** | **Elevated** | Multiple medium-severity findings; missing encryption or ingress scope alerts. |
| **50 – 69** | **`D`** | **High** | High-risk IAM privileges or exposed public database ports identified. |
| **0 – 49** | **`F`** | **Critical** | Active multi-hop breach path to cloud root; immediate remediation required. |

---

## 🚀 Step-by-Step Operator & User Guide

### Tutorial 1: Launching & Ingesting Cloud Data

1. **Option A: Testing with Pre-Built Scenarios (Zero-Setup)**:
   - On the startup screen, click **`⚡ Test Free Open-Source Data`** or pick one of the 10 catalog environments in the top carousel:
     - `01_fintech_prod_banking`: Tier-1 Compliant Banking Enclave (Grade A+).
     - `04_crypto_miner_breach_vector`: Compromised PassRole EC2 Escalation (Grade D).
     - `05_leaky_health_datalake`: HIPAA Data Lake Exposure (Grade F).
     - `06_k8s_cluster_takeover`: Kubernetes Default ServiceAccount Takeover (Grade F).

2. **Option B: Uploading Custom Cloud Configuration Dump**:
   - Click **`📤 Upload Custom JSON`** in the top bar.
   - Drag and drop your cloud export JSON file (e.g., `sample_opensource_cloud_dump.json`).
   - Sentinara’s client-side static engine parses IAM users, roles, policies, security groups, S3 buckets, and K8s bindings in under 200 milliseconds.

---

### Tutorial 2: Interpreting the Executive Scorecard & Findings Matrix

1. Navigate to the **`Dashboard`** tab.
2. Inspect the **Executive Scorecard**:
   - **Overall Posture Gauge**: Displays the 0–100 score and letter grade.
   - **Framework Compliance Radars**: Check individual percentages for SOC2 CC6.1, CC6.3, CC6.6, and CC6.7.
   - **Top Executive Risks**: Bulleted executive summary suitable for board presentations.
3. Switch to the **`Findings`** tab to view the detailed table:
   - Filter findings by **Severity** (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
   - Filter findings by **Framework** or search by resource ID.
   - Click **`⚡ Remediate`** on any finding to jump directly to its generated Terraform patch.

---

### Tutorial 3: Analyzing Multi-Hop Attack Graphs

1. Navigate to the **`Attack Graph`** tab.
2. The interactive **Cytoscape.js** canvas renders your cloud architecture:
   - **Red Nodes & Edges**: Active attack chains and compromised entry vectors.
   - **Blue/Emerald Nodes**: Hardened services and internal VPC boundaries.
   - **Target Crown Jewel**: The ultimate escalation target (e.g., `Cloud Root Administrator`).
3. Click on any node to view detailed metadata (ARN, MFA status, attached policies, open ports).
4. Review the **Exploit Path Sequence** below the canvas for step-by-step adversary pivoting instructions.

---

### Tutorial 4: Executing Autonomous AI Purple-Team Simulations

1. Click on the **`🤖 Purple-Team AI`** tab in the main navigation.
2. Select your adversary campaign objective:
   - 🗄️ *Exfiltrate Crown-Jewel Customer PII Lake*
   - 🔒 *Deploy Cloud-Native Ransomware Lockdown*
   - ☸️ *Kubernetes Cluster-Admin Escalation*
   - 👑 *Full Cloud Organization Root Takeover*
3. Click **`⚡ Run Live Simulation`**:
   - The engine computes the **Blast Radius Percentage** and **Breach Probability Likelihood %**.
   - Inspect the **Adversary Kill-Chain Traversal Log** with MITRE ATT&CK technique IDs.
   - Click on individual steps to inspect the exact lateral pivoting forensic evidence.
   - Review the **Optimal Kill-Chain Cut-Point** showing which single rule to revoke to drop breach probability to 0%.

---

### Tutorial 5: Forensic Investigation with Temporal Drift Radar

1. Navigate to the **`⏱️ Drift Radar`** tab.
2. Use the **Horizontal Time Scrubber** to inspect epochs:
   - **`T0`**: Initial Baseline Genesis.
   - **`T1`**: Microservice Cloud Scale-Up.
   - **`T2`**: Out-of-Band Configuration Drift (Current State).
   - **`T3`**: Remediated Least-Privilege Enclave.
3. Inspect the **Forensic Provenance Card** on the right to see the triggering actor ARN, Git commit hash, and net score degradation delta.
4. Click **`⏪ Revert Drift to T0 Baseline`** to simulate instantaneous rollback of unauthorized configuration drift.

---

### Tutorial 6: Intercepting Live eBPF Kernel Telemetry Streams

1. Navigate to the **`📡 eBPF Telemetry`** tab.
2. View the real-time Linux 6.8 eBPF JIT socket stream:
   - Monitor live kernel hooks (`sys_enter_connect`, `kprobe:tcp_v4_connect`).
   - Identify malicious C2 beacons vs benign internal traffic.
   - See live correlation with static IAM findings (e.g., `FIND-AWS-IAM-PASSROLE-001`).
3. Toggle between **`🔍 All Socket Flows`** and **`🚨 Threats Only`**.
4. Use the **`Pause / Resume`** stream button to freeze live packet capture for forensics.

---

### Tutorial 7: Deploying 1-Click Zero-Touch Terraform Patches & Rollbacks

1. Click the glowing **`⚡ 1-Click Zero-Touch Remediate`** button in the top navigation bar.
2. In the modal:
   - Select **`🧪 Dry-Run Spec`** for non-destructive schema verification with zero cloud changes.
   - Or select **`⚡ Live 1-Click Apply`** to apply HCL patches to your cloud provider.
3. Click **`Execute Zero-Touch Cloud Patch`**:
   - Watch the step-by-step CLI execution traces (IAM pre-flight checks, state snapshot locks, HCL compilation, and apply).
   - A cryptographically signed **Rollback Token** is generated.
4. If needed, click **`⏪ Trigger Instant Rollback`** to immediately revert to the pre-remediation state digest.

---

### Tutorial 8: Generating Auditor-Certified CISO Executive Reports

1. Click **`📄 CISO Audit Report`** in the top right header.
2. An auditor-certified executive report modal will open containing:
   - Official Audit Certification Sign-Off Block.
   - Letter Grade and Risk Category Stamp.
   - Executive Risk Summary & Finding Count Breakdown.
   - SOC2 & CIS Benchmark Scorecards.
   - Complete Terraform Remediation Appendices.
3. Click **`🖨️ Print / Save as PDF`** to generate a clean, print-ready PDF for audit reviews.

---

### Tutorial 9: Integrating GitHub Action PR Security Sentinel Gate

Sentinara includes an automated GitHub Action workflow that acts as a security gate on every pull request.

1. Ensure [`.github/workflows/sentinara-sentinel.yml`](file:///.github/workflows/sentinara-sentinel.yml) is in your repository.
2. When developers submit a pull request modifying cloud templates or JSON dumps:
   - Sentinara CLI scans the PR changes automatically.
   - If critical vulnerabilities or privilege escalation paths are detected, the PR build fails.
   - An automated markdown security review comment is posted with exact line-by-line remediation recommendations.

---

### Tutorial 10: Running the Standalone CLI Scanner & Live AWS Collector

#### Standalone CLI Scanner:
```bash
cd sentinara
# Run scan on local JSON dump
python backend/sentinara_cli.py --file sample_opensource_cloud_dump.json

# Export executive HTML report and Terraform patches
python backend/sentinara_cli.py \
  --file sample_opensource_cloud_dump.json \
  --report executive_audit.html \
  --tf-output remediations.tf
```

#### Live AWS Cloud Collector:
```bash
cd sentinara
# Extract live AWS IAM and S3 configuration to JSON dump
python scripts/aws_live_collector.py \
  --profile my-aws-profile \
  --region us-east-1 \
  --output live_aws_audit_dump.json
```

---

## 🔌 Backend API Reference & Endpoints

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | **`/`** | Health check, engine status, and supported framework list. |
| `GET` | **`/api/environments`** | Returns catalog of available cloud environments and metadata. |
| `GET` | **`/api/environments/{env_id}`** | Fetches raw cloud configuration JSON dump for an environment. |
| `POST` | **`/api/environments/upload`** | Ingests custom user-uploaded cloud configuration JSON dump. |
| `GET` | **`/api/audit/{env_id}`** | Executes compliance rules and attack path analysis on environment. |
| `POST` | **`/api/audit/custom`** | Audits an in-memory custom JSON cloud configuration payload. |
| `GET` | **`/api/remediation/environment/{env_id}`** | Generates batch Terraform least-privilege remediation patches. |
| `GET` | **`/api/remediation/download/{env_id}`** | Downloads combined `.tf` remediation file. |
| `GET` | **`/api/reports/html/{env_id}`** | Generates auditor-certified standalone CISO HTML executive report. |
| `POST` | **`/api/advanced/purple-team/simulate`** | 🤖 Simulates adversary kill-chain and computes blast radius %. |
| `GET` | **`/api/advanced/drift/timeline/{env_id}`** | ⏱️ Returns 4-epoch temporal drift evolution and score deltas. |
| `POST` | **`/api/advanced/telemetry/stream`** | 📡 Generates synthetic Linux 6.8 eBPF packet socket stream. |
| `POST` | **`/api/advanced/remediation/zero-touch`** | ⚡ Executes 1-click zero-touch cloud auto-remediation dry-run/apply. |

---

## 🏛️ Summary & Best Practices
- **Continuous Auditing**: Run scans on every Git PR and scheduled cron interval.
- **Enforce Least-Privilege**: Replace wildcard `*` permissions with scoped action lists.
- **Zero Public Ingress**: Ensure management ports (22, 3389, 3306) are never open to `0.0.0.0/0`.
- **Review Cut-Points**: Prioritize fixing single-click cut-points to sever entire multi-hop attack graphs instantly.

*Sentinara — Autonomous Cloud Security & Compliance Auditing Platform.*
