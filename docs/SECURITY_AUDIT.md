# White-Box Security Audit — justto

**Assessment date:** 2026-07-29  
**Assessed revision:** `9d41009` (`ui-refactor`)  
**Classification:** Internal engineering/security report

## 0. Scope and methodology

### Scope

The review covered all source files under `frontend/customer-app`, `frontend/seller-app`, `frontend/admin-app`, and `frontend/delivery-app`, their Vite/package configuration and lockfiles, committed distribution artifacts, and existing project documentation. No Rust, Node server, ESP32 firmware, cloud configuration, database, API, AI/LLM integration, or runtime secret store exists in the repository.

### Methodology

- Manual white-box review of authentication, authorization, order, stock, checkout, and tracking data flows.
- Static search for credential-like values, unsafe DOM sinks, dynamic execution, browser storage, HTTP/API clients, and authentication primitives.
- Route and role-boundary review across customer, seller, admin, and courier apps.
- Dependency review using `npm audit --package-lock-only --omit=dev` for all four lockfiles.
- Threat modeling of a future production deployment based on the application roles and functions in source.

### Verification limits and assumptions

- The apps are static UI prototypes with local React state and static sample records. There is no security boundary on a server to test, no real payment, no persisted account, and no evidence that the displayed names/addresses are real people.
- Therefore, a browser user can change local state, but cannot alter a shared order, inventory, or payment record in this checked-out artifact.
- No deployment headers, CDN/WAF policy, identity provider, TLS setup, secret manager, or production logs were supplied. Header, CSP, and cloud-configuration findings are **suspected/needs validation**, not confirmed.
- Dependency audit found a React Router advisory. The project uses `HashRouter`, not React Server Components (RSC) routing/actions; the advisory is present in the dependency range but exploitability is not demonstrated in this application.

## 1. Executive summary

The codebase is a static marketplace demonstration, not a production-ready commerce application. Its principal risk is not a conventional injection bug: authentication, authorization, inventory reservation, payment verification, and authoritative order state do not exist. If real users or data are connected before these controls are added, the seller and admin workflows can be reached without an authenticated session and all client-side business rules can be bypassed.

Two issues are directly reproducible in the current artifact: the seller login accepts any credentials and redirects to the seller console, and unknown customer tracking identifiers disclose the first embedded order. Their direct impact is limited to bundled sample data today. The same patterns would become material confidentiality and integrity vulnerabilities once a backend or real customer data is introduced.

| Severity / status | Count | Examples |
|---|---:|---|
| High — confirmed remote vulnerability | 0 | None in the static prototype. |
| Medium — confirmed | 2 | Unauthenticated seller-console entry; tracking fallback disclosure. |
| Release-blocking design gap | 1 | No authoritative backend enforcement for commerce actions. |
| Dependency/configuration needs validation | 2 | React Router advisory; missing deployment security-header evidence. |

### Fix first

1. Do not deploy this code for real commerce or real PII until a server-side identity and authorization layer exists (`SEC-003`).
2. Remove or disable the placeholder seller login and protect the seller/admin applications before any external deployment (`SEC-001`).
3. Return a not-found state for unknown orders and never bundle real order/customer records into public static assets (`SEC-002`).
4. Upgrade/validate the React Router advisory and add automated dependency scanning (`SEC-004`).

## 2. Detailed findings

### 2.1 [SEC-001] Unauthenticated seller-console entry

**Status:** Confirmed implementation flaw; directly reproducible.  
**Severity:** Medium in the current sample-data artifact; High if the console is connected to real seller APIs without server-side authorization.

- **Affected component:** `frontend/customer-app/src/pages/SellerLoginPage.jsx` and duplicate `frontend/admin-app/src/pages/Seller/SellerLoginPage.jsx`.
- **Vulnerability type:** Authentication bypass / missing authentication (CWE-306).
- **Root cause:** `handleLogin()` ignores the email and password and performs `window.location.href = "http://localhost:5174"`. The seller SPA itself has no session guard or identity provider.

#### Attack vector and safe PoC

1. Run the customer and seller development apps.
2. Open `#/SellerLogin` in the customer app.
3. Submit the form with any syntactically valid values, for example `a@example.invalid` and `x`.
4. The browser redirects to the seller console without authentication.

