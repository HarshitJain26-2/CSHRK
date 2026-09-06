# Security Policy

## 1. Supported Versions

Only the current active sequential phase release is supported for security updates.

| Version / Phase | Supported |
| :--- | :--- |
| Phase 0 Foundation | Yes |

---

## 2. Reporting a Vulnerability

If you discover a potential security vulnerability within CSHRK:
1. **DO NOT** open a public GitHub issue.
2. Contact the core engineering security group or lead maintainer privately.
3. Include detailed steps to reproduce the vulnerability, including payload samples and affected components.
4. The team will acknowledge receipt within 24 hours and issue a fix on a priority patch branch.

---

## 3. Secret Management Rules

- All secrets, API keys, database credentials, and JWT signing keys must be loaded strictly through environment variables.
- The `.gitignore` file strictly blocks `.env` files from entering source control.
- Any accidental commit of secrets must result in immediate key revocation.
