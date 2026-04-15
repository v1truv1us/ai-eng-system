---
name: security-and-hardening
description: OWASP Top 10 prevention, auth patterns, secrets management, dependency auditing, three-tier boundary system. Use when handling user input, auth, data storage, or external integrations.
---

# Security and Hardening

## Overview

Apply security best practices systematically across the codebase. Prevent OWASP Top 10 vulnerabilities, manage secrets safely, audit dependencies, and enforce boundary validation at all system edges.

## When to Use

- Handling user input or external data
- Implementing authentication or authorization
- Storing or transmitting sensitive data
- Integrating with external services
- Before deploying any change to production

## OWASP Top 10 Prevention

### Injection

- Use parameterized queries for all database access
- Validate and sanitize all user input
- Use ORM/query builders that handle escaping
- Never concatenate user input into queries, commands, or HTML

### Broken Authentication

- Use established auth libraries (do not roll your own)
- Implement proper session management
- Require strong passwords and multi-factor authentication
- Use secure cookie flags (HttpOnly, Secure, SameSite)

### Sensitive Data Exposure

- Encrypt data at rest and in transit
- Never log sensitive data (passwords, tokens, PII)
- Use environment variables for secrets, never hardcode
- Minimize data collection to what is needed

### Security Misconfiguration

- Disable unnecessary features and services
- Keep all dependencies updated
- Use secure defaults (deny by default)
- Remove default credentials and sample data

### Broken Access Control

- Enforce authorization on every protected endpoint
- Do not rely on client-side access control
- Implement proper CORS policies
- Validate resource ownership

## Three-Tier Boundary System

### Tier 1: External Boundary

All data from outside the system is untrusted:
- HTTP request bodies, headers, and query parameters
- File uploads and external API responses
- Webhook payloads and email content

### Tier 2: Module Boundary

Data crossing module boundaries should be validated:
- Function parameters across module lines
- Queue message payloads
- Database read results when crossing service boundaries

### Tier 3: Internal Boundary

Data within a trusted module needs less validation, but:
- Validate at state transitions
- Assert invariants in critical paths
- Use type systems to catch mistakes

## Secrets Management

- Never hardcode secrets in source code
- Use environment variables or secret managers
- Validate required secrets at startup
- Rotate any exposed secrets immediately
- Add secret patterns to .gitignore

## Process

### Step 1: Identify Trust Boundaries

- List all points where data enters or leaves the system
- Identify authentication and authorization checkpoints
- Map data flows for sensitive information

### Step 2: Apply Boundary Validation

- Validate input at every trust boundary
- Sanitize output when crossing boundaries
- Use allow-lists over deny-lists where possible

### Step 3: Audit Dependencies

- Run dependency audit (npm audit, socket security)
- Check for known vulnerabilities
- Update or replace vulnerable packages

### Step 4: Verify Security Controls

- Test authentication flows
- Test authorization for each role
- Verify CORS and CSP policies
- Check that error messages do not leak sensitive data

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "This is internal, security does not matter" | Internal systems are targets for lateral movement after perimeter breach. |
| "We can add security later" | Retrofitting security is more expensive and less effective than building it in. |
| "Validation is redundant" | Defense in depth means multiple layers of validation. |

## Verification

- [ ] All user input is validated at trust boundaries
- [ ] No secrets in source code or logs
- [ ] Authentication and authorization tested for each role
- [ ] Dependency audit shows no critical vulnerabilities
- [ ] Error messages do not leak sensitive information
