# QA Plan and Test Catalogue

## Objectives

The release standard is correctness of ordering and fulfilment behavior, reliable cross-role workflows, secure handling of customer/order information, good accessibility, and predictable performance under concurrent order traffic.

The current codebase is a frontend prototype, so initial testing must focus on UI behavior and pure business rules. Once an API exists, the P0 suite must exercise server-side authorization, stock reservation, payment, and status transitions.

## Test strategy

| Test level | Coverage |
|---|---|
| Unit | Totals, fee threshold, filtering, cart quantity updates, status-transition rules, radius bounds. |
| Component | Product cards, cart controls, form errors, disabled actions, empty states, accessibility labels. |
| Integration | Frontend with mocked API: checkout, stock availability, seller updates, courier assignment. |
| Contract | OpenAPI request/response and error compatibility between all SPAs and backend. |
| End-to-end | Browser workflow from order placement to delivery, exercised against staging. |
| Performance | Checkout latency, catalogue search, stock reservation conflict behavior, dispatch queue throughput. |
| Security | RBAC, IDOR, input validation, rate limiting, XSS, dependency/secret scanning. |

Recommended tools: Vitest + React Testing Library, Playwright, MSW, ESLint, Prettier, OpenAPI, GitHub CodeQL, Gitleaks, and Dependabot/Renovate. For a future Rust service use `cargo test`, `cargo clippy -- -D warnings`, `cargo audit`, and `cargo deny`.

## Quality gates

- 80% overall line coverage and 90% coverage for checkout, pricing, stock, authorization, and state-transition logic.
- Formatter, lint, tests, production build, and critical E2E journey pass on every pull request.
- No unapproved critical/high dependency vulnerabilities or exposed secrets.
- API checkout p95 under 500 ms excluding third-party payment processing.
- Production checkout/order-transition error rate below 1% and no unhandled browser exceptions introduced by a release.
- Accessibility score of 90 or above for public customer routes.

## Test cases

### Customer catalogue and cart

| ID | Test | Preconditions and steps | Expected result | Priority |
|---|---|---|---|---|
| CUST-001 | Add an available product | Open Browse; add Farm bananas. | Cart has one bananas line, quantity 1, success feedback. | P0 |
| CUST-002 | Increment existing line | Add the same product twice. | One cart line with quantity 2. | P0 |
| CUST-003 | Remove a final line | Decrement a line with quantity 1. | Line disappears and totals become zero. | P0 |
| CUST-004 | Delivery fee threshold | Test baskets totaling ₹298 and ₹299. | Delivery is ₹29 below threshold and ₹0 at/above ₹299. | P0 |
| CUST-005 | Product filters | Search `milk`, filter Dairy, and select a store. | Only matching products are shown. | P1 |
| CUST-006 | Empty filter result | Search for a non-existent product. | Empty state and clear-filter action are available. | P1 |
| CUST-007 | Unavailable product | Mark product unavailable and add it. | Cart is not changed; availability message is shown. | P0 |
| CUST-008 | Quantity exceeds stock | Request more units than available. | Production API rejects request; current prototype must be fixed. | P0 |
| CUST-009 | Mixed store basket | Add products from two stores and start checkout. | Reject or split by store; never assign all lines to first store. | P0 |
| CUST-010 | Hostile/large search input | Use special characters and a very long `q` query parameter. | No crash, XSS, or uncontrolled memory/UI degradation. | P1 |

### Checkout and tracking

| ID | Test | Preconditions and steps | Expected result | Priority |
|---|---|---|---|---|
| ORD-001 | Valid checkout | Submit a valid single-store cart. | Exactly one persistent order and tracking link. | P0 |
| ORD-002 | Empty checkout | Navigate to checkout with empty cart. | Basket-empty state; no order request. | P0 |
| ORD-003 | Double submit | Click Place order repeatedly or retry request. | One order/payment through idempotency key. | P0 |
| ORD-004 | Invalid delivery details | Submit blank/invalid address or phone. | Inline errors and no order creation. | P0 |
| ORD-005 | Payment decline | Mock payment rejection. | No confirmed order; clear retry-safe error. | P0 |
| ORD-006 | Unknown tracking ID | Navigate to `/track/not-real`. | Not-found response; never expose another order. | P0 |
| ORD-007 | Invalid transition | Attempt delivered → packing. | `409` conflict and unchanged state. | P0 |

### Seller, admin, and courier operations

| ID | Test | Preconditions and steps | Expected result | Priority |
|---|---|---|---|---|
| SELL-001 | Seller stock update | Seller changes an owned product. | Correct store record changes with audit trail. | P0 |
| SELL-002 | Stock floor | Reduce a zero-stock product. | Never becomes negative. | P0 |
| SELL-003 | Cross-store data access | Seller requests another store's product. | `403`; no data disclosure. | P0 |
| SELL-004 | Valid lifecycle | Advance new order through every legal state. | Each valid state persists and emits events. | P0 |
| ADMIN-001 | Radius bounds | Set 2/8 km and attempt out-of-range values. | Valid bounds save; invalid inputs reject. | P1 |
| ADMIN-002 | Admin role protection | Use customer/seller credentials on admin endpoint. | `403` or login redirect. | P0 |
| DEL-001 | Offline pickup | Set courier offline; accept a job. | UI disabled and server rejects bypass. | P0 |
| DEL-002 | Courier ownership | Courier B completes Courier A's assigned job. | `403`; no state change. | P0 |
| DEL-003 | Concurrent acceptance | Two couriers accept one ready job. | One succeeds; one receives conflict. | P0 |

## Manual release checklist

- [ ] Browse, search, filter, add, increment, decrement, and remove products.
- [ ] Verify delivery fee below and at ₹299.
- [ ] Verify empty-cart checkout behavior.
- [ ] Verify mixed-store cart behavior.
- [ ] Verify unavailable and out-of-stock product behavior.
- [ ] Verify invalid tracking URL has no fallback disclosure.
- [ ] Verify each role can only see its own permitted orders/data.
- [ ] Verify mobile layout, keyboard focus, visible focus state, labels, and screen-reader names.
- [ ] Verify API/payment error, refresh, and reconnect handling.

## Example unit test

Extract cart math into a pure module such as `src/domain/cart.js`, then test it with Vitest:

```js
import { describe, expect, it } from "vitest";
import { calculateTotals } from "../src/domain/cart";

describe("calculateTotals", () => {
  it("does not charge delivery at the ₹299 threshold", () => {
    expect(calculateTotals([{ price: 299, quantity: 1 }])).toMatchObject({
      subtotal: 299,
      delivery: 0,
      handling: 6,
      total: 305,
    });
  });
});
```

## Example end-to-end test

```js
import { test, expect } from "@playwright/test";

test("customer can add a product and open checkout", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /browse groceries/i }).click();
  await page.getByRole("button", { name: /add farm bananas/i }).click();
  await page.getByRole("link", { name: /basket|cart/i }).click();
  await expect(page.getByText("Farm bananas")).toBeVisible();
});
```