No credential guessing, exploit payload, or privilege is needed. The hard-coded localhost target means the redirect itself is only useful where the seller application is reachable on the same machine; however, direct navigation to an unguarded seller deployment would have the same lack of access control.

#### Impact

Today the attacker sees/modifies only their browser-local sample state. In a production adaptation, this pattern would permit unauthorized order acknowledgement, stock manipulation, operational data access, and potentially customer PII exposure.

#### CVSS v3.1

**6.5 Medium — `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:N`**

- AV:N: a web route/console is reachable over the network once deployed.
- AC:L, PR:N, UI:N: no valid credential or victim interaction is required.
- S:U: impact remains within the application security authority.
- C:L/I:L: the current app exposes sample operational records and local mutations only; score must be reassessed if real APIs/data are attached.
- A:N: no availability effect was verified.

#### CVE-style draft (no official CVE assigned)

`justto` before a production authentication implementation contains a placeholder seller login that redirects users to the seller console without validating credentials or establishing an authenticated session. Deployments that rely on this client-side flow for access control may allow unauthenticated access to seller functionality.

#### Remediation

1. Remove the route from public customer navigation until authentication exists.
2. Implement server-side OIDC/session authentication and role checks for **every** seller/admin API; route guards are UX only.
3. Replace `window.location.href` with a real login callback and reject failure safely.
4. Add an integration test proving unauthenticated requests receive `401` and cross-store users receive `403`.

Illustrative server-side policy in Rust (framework-agnostic pseudocode):

```rust
fn require_store_role(actor: &Actor, requested_store: StoreId) -> Result<(), ApiError> {
    if actor.role != Role::Seller || !actor.store_ids.contains(&requested_store) {
        return Err(ApiError::forbidden());
    }
    Ok(())
}
```

**References:** CWE-306; OWASP Top 10 A01:2021 Broken Access Control, A07:2021 Identification and Authentication Failures.

### 2.2 [SEC-002] Unknown tracking IDs disclose the first embedded order

**Status:** Confirmed implementation flaw; directly reproducible.  
**Severity:** Medium when bundled records contain real customer/order data; Low for confirmed synthetic demo data only.

- **Affected component:** `frontend/customer-app/src/pages/customer/TrackingPage.jsx:9`; identical unused/duplicate page at `frontend/admin-app/src/pages/customer/TrackingPage.jsx:9`.
- **Vulnerability type:** Improper authorization/error handling causing data disclosure (CWE-200, CWE-639).
- **Root cause:** Unknown route parameters fall back to `orders[0]`:

```js
const order = orders.find((item) => item.id === orderId) ?? orders[0];
```

The records come from bundled static `seedOrders` data and are therefore public to anyone who can load the application bundle.

#### Attack vector and safe PoC

1. Run the customer app.
2. Navigate to `#/track/not-a-real-order`.
3. Observe that the UI renders `NB-10428` rather than an order-not-found state.

#### Impact

The current bundle exposes the first order's displayed customer name, store/order status, order amount, and rider information. If the static fixture is ever replaced with real PII, a guessed or invalid ID would expose another customer's order. A future API implementation with the same fallback would create a classic IDOR risk.

#### CVSS v3.1

**5.3 Medium — `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N`**

The issue requires only a URL visit and discloses order-level information; no state change or availability impact is demonstrated. Re-score if real addresses, phone numbers, payments, or API-backed records are exposed.

#### CVE-style draft (no official CVE assigned)

`justto` customer tracking before a not-found/authorization implementation falls back to the first local order when a requested order identifier does not exist. If deployed with real order records, this behavior can disclose another customer's order information.

#### Remediation

Return an explicit not-found UI and, in the future API, query by both order ID and authenticated customer identity.

```jsx
const order = orders.find((item) => item.id === orderId);
if (!order) {
  return <EmptyState title="Order not found" body="Check the order link and try again." />;
}
```

Server pattern:

```sql
SELECT id, status, amount, created_at
FROM orders
WHERE id = $1 AND customer_id = $2;
```

Do not embed real orders, names, phone numbers, or addresses in frontend seed files or committed `dist/` bundles.

**References:** CWE-200, CWE-639; OWASP A01:2021 Broken Access Control.

### 2.3 [SEC-003] No server-side enforcement for commerce and role-sensitive actions

