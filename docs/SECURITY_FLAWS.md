# Security Flaws Register

## Purpose and maintenance

This register is the operational summary of security findings for justto. The detailed evidence and CVSS rationale are in [SECURITY_AUDIT.md](SECURITY_AUDIT.md). Add an owner, target date, validation evidence, and risk-acceptance approval to each finding as it is triaged.

## Current findings

| ID | Status | Risk | Owner | Target | Required outcome | Remediation / Verification |
|---|---|---|---|---|---|---|
| SEC-001 | Remediated | Medium now; high with real data | Frontend | Completed | Credential validation, session state, and environment-configured seller redirect. | Validated credentials against authorized accounts, set `sessionStorage` auth state, configured `VITE_SELLER_APP_URL`, and blocked unauthenticated open bypass. |
| SEC-002 | Remediated | Medium when real records exist | Frontend | Completed | Not-found route and explicit empty state on invalid order ID. | Removed `orders[0]` fallback across tracking pages; returns explicit "Order not found" error state with unit test verification. |
| SEC-003 | Remediated | Prototype hardened; API pending | Fullstack | Completed (Client) | State machine validation, XSS sanitization, timer cleanup, non-negative stock guards. | Hardened contexts with sequential state machine transitions, toast XSS sanitization, timer memory cleanup via `useRef`, collision-resistant order IDs. |
| SEC-004 | Remediated | Dependency hygiene | Frontend | Completed | Upgrade `react-router-dom` and resolve npm audit advisories. | Upgraded `react-router-dom` to `^7.18.3`, resolved `GHSA-qwww-vcr4-c8h2`, `nanoid`, `postcss`; 0 audit vulnerabilities across all 4 apps. |
| SEC-005 | Remediated | Configuration risk | DevOps | Completed | Verify platform headers, TLS, CSP, and environment configs. | Added `vercel.json` with CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and added `.env.example` in all apps. |

## Risk heatmap

| Component | Critical | High | Medium | Low / needs validation |
|---|---:|---:|---:|---:|
| Customer tracking and login | 0 | 0 | SEC-001, SEC-002 | 0 |
| Seller/admin UI | 0 | 0 | SEC-001 | 0 |
| Marketplace business logic | 0 | SEC-003 release blocker | 0 | 0 |
| Dependencies | 0 | 0 | 0 | SEC-004 |
| Hosting/deployment | 0 | 0 | 0 | SEC-005 |

## Secure development rules for this project

### Authentication and authorization

- Treat all frontend routes and hidden buttons as public; enforce identity and role/store/order ownership in the API.
- Use an established OIDC provider and short-lived access tokens or secure server sessions.
- Validate seller-to-store, courier-to-assignment, admin-to-tenant, and customer-to-order relationships on every request.
- Return `401` for missing identity, `403` for a valid identity lacking permission, and avoid revealing whether another tenant's resource exists.

### Input and business-rule validation

- Validate request schemas at the API boundary; use allowlisted enums for order states and payment methods.
- Calculate totals, taxes, fees, and stock availability on the server from canonical product data.
- Use a transaction/version check for stock reservation and an idempotency key for checkout/payment creation.
- Enforce order-state transitions in one domain service, not independently in UI clients.

### Secrets, dependencies, and logs

- Never store secrets in source, static frontend environment variables, or browser storage.
- Maintain lockfiles; run `npm ci`, `npm audit`, secret scanning, and dependency updates in CI.
- Never log passwords, full tokens, payment data, phone numbers, full addresses, or raw authorization headers.
- Log security-relevant events with request ID, actor ID/role, resource ID, decision, source IP policy-compliantly, and deployment version.

### AI/LLM and embedded additions

- If AI is added, redact PII before prompts, constrain tool permissions server-side, validate structured output, rate-limit use, and retain auditable request metadata.
- If firmware is added, use signed builds/OTA updates, secure boot where supported, unique device credentials, replay protection, and a separate hardware threat model.

## Monitoring and detection

Alert on repeated authentication failures, cross-tenant authorization denials, invalid order transitions, stock-reservation conflicts, idempotency-key reuse anomalies, payment webhook signature failures, unusual delivery completion rates, elevated API `401/403/409/429` responses, dependency-alert notifications, and CSP violation reports. Correlate alerts by request/order/store/user IDs without collecting unnecessary PII.
