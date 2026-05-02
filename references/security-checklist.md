# Security Checklist Reference

## Pre-Commit Checks

- [ ] No hardcoded secrets, API keys, or passwords in code
- [ ] No `.env` files committed (check `.gitignore`)
- [ ] No debug logging of sensitive data (passwords, tokens, PII)
- [ ] Dependencies scanned for known vulnerabilities
- [ ] No console.log() or debugger statements in production code

## Authentication

- [ ] Passwords hashed with bcrypt (cost factor >= 12) or argon2
- [ ] JWT tokens use RS256 or ES256 (not HS256 for multi-tenant)
- [ ] Token expiration set (access: 15min, refresh: 7d)
- [ ] Refresh tokens rotated on use
- [ ] Session IDs are cryptographically random (>= 128 bits)
- [ ] MFA supported for sensitive operations
- [ ] Account lockout after failed attempts (5 attempts, 15min lockout)
- [ ] Password reset tokens are single-use and expire (1 hour)

## Authorization

- [ ] Principle of least privilege applied
- [ ] Role-based access control (RBAC) implemented
- [ ] No IDOR vulnerabilities (users can't access other users' data)
- [ ] API endpoints verify authorization on every request
- [ ] Admin endpoints require admin role
- [ ] Resource ownership verified before allowing mutations

## Input Validation

- [ ] All user input validated and sanitized
- [ ] SQL queries use parameterized statements (no string concatenation)
- [ ] XSS prevention: output encoding for user-generated content
- [ ] File uploads: validate type, size, and content (not just extension)
- [ ] URL validation for redirects (no open redirects)
- [ ] Rate limiting on all public endpoints
- [ ] Request size limits configured

## Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0  (use CSP instead)
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## CORS Configuration

- [ ] Allowed origins explicitly listed (no `*` in production)
- [ ] Credentials only allowed with specific origins
- [ ] Only necessary HTTP methods allowed
- [ ] Preflight caching reasonable (not too long)

## OWASP Top 10 Prevention

| # | Vulnerability | Prevention |
|---|--------------|------------|
| A01 | Broken Access Control | RBAC, resource ownership checks |
| A02 | Cryptographic Failures | Strong algorithms, proper key management |
| A03 | Injection | Parameterized queries, input validation |
| A04 | Insecure Design | Threat modeling, security requirements |
| A05 | Security Misconfiguration | Secure defaults, minimal features |
| A06 | Vulnerable Components | Dependency scanning, regular updates |
| A07 | Auth Failures | MFA, rate limiting, secure session management |
| A08 | Data Integrity Failures | Digital signatures, checksums |
| A09 | Logging Failures | Structured logging, no sensitive data |
| A10 | SSRF | URL validation, allowlist, network segmentation |

## Secrets Management

- [ ] Secrets stored in environment variables or secret manager (not code)
- [ ] Secrets rotated regularly (90 days max)
- [ ] Different secrets for each environment (dev, staging, prod)
- [ ] Secrets never logged or included in error messages
- [ ] API keys have minimal required permissions

## Data Protection

- [ ] PII encrypted at rest (AES-256)
- [ ] PII encrypted in transit (TLS 1.2+)
- [ ] Database backups encrypted
- [ ] Data retention policies implemented
- [ ] GDPR/CCPA compliance: right to deletion, data portability
- [ ] Audit logging for sensitive operations

## Dependency Auditing

```bash
# npm
npm audit
npm audit fix

# Check for outdated packages
npm outdated

# Automated scanning (CI)
npx socket scan
```

## Three-Tier Boundary System

| Tier | Trust Level | Validation |
|------|------------|------------|
| Internal | Trusted | Type checking, unit tests |
| External API | Partially trusted | Input validation, rate limiting, auth |
| User input | Untrusted | Full sanitization, validation, escaping |