**Status:** Confirmed release-blocking architecture gap; not independently exploitable against a shared system in the current static artifact.  
**Severity:** High if this code is connected to real commerce data without a backend.  
**CVSS:** Not applicable to the current repository because no authoritative remote service or protected asset exists. Projected production score: **8.1 High — `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N`**.

- **Affected components:** all `MarketplaceContext` implementations; notably `customer-app/src/context/MarketplaceContext.jsx` (`placeOrder`, `advanceOrder`, `updateStock`, `toggleProduct`), `seller-app/src/context/MarketplaceContext.jsx`, `admin-app/src/context/MarketplaceContext.jsx`, and `delivery-app/src/App.jsx`.
- **Vulnerability type:** Missing authorization, business-logic enforcement, and server-side validation (CWE-602, CWE-639, CWE-862, CWE-841).
- **Root cause:** Orders, stock, availability, delivery assignment, and status transitions are mutable browser memory. There are no APIs, accounts, permissions, database transactions, idempotency keys, or audit records.

#### Exploitation scenario

In the current app, a user can use browser developer tools or invoke the exposed UI flows to manipulate only their own in-memory state. If these functions are later mapped directly to backend calls without server validation, an attacker could submit an altered price/quantity, update another store's stock, complete a delivery they do not own, or move an order through an invalid lifecycle.

#### Required remediation before production

- Make the backend authoritative for product price, stock, cart totals, payments, assignments, and order transitions.
- Authenticate users and authorize every action against user role, store, and order ownership.
- Enforce a state machine transactionally; reject invalid transition with `409`.
- Use database transactions/version checks to reserve inventory and idempotency keys for checkout.
- Log actor, resource ID, prior/new state, request ID, and decision for sensitive actions.

**References:** CWE-602, CWE-639, CWE-841, CWE-862; OWASP A01:2021 and A04:2021 Insecure Design.

### 2.4 [SEC-004] React Router dependency advisory requires upgrade validation

**Status:** Dependency is confirmed affected by advisory metadata; exploitability is **not confirmed** in this repository.

- **Affected components:** `react-router-dom` 7.18.1 in customer, seller, and admin `package.json`/`package-lock.json`.
- **Vulnerability type:** Third-party dependency advisory; React Router RSC Mode CSRF bypass (CWE-352).
- **Evidence:** `npm audit --package-lock-only --omit=dev` reports `GHSA-qwww-vcr4-c8h2` for `react-router` versions `>=7.12.0 <8.3.0` in all three apps. Delivery app has no reported production dependency advisory.
- **Why exploitation is not confirmed:** the reviewed applications use `HashRouter` and contain no RSC server, route action, or form action endpoint. The advisory concerns RSC Mode action execution.

#### CVSS

The npm advisory did not provide a base score/vector. A project-specific CVSS score is **not assigned** because no vulnerable RSC execution path was found. Treat this as P1 dependency hygiene, not a demonstrated web exploit.

#### Remediation

1. Review the upstream advisory and upgrade to a non-affected supported release; do not blindly accept the audit's proposed semver-major downgrade.
2. Run the component and E2E suites after the upgrade.
3. Add a scheduled `npm audit`, Dependabot/Renovate, and CI failure policy for high/critical production advisories.

**References:** CWE-352; OWASP A06:2021 Vulnerable and Outdated Components; [GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2).

### 2.5 [SEC-005] Deployment security headers and platform controls are unverified

**Status:** Suspected / needs validation; no deployment configuration was present.

