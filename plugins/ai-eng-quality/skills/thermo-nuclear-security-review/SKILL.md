---
name: thermo-nuclear-security-review
description: Run an extremely strict security audit for auth flaws, injection vectors, secrets exposure, broken access control, and boundary validation failures. Use for a thermo-nuclear security review, thermonuclear security audit, or especially harsh security review.
metadata:
  category: user-invoked
disable-model-invocation: true
---

# Thermo-Nuclear Security Review

Use this skill for an unusually strict security-focused review. Do not merely check for obvious vulnerabilities. Actively hunt for attack surfaces, trust boundary violations, and architectural weaknesses that make exploitation inevitable under pressure.

Above all, this skill should push the reviewer to be **ambitious** about security posture. Do not stop at "this input isn't validated." Look for systemic trust failures: places where the architecture assumes benign actors, where defense-in-depth is missing, where a single compromise cascades.

## Core Prompt

Start from this baseline:

> Perform a deep security audit of the current branch's changes.
> Assume an active adversary with full knowledge of the system.
> Identify every trust boundary, every place untrusted data flows, and every assumption that could be violated.
> Be extremely thorough and rigorous. A missed vulnerability in production is a breach, not a bug.

## Non-Negotiable Security Standards

0. **Assume breach. Assume malicious input. Assume insider threat.**
   - Every external input is an attack vector until proven otherwise.
   - Every API endpoint is exposed to the internet until proven otherwise.
   - Every user role can escalate until proven otherwise.

1. **Authentication and session management must be bulletproof.**
   - Flag any password storage that isn't bcrypt/argon2 with proper salt.
   - Flag any session token that isn't cryptographically random, HttpOnly, Secure, SameSite.
   - Flag any auth check that can be bypassed by modifying a request parameter.
   - Flag any place where auth state is stored client-side without cryptographic verification.
   - Flag any logout that doesn't fully invalidate the session server-side.

2. **Authorization must be enforced at every layer, not just the router.**
   - Every data access must verify the requesting user owns or can access that resource.
   - IDOR (Insecure Direct Object Reference) is a presumptive blocker.
   - Role checks must happen server-side; client-side role checks are cosmetic.
   - Flag any endpoint that retrieves data by user-supplied ID without ownership verification.

3. **Injection is never acceptable.**
   - Any unsanitized input in SQL queries, shell commands, HTML, LDAP, or log entries is a critical finding.
   - Parameterized queries / prepared statements are the only acceptable SQL pattern.
   - `eval()`, `exec()`, `Function()`, template string interpolation into commands are presumptive blockers.
   - Flag any place where user input controls file paths (path traversal).

4. **Secrets must never be in source control, logs, or client-visible code.**
   - API keys, tokens, passwords, private keys in source code are critical findings.
   - Secrets in environment variables that leak into logs or error messages are critical findings.
   - Hardcoded credentials, even for test/dev, are presumptive blockers.
   - `.env` files committed to version control are critical findings.

5. **Cryptographic operations must use current best practices.**
   - MD5, SHA1 for security purposes are critical findings.
   - AES-ECB is a critical finding.
   - Hardcoded IVs or nonces are critical findings.
   - Custom crypto implementations are presumptive blockers.
   - Flag any encryption key shorter than 256 bits for symmetric, 2048 bits for RSA.

6. **Input validation must happen at the boundary, not deep in business logic.**
   - Validate and sanitize at the entry point (API handler, middleware, controller).
   - Type coercion, range checks, and allow-lists over deny-lists.
   - Flag any place where raw user input reaches business logic without validation.
   - Payload size limits must exist on every endpoint.

7. **Error handling must not leak information.**
   - Stack traces in production responses are critical findings.
   - Database error messages returned to clients are critical findings.
   - Verbose validation error messages that reveal internal structure are findings.
   - Flag any catch block that returns the raw error to the user.

8. **Dependencies must not introduce known vulnerabilities.**
   - Flag any dependency with known CVEs.
   - Flag any dependency that hasn't been updated in 2+ years.
   - Flag any dependency pulled from unverified sources.

## Primary Security Questions

For every meaningful change, ask:

