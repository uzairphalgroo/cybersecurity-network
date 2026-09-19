# Contributing to AuditHound

Thank you for your interest in contributing to **AuditHound**! We welcome contributions from cloud security engineers, DevOps specialists, and developers.

---

## 🛠️ Development Setup

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/<your-username>/audit-hound.git
   cd audit-hound
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate # Or .\venv\Scripts\activate on Windows
   pip install -r requirements.txt
   pytest -v
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📋 Adding New Compliance & Security Rules

To add a new rule:
1. Open `backend/app/engine/compliance.py`.
2. Add your rule logic to the appropriate provider check (e.g. `_check_iam_policy`, `_check_s3_bucket`, `_check_k8s_role_binding`).
3. Define the corresponding remediation HCL template in `backend/app/engine/remediation.py`.
4. Add automated unit tests in `backend/tests/test_compliance.py`.
5. Run `pytest -v` to ensure all tests pass.

---

## 🛡️ Pull Request Guidelines

- Ensure your branch is up to date with `main`.
- All tests must pass (`pytest -v` and `npm run build`).
- Keep PRs focused on a single feature or bug fix.
- Follow PEP 8 style guides for Python and ESLint/TypeScript standards for React.