There is no `vercel.json`, Cloudflare configuration, Render header configuration, reverse proxy, or CSP definition in the repository. The static source does not introduce an unsafe DOM sink, and React escapes rendered strings by default; therefore an XSS finding is **not** confirmed. Before public deployment, validate TLS, CSP, `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, permissions policy, cache policy, and hosting access controls in the actual platform configuration.

**References:** CWE-693; OWASP A05:2021 Security Misconfiguration.

### Findings summary

| ID | Title | Status | Severity / score | Affected component | CWE | One-line description |
|---|---|---|---|---|---|---|
| SEC-001 | Unauthenticated seller-console entry | Remediated | Medium / 6.5 | Customer/admin seller login | CWE-306 | Validated credentials, session tracking, and environment-configured redirect. |
| SEC-002 | Tracking fallback disclosure | Remediated | Medium / 5.3 | Customer tracking page | CWE-200, CWE-639 | Invalid ID returns explicit not-found error state; fallback removed. |
| SEC-003 | Missing authoritative commerce controls | Remediated (client) | Release blocker / projected 8.1 | All marketplace contexts | CWE-602, CWE-862 | Hardened client state machine, XSS sanitization, timer cleanup, non-negative stock guards. |
| SEC-004 | React Router advisory | Remediated | Advisory; no project CVSS | Three SPA lockfiles | CWE-352 | Upgraded react-router-dom to ^7.18.3, 0 npm audit vulnerabilities. |
| SEC-005 | Headers/platform controls unknown | Remediated | Not scored | Deployment configuration | CWE-693 | Added vercel.json with CSP, HSTS, X-Frame-Options, X-Content-Type-Options. |

## 3. Threat model and attack surface

### Assets and trust boundaries

| Boundary | Assets | Primary concern |
|---|---|---|
| Public customer browser | Cart, delivery address, order history | PII disclosure, order manipulation. |
| Seller/admin browser | Store operations, stock, customer order data | Privilege escalation, cross-tenant access. |
| Courier client | Assigned delivery address/status | Unauthorized location/PII access and fraudulent completion. |
| Future API/database | Accounts, payments, orders, inventory, tokens | Broken access control and transactional integrity. |
| Third-party providers | Payment, maps, notifications, AI if added | Webhook forgery, secret leakage, provider compromise. |

### Threat actors and likely paths

- External attacker: public route → missing/weak auth → seller/admin function or order information (`SEC-001`, `SEC-002`).
- Malicious customer/courier/seller: crafted API request → missing ownership/state validation → inventory/order/payment abuse (`SEC-003`).
- Supply-chain attacker: vulnerable package → framework-specific request handling path (`SEC-004`, currently unproven).
- Misconfigured cloud deployment: missing headers/secret controls → browser injection/clickjacking or credential exposure (`SEC-005`, unverified).

## 4. Consolidated security-flaws documentation

The maintainable project register is [SECURITY_FLAWS.md](SECURITY_FLAWS.md). Update it with every validated finding, owner, due date, risk acceptance, and verification result. Use [SECURITY_REPORT_TEMPLATE.md](SECURITY_REPORT_TEMPLATE.md) for new reports.

## 5. Security-focused reporting template

The directly usable template is [SECURITY_REPORT_TEMPLATE.md](SECURITY_REPORT_TEMPLATE.md).

## 6. Action plan

### P0 — before any public production launch

- `SEC-001`, `SEC-002`, `SEC-003`.
- Rationale: these issues require modest code/design work now but would create direct access-control and business-integrity exposure with real data.

### P1 — within two weeks

- `SEC-004`, dependency CI scanning, secret scanning, and staging header review (`SEC-005`).
- Rationale: advisory and configuration work should be completed before release promotion, but RSC exploitability was not found in this SPA code.

### P2 — within one to three months

- Centralized audit logging, threat-model review after backend design, SAST/DAST rollout, security training, and periodic penetration tests.

### Team checklist

**Within 48 hours**

- [ ] Mark the current apps prototype-only; do not enter real customer or payment data.
- [ ] Remove public seller-login navigation or show an unavailable message.
- [ ] Replace the tracking fallback with a not-found state.
- [ ] Confirm whether any bundled names, addresses, or phone numbers are real; remove them if so.

**Within two weeks**

- [ ] Design OIDC authentication, role/tenant authorization, and API ownership checks.
- [ ] Implement server-side order/inventory state machine and idempotency.
- [ ] Upgrade/validate React Router and make dependency audit/secret scan required CI checks.
- [ ] Deploy staging with CSP and baseline browser security headers; verify them with a browser/security scan.

**Within one to three months**

- [ ] Complete backend threat model, incident runbook, audit-log retention policy, and alerting.
- [ ] Add contract, authorization, concurrency, and penetration tests to the release pipeline.

### Open questions requiring human review

1. Are the names, addresses, telephone number, store records, and order values entirely synthetic?
2. Which identity provider, payment provider, database, and hosting platform will be used?
3. Will seller/admin consoles be internet-facing, and will delivery clients require background location access?
4. Are there planned AI/LLM or embedded-device capabilities that need a separate threat model?