- Does this introduce a new trust boundary? Is it enforced?
- Does this accept untrusted input? Where is it validated?
- Does this expose data? Who can access it? How is that enforced?
- Does this handle secrets? Where do they live? Who can see them?
- Does this make a network call? Is the destination trusted? Is TLS enforced?
- Does this write to disk or database? Is the path/query injection-safe?
- Does this handle authentication or authorization? Can it be bypassed?
- Does this use cryptography? Is it using the right algorithm and key size?
- Does this log user input? Could logs be used for injection or information leakage?
- Does this change error handling? Could errors reveal sensitive information?
- If an attacker controlled every input to this change, what could they do?

## What to Flag Aggressively

- SQL string concatenation with user input.
- Shell command execution with user input.
- HTML rendering of user input without escaping.
- File operations with user-controlled paths.
- Auth decisions based on client-side state.
- Secrets in source code or configuration files.
- Missing authentication on sensitive endpoints.
- Missing authorization checks on data access.
- Crypto using outdated algorithms or insufficient key sizes.
- Error responses that include stack traces or internal details.
- CORS configured to allow any origin on authenticated endpoints.
- Rate limiting missing on authentication endpoints.
- Tokens or credentials in URLs.
- Unvalidated redirects.
- SSRF vectors (server-side requests with user-controlled URLs).
- Insecure deserialization of untrusted data.
- Missing Content-Security-Policy headers for web endpoints.
- User input in log entries without sanitization.

## Preferred Remedies

- Parameterized queries. Always.
- Allow-list input validation at the boundary.
- Server-side auth checks on every data access.
- Secrets in vaults/environment, never in code.
- Current cryptographic primitives (AES-256-GCM, bcrypt/argon2, Ed25519/RSA-2048+).
- Generic error responses in production.
- Defense-in-depth: validate at every layer, not just the perimeter.
- Rate limiting on all auth-adjacent endpoints.
- CSP headers, HSTS, X-Frame-Options for web endpoints.
- Dependency auditing in CI.

Do not be satisfied with "the input is validated somewhere" when the validation is distant from the usage.
Do not be satisfied with "we'll add security later" when the architecture makes it hard.

## Review Tone

Be direct, serious, and demanding about security.
A missed vulnerability is not a style nit — it is a future incident.
If the code creates an attack surface, say so clearly.
If the architecture makes security hard to enforce, say that clearly too.

Good phrases:

- `this accepts untrusted input and passes it to a shell command. this is a textbook injection vector.`
- `this auth check only happens in the frontend. the API endpoint has no authorization. IDOR is trivial.`
- `this API key is hardcoded in source. rotate it immediately and move to a vault.`
- `this uses MD5 for password hashing. this is broken. use bcrypt or argon2.`
- `this error response includes the full stack trace. in production this reveals internal structure.`
- `this endpoint retrieves a record by user-supplied ID with no ownership check. any authenticated user can access any record.`
- `this is a nice feature but it creates an SSRF vector. the server makes a request to a user-controlled URL.`

## Output Expectations

Prioritize findings in this order:

1. Exploitable vulnerabilities (injection, auth bypass, secrets exposure)
2. Trust boundary violations and missing validation
3. Authorization gaps and access control failures
4. Cryptographic weaknesses
5. Information leakage in error handling and logging
6. Dependency and supply chain risks
7. Missing security headers and hardening

Do not flood the review with low-severity nits if there are critical vulnerabilities.
A single SQL injection outweighs a hundred missing CSP headers.

## Approval Bar

Do not approve merely because behavior seems correct.
The bar for approval is:

- no exploitable vulnerability in the diff
- no secrets in source control
- no missing auth/authz on exposed endpoints
- no injection vectors from unsanitized input
- no outdated cryptographic primitives
- no information leakage in error responses
- no obvious attack surface that the architecture makes hard to defend

Treat these as presumptive blockers:

- any form of injection (SQL, shell, HTML, path, LDAP)
- any hardcoded secret or credential
- any endpoint that skips authorization
- any crypto using MD5, SHA1, ECB mode, or insufficient key size
- any error response that includes stack traces in production
- any user input that reaches a dangerous function without validation
