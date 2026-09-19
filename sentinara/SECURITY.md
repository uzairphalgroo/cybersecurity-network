# 🛡️ Sentinara Security & Vulnerability Disclosure Policy

At **Sentinara**, security is our core foundation. Sentinara is an independent **open-source security engineering project** (not affiliated with or part of any commercial company possessing a similar name). We are committed to conducting rigorous security research and maintaining transparency across our autonomous cloud security engine.

---

## 🔒 Supported Versions

We provide active security updates, patches, and threat intelligence signatures for the following versions:

| Version | Supported | Status |
| :--- | :---: | :--- |
| **Sentinara v2.0.x (Current)** | ✅ | Active Maintenance & Zero-Day Updates |
| **Sentinara v1.x** | ✅ | Critical Security Patches Only |

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability within the Sentinara platform, engine, or CLI scanner, we appreciate your prompt disclosure:

1. **Do NOT open a public GitHub issue** for undisclosed security vulnerabilities.
2. Email full technical details, proof-of-concept payloads, and reproduction steps to:
   - **Primary Security Mailbox**: **`security@sentinara.io`**
   - **Lead Researcher**: **`uzairphalgroo@gmail.com`**
3. Our security team will acknowledge receipt within **24 hours** and provide an initial assessment within **48 hours**.

---

## 🏛️ Security Architecture Principles
- **Least Privilege Enforcement**: All generated Terraform patches strictly implement granular IAM resource scoping.
- **Rollback Safety**: Every auto-remediation execution creates a cryptographic state digest and signed rollback token (`rbk-xxxx`).
- **Zero Ingress Policy**: Management ports (SSH 22, RDP 3389, DB 3306) are strictly barred from public `0.0.0.0/0` exposure under SOC 2 CC6.6 rules.
- **eBPF Kernel Isolation**: Runtime socket monitors execute via sandboxed Linux 6.8 JIT probes with zero kernel panic risk.

*Thank you for helping us keep cloud infrastructure secure and resilient.*
