# 🔒 Sentinara Privacy Policy

**Effective Date: September 20, 2026**

At **Sentinara**, we respect and protect the privacy of our users, developers, and enterprise security teams. This Privacy Policy details our data collection, processing, and zero-retention security practices in full alignment with GDPR, CCPA, and SOC 2 Type II privacy guidelines.

---

## 1. Information We Process
Sentinara is engineered with a **Zero-Payload Data Principle**:
- **Metadata & Topology Only**: We process cloud infrastructure metadata (e.g., IAM role ARNs, security group CIDRs, S3 bucket permission flags, Kubernetes service accounts).
- **No Sensitive Payload Extraction**: Sentinara does not access, inspect, download, or store the internal business contents of your databases, S3 object blobs, or application memory.

## 2. In-Memory & Client-Side Execution
- **Client-Side Parsing**: Custom cloud JSON configuration dumps uploaded through the web interface are evaluated in-memory within your browser sandbox or local container runtime.
- **Ephemeral Analysis**: Static attack graph traversal and severity grading run ephemerally with zero long-term retention of raw credential dumps.

## 3. How We Use Data
Collected telemetry and environment identifiers are strictly used to:
1. Compute deterministic 0–100 Security Posture Index scores and auditor letter grades ($A+$ through $F$).
2. Map multi-hop privilege escalation chains on directed graph canvases.
3. Synthesize least-privilege Terraform Infrastructure-as-Code patches.
4. Generate auditor-certified CISO compliance reports.

## 4. Data Protection & Cryptographic Security
- **Encryption in Transit**: All API communications use TLS 1.3 encryption.
- **Encryption at Rest**: Configuration caches are protected with AES-256 encryption.
- **Cryptographic State Locks**: Auto-remediation actions use signed state tokens (`rbk-xxxx`) to ensure atomic patch isolation.

## 5. Third-Party Sharing & Telemetry
Sentinara does NOT sell, rent, or monetize your infrastructure data. We do not transmit your telemetry to third-party advertising networks.

## 6. Your Rights (GDPR / CCPA)
Under applicable international privacy laws, you possess the right to:
- Inspect the metadata processed during any audit session.
- Purge uploaded custom configuration dumps immediately via the dashboard reset trigger.
- Run Sentinara in completely air-gapped or standalone on-premise CLI mode (`sentinara_cli.py`).

## 7. Contact Privacy Officer
- **Data Privacy Officer**: privacy@sentinara.io
- **Security Team**: security@sentinara.io
