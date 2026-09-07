# Project and Architecture Guide

## Product scope

justto models a local-grocery marketplace with four role-specific frontends. The UI demonstrates the expected customer journey (catalogue to delivery), merchant fulfilment workflow, marketplace operations workflow, and courier workflow.

The repository is a UI prototype. It deliberately uses local React state rather than remote services, which means that every browser session starts from seed data and each portal sees a separate version of the marketplace.

## Repository layout

```text
frontend/
  customer-app/
    src/context/MarketplaceContext.jsx   Cart, totals, local order state
    src/data/index.js                    Static stores, products, and seed orders
    src/pages/customer/                  Discover, browse, cart, checkout, tracking
    src/components/                      Layout and customer UI components
  seller-app/
    src/context/MarketplaceContext.jsx   Local seller catalogue and order state
    src/pages/Seller/                    Seller overview, queue, inventory
  admin-app/
    src/context/MarketplaceContext.jsx   Local operations orders and coverage radius
    src/pages/admin/                     Operations, stores, zones, analytics
  delivery-app/
    src/App.jsx                          Local jobs and courier status workflow
docs/                                    Engineering and operational documentation
```

## Runtime architecture today

```text
Customer SPA ─── local context + seed data
Seller SPA ───── local context + seed data
Admin SPA ────── local context + seed data
Delivery SPA ─── local component state + seed data
```

Each application is a Vite build using React 19. Customer, seller, and admin use `react-router-dom` with `HashRouter`; delivery is a single-screen application. The `@` import alias resolves to each app's `src/` directory.

### Important modules

| Module | Responsibility |
|---|---|
| `customer-app/src/context/MarketplaceContext.jsx` | Cart mutation, price totals, local order creation, order progression, local catalogue state. |
| `customer-app/src/pages/customer/BrowsePage.jsx` | URL-query-based product, category, and store filtering. |
| `customer-app/src/pages/customer/CheckoutPage.jsx` | Checkout form and local order placement. |
| `customer-app/src/pages/customer/TrackingPage.jsx` | Order lifecycle/timeline display. |
| `seller-app/src/context/MarketplaceContext.jsx` | Seller order transitions, stock adjustments, and activity state. |
| `seller-app/src/pages/Seller/InventoryPage.jsx` | Inventory search, availability, and stock controls. |
| `admin-app/src/pages/admin/OperationsPage.jsx` | Live-order and zone-health operations dashboard. |
| `admin-app/src/pages/admin/ZonesPage.jsx` | Coverage-radius UI and derived display metrics. |
| `delivery-app/src/App.jsx` | Courier availability, accepting jobs, and delivery completion. |

## Local development

### Requirements

- Node.js 20 LTS or newer
- npm 10 or compatible lockfile support

### Commands

Run these commands from the chosen application directory:

```bash
npm ci
npm run dev
npm run build
npm run preview
```

There is no root workspace script. To work on all portals concurrently, start one Vite development server per portal with separate terminal sessions.

## State model and interface behavior

There are no HTTP interfaces in this repository. The UI contract is provided by `MarketplaceContext` functions.

| Interface | Current input | Current behavior | Production replacement |
|---|---|---|---|
| `addToCart(product)` | Product object | Adds/increments a line unless locally unavailable. | `POST /v1/carts/{id}/items` or client cart state validated at checkout. |
| `updateCart(id, delta)` | Product ID and integer | Increments/decrements line; removes at zero. | Server/cart API with quantity and stock validation. |
| `placeOrder()` | Current local cart | Creates local `NB-*` ID and clears cart. | Idempotent `POST /v1/orders`. |
| `advanceOrder(id)` | Order ID | Advances one fixed local lifecycle state. | Role-authorized state-transition endpoint. |
| `updateStock(id, delta)` | Product ID, integer | Adjusts local stock, bounded at zero. | Transactional inventory mutation with audit log. |
| `toggleProduct(id)` | Product ID | Toggles local availability. | Seller-authorized product availability endpoint. |

The UI lifecycle is:

```text
new → accepted → packing → ready → assigned → out_for_delivery → delivered
```

## Recommended production architecture

```text
Web SPAs / delivery client
          │ HTTPS + OIDC/JWT
          ▼
Rust API gateway / BFF
          ├── PostgreSQL: users, stores, products, carts, orders, payments
          ├── Redis: cache, rate limits, idempotency, short-lived reservations
          ├── Queue/workers: notifications, dispatch, webhooks, analytics
          ├── Payment, maps, SMS/push providers
          └── OpenTelemetry, metrics, logs, error tracking
```

Use a shared OpenAPI contract and generate a typed client for the frontends. Keep authoritative pricing, stock, payments, dispatch, and authorization on the server.

### Minimum API surface

```http
POST /v1/orders
Authorization: Bearer <customer JWT>
Idempotency-Key: <UUID>
Content-Type: application/json

{
  "storeId": "fresh-basket",
  "items": [{"productId": "bananas", "quantity": 2}],
  "deliveryAddressId": "addr_123",
  "paymentMethod": "upi"
}
```

Successful responses should return an opaque server-generated order ID, price breakdown, and current status. Return `400` for malformed input, `401/403` for authentication/authorization failures, `409` for stock/price/state conflicts, `422` for business-rule failures such as mixed-store orders, and `429` for rate limiting.

## Configuration and secrets

No environment variables are currently used. Add an `.env.example` in each frontend before API integration:

```dotenv
VITE_API_BASE_URL=https://api-staging.justto.example
VITE_SENTRY_DSN=
VITE_ENVIRONMENT=staging
```

Only public configuration may use `VITE_*`; Vite embeds it into browser output. Put database passwords, payment credentials, signing keys, API tokens, and webhook secrets only in backend secret stores.

## Security baseline

- Authenticate every user and authorize every API request by role and tenant/store ownership.
- Never trust UI stock, totals, prices, payment state, or order status.
- Use server-side inventory reservation and database transactions.
- Require an idempotency key for order creation and payment requests.
- Store passwords with Argon2id; use short-lived OIDC access tokens and refresh-token rotation.
- Apply request-size limits, schema validation, rate limiting, CSRF controls where cookie auth is used, CSP/security headers, and audit logging.
- Minimize courier access to customer PII and reveal address/phone only for an assigned active delivery.

## Known implementation issues

1. `seller-app/src/pages/index.js` references `./seller/...`, while source files reside under `pages/Seller/`. Normalize case before Linux CI deployment.
2. Customer checkout accepts mixed-store carts, then assigns the entire order to `cart[0].storeId`.
3. Stock is not decremented or reserved on checkout and customers can exceed displayed stock.
4. `placeOrder()` generates IDs from local array length; they can collide after reload or across sessions.
5. Unknown tracking IDs fall back to `orders[0]` in `TrackingPage.jsx` rather than showing not found.
6. The static `dist/` folders should be generated by CI rather than committed release artifacts.
