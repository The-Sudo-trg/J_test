# J_test

# justto Marketplace

`justto` is a multi-app frontend platform for a hyperlocal grocery marketplace. It consists of four integrated React applications:

- **Customer App** (`/`): Discover local stores, browse groceries, basket/cart, checkout, and live order tracking.
- **Seller App** (`/seller`): Store activity, live order queue, inventory & stock management.
- **Admin App** (`/admin` or `/ops`): Central operations control, store directory, delivery zones, and analytics.
- **Delivery Partner App** (`/delivery`): Real-time job queue, active delivery route, and status updates.

---

## 🚀 Production Deployment on Vercel

This repository is pre-configured with unified multi-app routing and enterprise security headers (`Content-Security-Policy`, `HSTS`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).

### Option 1: Monorepo Deployment (All Apps on One Domain)
Deploy directly on Vercel with zero extra configuration. `vercel.json` and `scripts/build-all.js` will automatically compile and assemble all 4 applications into a unified production distribution:

| Application | URL Route |
|---|---|
| 🛒 **Customer Marketplace** | `/` |
| 🏪 **Seller Console** | `/seller` |
| ⚙️ **Admin Operations** | `/admin` (or `/ops`) |
| 🛵 **Delivery Partner** | `/delivery` |

### Option 2: Deploying Apps Separately
If you want each portal on its own domain/subdomain on Vercel:
1. In Vercel Project Settings, set **Root Directory** to `frontend/customer-app` (or `seller-app`, `admin-app`, `delivery-app`).
2. Add environment variables according to `.env.example` in each folder.

---

## 🛠️ Local Development & Testing

### 1. Unified Local Build & Test
```bash
# Install dependencies across all apps
npm run install:all

# Run automated unit test suite
npm test

# Build all 4 apps into /dist
npm run build
```

### 2. Running Individual Apps Locally
```bash
# Customer App (port 5173)
cd frontend/customer-app && npm run dev

# Seller App (port 5174)
cd frontend/seller-app && npm run dev

# Admin App (port 5175)
cd frontend/admin-app && npm run dev

# Delivery App (port 5176)
cd frontend/delivery-app && npm run dev
```

---

## 🔒 Security Audit & Hardening Status

All vulnerabilities from [`docs/SECURITY_AUDIT.md`](docs/SECURITY_AUDIT.md) are resolved:
- **SEC-001**: Protected seller login with credential validation, session storage, and safe redirects.
- **SEC-002**: Removed tracking data disclosure fallback (explicit 404/not-found UI).
- **SEC-003**: Hardened state machine transitions, toast XSS sanitization, timer leak cleanup, non-negative stock guards.
- **SEC-004**: Upgraded `react-router-dom` to `^7.18.3` (0 npm audit vulnerabilities across all apps).
- **SEC-005**: Configured production security headers and `.env.example` templates.
