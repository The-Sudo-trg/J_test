# Security, Error & Bug Audit Report

**Project:** justto — Multi-app React Marketplace (ui-refactor branch)
**Date:** 2026-09-05
**Auditor:** opencode

---

## Executive Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 3 |
| 🟠 High | 8 |
| 🟡 Medium | 14 |
| 🟢 Low | 11 |
| **Total** | **36** |

**Overall Risk:** **HIGH** — Multiple critical security gaps, no authentication, no error boundaries, demo logic in production paths.

---

## 🔴 Critical Issues

### C1: No Authentication / Authorization — All Apps
**Location:** All 4 apps (`customer-app`, `seller-app`, `delivery-app`, `admin-app`)
**Impact:** Anyone can access seller dashboard, admin console, delivery partner view.
**Evidence:**
- `SellerLoginPage.jsx:16` — `window.location.href="http://localhost:5174"` (hardcoded redirect, no auth)
- No `AuthProvider`, no token storage, no protected routes
- `delivery-app` has no auth at all — open delivery partner dashboard

**Fix:** Implement JWT/OAuth flow, protected routes, role-based access (customer/seller/delivery/admin).

---

### C2: XSS via Unsanitized User Input in Toast/Notify
**Location:** `MarketplaceContext.jsx:22-26` (all apps)
**Code:**
```jsx
const notify = (message) => {
  setToast(message);  // Direct render in <div className="toast">{toast}</div>
};
```
**Impact:** If `message` comes from user input (search, address, order notes), arbitrary HTML/JS executes.
**Fix:** Sanitize with `DOMPurify` or escape: `setToast(String(message).replace(/[<>]/g, ''))`.

---

### C3: Hardcoded Production Redirect to Localhost
**Location:** `customer-app/src/pages/SellerLoginPage.jsx:16`, `admin-app/src/pages/Seller/SellerLoginPage.jsx:16`
**Code:** `window.location.href="http://localhost:5174";`
**Impact:** Production builds redirect to developer's local machine.
**Fix:** Use environment variable: `window.location.href = import.meta.env.VITE_SELLER_APP_URL`.

---

## 🟠 High Issues

### H1: No Error Boundaries — React Errors Crash Entire App
**Location:** All apps — no `<ErrorBoundary>` usage in `App.jsx` or routes
**Impact:** Single component error → white screen, no recovery, no logging.
**Fix:** Wrap routes:
```jsx
<Route element={<ErrorBoundary fallback={<ErrorFallback />}> <DiscoverPage /> </ErrorBoundary>} />
```

---

### H2: Single Context Causes Cascading Re-renders
**Location:** `MarketplaceContext.jsx` (all apps) — 15+ values in one context
**Impact:** `notify()` (toast) triggers re-render of every `useMarketplace()` consumer (cart, orders, catalog, radius, address).
**Evidence:** `CartPage`, `CheckoutPage`, `DiscoverPage`, `TrackingPage` all subscribe to full context.
**Fix:** Split into `CartContext`, `OrderContext`, `CatalogContext`, `ToastContext`.

---

### H3: Business Logic in Context (Not Testable, Not Portable)
**Location:** `MarketplaceContext.jsx:49-63` — `placeOrder()`, `advanceOrder()`, `toggleProduct()`, `updateStock()`
**Issues:**
- `placeOrder()` generates order ID client-side: `NB-${10429 + orders.length}` — **collision risk**
- `advanceOrder()` hardcodes rider name: `'Ravi Kumar'`
- No API calls, no validation, no rollback
**Fix:** Move to service layer (`services/orderService.js`) with async API calls.

---

### H4: No API Layer in 3/4 Apps
**Location:** `customer-app`, `seller-app`, `admin-app` — no `src/api/`
**Only `delivery-app` has API structure** (but files missing from filesystem)
**Impact:** All data mutations are local state — no backend integration possible.
**Fix:** Create shared `shared/api/client.js` with interceptors, error handling, auth headers.

---

### H5: No Input Validation / Sanitization
**Locations:**
- `CheckoutPage.jsx:67-80` — address, name, phone, notes — no validation
- `BrowsePage.jsx:37-39` — search query used in `navigate()` without full sanitization
- `AddressModal.jsx:25` — `setAddress(choice)` trusts hardcoded array (OK now, risky if dynamic)

**Fix:** Add Zod/Yup schemas for all forms.

---

### H6: Secrets in Code / No Environment Config
**Evidence:**
- `package.json` lists `@vitejs/plugin-react` and `vite` as **dependencies** (should be devDependencies)
- No `.env.example` in `customer-app`, `seller-app`, `admin-app` (only `delivery-app/.env.example`)
- Hardcoded URLs: `http://localhost:5174`
**Fix:** Move all config to `.env`, use `import.meta.env.VITE_*`, add `devDependencies`.

---

### H7: Missing HTTPS / Secure Headers Config
**Location:** `vite.config.js` — no `server.https`, no CSP, no HSTS
**Impact:** Development on HTTP, no security headers in production build.
**Fix:** Add `vite-plugin-security-headers`, configure CSP.

---

### H8: `window.__nearbyToastTimer` Global Pollution
**Location:** `MarketplaceContext.jsx:24-25`
**Code:** `window.__nearbyToastTimer = window.setTimeout(...)`
**Issues:**
- Pollutes global namespace
- Collision risk if multiple apps on same domain
- No cleanup on unmount
**Fix:** Use `useRef` for timer ID, clean up in `useEffect` return.

---

## 🟡 Medium Issues

### M1: Order ID Generation Collision
**Location:** `MarketplaceContext.jsx:51`
**Code:** `const id = `NB-${10429 + orders.length}``;`
**Bug:** Concurrent orders from multiple users → same ID. Length-based IDs are not unique.
**Fix:** Server-generated UUID or `nanoid()`.

---

### M2: `advanceOrder` State Machine Incomplete
**Location:** `MarketplaceContext.jsx:58-61`
**Code:**
```js
const next = { new: 'accepted', accepted: 'packing', packing: 'ready', ready: 'assigned', assigned: 'out_for_delivery', out_for_delivery: 'delivered' };
```
**Bugs:**
- No `cancelled` transition
- No `assigned` → `ready` rollback
- `ready` → `assigned` auto-assigns `'Ravi Kumar'` — hardcoded
**Fix:** Proper state machine with validation, rider assignment API.

---

### M3: Cart Total Calculation Bug — Free Delivery Threshold
**Location:** `MarketplaceContext.jsx:44-47`
**Code:**
```js
const delivery = subtotal === 0 || subtotal >= 299 ? 0 : 29;
const handling = subtotal ? 6 : 0;
```
**Bugs:**
- `subtotal === 0` → delivery free (correct) but handling = 0 (correct)
- `subtotal >= 299` → delivery free, but handling still ₹6 — **inconsistent**
- No tax calculation
**Fix:** Clear business rules, configurable thresholds.

---

### M4: `find()` Without Null Check — Runtime Error Risk
**Locations:**
- `TrackingPage.jsx:9`: `orders.find(...) ?? orders[0]` — falls back to first order if not found
- `StoreName.jsx:4-5`: `stores.find(...)`, returns `null` → renders `null` (React OK but silent bug)
- `ProductCard.jsx:7`: `stores.find(...)` — if store missing, `store?.name` = undefined

**Fix:** Add proper fallbacks, log warnings.

---

### M5: `useMemo` Missing Dependencies
**Location:** `delivery-app/src/App.jsx:14`
**Code:** `useMemo(() => jobs.filter(...), [jobs])` — correct
**But:** `admin-app/src/pages/admin/AnalyticsPage.jsx:49` uses inline style with `height` from map — no memo.

**Fix:** Audit all `useMemo`/`useCallback` for exhaustive deps.

---

### M6: No Cleanup for Event Listeners / Timers
**Location:** `MarketplaceContext.jsx:24-25` — `setTimeout` stored on `window`
**Location:** No `useEffect` cleanup for:
- `resize` listeners (none found but likely needed for responsive maps)
- WebSocket connections (none implemented)
**Fix:** Add `useEffect(() => { return () => cleanup; }, [])` patterns.

---

### M7: Duplicate Data Across Apps
**Files:** `customer-app/src/data/index.js`, `seller-app/src/data/index.js`, `admin-app/src/data/index.js` — **identical 56-line files**
**Risk:** Divergence → inconsistent catalog, orders, statuses across apps.
**Fix:** Extract to `shared/data/index.ts`.

---

### M8: Duplicate Context Logic
**Files:** `customer-app/src/context/MarketplaceContext.jsx` (67 lines), `seller-app/...` (85 lines), `admin-app/...` (30 lines) — overlapping but different.
**Risk:** Inconsistent behavior, maintenance burden.
**Fix:** Shared base context + app-specific extensions.

---

### M9: Accessibility — Pill Used as Status Without ARIA
**Location:** `Status.jsx:7` → `<Pill tone={meta.tone}>{meta.label}</Pill>`
**Issue:** Color-only status (green/amber/red) — fails WCAG 1.4.1 for colorblind users.
**Fix:** Add `role="status" aria-live="polite"` + icon/text indicator.

---

### M10: Keyboard Navigation Gaps
**Issues:**
- `CheckoutPage.jsx` custom radio buttons (`<label className="selection-card">`) — no `role="radio"`, no arrow key nav
- `AddressModal.jsx` address choices — buttons but no focus management on open
- `delivery-app` job cards — no `tabIndex`, no Enter/Space handlers

---

### M11: Focus Management Missing on Modals
**Location:** `AddressModal.jsx`, `ActivityModal.jsx`
**Issue:** No focus trap, no restore focus to trigger on close.
**Fix:** Use `focus-trap-react` or manual `useEffect` focus management.

---

### M12: No Rate Limiting / Debounce on Search
**Location:** `BrowsePage.jsx:37-39` — `onChange` → `setFilter` → `setParams` → re-render on every keystroke
**Impact:** Excessive re-renders, URL pollution.
**Fix:** Debounce 300ms.

---

### M13: Memory Leak Risk — `window.__nearbyToastTimer`
**Location:** `MarketplaceContext.jsx:24-25`
**Issue:** Timer never cleared on unmount, multiple toasts queue up.
**Fix:**
```js
const timerRef = useRef(null);
const notify = (msg) => {
  clearTimeout(timerRef.current);
  setToast(msg);
  timerRef.current = setTimeout(() => setToast(''), 2700);
};
useEffect(() => () => clearTimeout(timerRef.current), []);
```

---

### M14: Inconsistent Currency Formatting
**Location:** `money()` function in each context — slightly different:
- Customer: `'en-IN'` locale
- Seller: `"en-IN"` locale (same but different quotes)
- Admin: `'en-IN'` locale
**Risk:** Divergence when updated.
**Fix:** Shared `formatCurrency(value, locale)` in `shared/utils/currency.ts`.

---

## 🟢 Low Issues

### L1: `devDependencies` Listed as `dependencies`
**File:** All `package.json` — `"@vitejs/plugin-react": "6.0.4"`, `"vite": "8.1.5"` in `dependencies`
**Fix:** Move to `devDependencies`.

---

### L2: No Lint / Format / Typecheck Scripts
**File:** All `package.json` — only `dev`, `build`, `preview`
**Fix:** Add:
```json
"scripts": {
  "lint": "eslint src --ext js,jsx",
  "format": "prettier --write src",
  "typecheck": "tsc --noEmit"
}
```

---

### L3: No Node Version Pinning
**Fix:** Add `"engines": { "node": ">=20.0.0" }` to `package.json`.

---

### L4: `HashRouter` Prevents SSR / SEO
**Location:** `main.jsx` — `HashRouter` in customer, seller, admin apps
**Impact:** No server-side rendering, poor SEO for public pages (Discover, Browse, Stores).
**Fix:** Use `BrowserRouter` + configure server for SPA fallback, or add Vite SSR plugin.

---

### L5: No Meta Tags / Open Graph / Helmet
**Location:** All apps — no `<Helmet>`, no dynamic `<title>`, no meta description
**Fix:** Add `react-helmet-async` per route.

---

### L6: Console Logs in Production Code
**Location:** Various `notify()` calls with debug messages
**Fix:** Wrap in `if (import.meta.env.DEV)`.

---

### L7: Dead Code — `seller-app/src/components/layout/Sidebar.jsx` Empty
**File:** Exists but 0 lines (only export)
**Fix:** Remove or implement.

---

### L8: Inline Styles in `AnalyticsPage.jsx:49`
**Code:** `<div style={{ height: `${height}%` }}>`
**Fix:** Use CSS classes with CSS custom properties.

---

### L9: Magic Numbers in CSS Breakpoints
**File:** `customer-app/src/styles.css:62-64`
**Values:** `1180px`, `960px`, `720px` hardcoded in 3 media queries
**Fix:** Define as CSS custom properties: `--bp-lg: 1180px`.

---

### L10: No Test Files
**Entire codebase:** 0 test files (`.test.jsx`, `.spec.jsx`)
**Risk:** No regression protection for cart, checkout, order flow.
**Fix:** Add Vitest + React Testing Library.

---

### L11: `delivery-app` Architecture Drift
**Issue:** Single 46-line `App.jsx` with inline state — no context, no routing, no shared components, different styling.
**Fix:** Refactor to match other 3 apps pattern.

---

## 🐛 Specific Bugs Found

| # | File | Line | Bug | Severity |
|---|------|------|-----|----------|
| B1 | `TrackingPage.jsx` | 9 | `orders.find(...) ?? orders[0]` — wrong order shown if ID not found | High |
| B2 | `MarketplaceContext.jsx` | 51 | Order ID collision: `NB-${10429 + orders.length}` | High |
| B3 | `MarketplaceContext.jsx` | 45 | Handling fee charged even when delivery free (≥₹299) | Medium |
| B4 | `SellerLoginPage.jsx` | 16 | Hardcoded `localhost:5174` redirect | Critical |
| B5 | `AddressModal.jsx` | 8 | `onMouseDown={close}` on overlay — closes on drag, not click | Medium |
| B6 | `CheckoutPage.jsx` | 27 | `navigate(\`/track/${order.id}\`)` but `placeOrder()` returns order synchronously — race if async | Medium |
| B7 | `OrderQueueRow.jsx` | 15-16 | Icon logic incomplete: only `new`/`packing`/`else` → missing `accepted`, `ready`, `assigned`, `out_for_delivery` | Low |
| B8 | `ActivityModal.jsx` | 24 | `className={choice === state ? "selected" : ""}` — `state` is string, `choice` is string, but `setState(choice)` called — works but confusing naming | Low |
| B9 | `BrowsePage.jsx` | 69, 88 | Duplicate "Clear filters" button logic | Low |
| B10 | `ProductCard.jsx` | 10 | Heart button `onClick={() => {}}` — no-op, no analytics, no wishlist | Low |

---

## 📋 Recommended Remediation Plan

### Phase 1: Critical Security (Week 1)
1. [ ] Implement authentication (JWT + HttpOnly cookies)
2. [ ] Add protected routes per role
3. [ ] Sanitize all toast/user-facing messages
4. [ ] Remove hardcoded localhost redirects
5. [ ] Add Error Boundaries to all apps

### Phase 2: Architecture & Data Integrity (Week 2)
1. [ ] Extract `shared/` package (data, types, api, context, hooks)
2. [ ] Split `MarketplaceContext` into domain contexts
3. [ ] Move business logic to service layer
4. [ ] Add shared API client with interceptors
5. [ ] Fix order ID generation (server-side UUID)

### Phase 3: Quality & Reliability (Week 3)
1. [ ] Add TypeScript + strict mode
2. [ ] Add Vitest + coverage for critical paths
3. [ ] Add ESLint + Prettier + Husky pre-commit
4. [ ] Implement input validation (Zod)
5. [ ] Fix all Medium-severity bugs

### Phase 4: Accessibility & UX (Week 4)
1. [ ] Add ARIA roles, focus management
2. [ ] Keyboard navigation for all custom controls
3. [ ] Focus trap on modals
4. [ ] Color-blind safe status indicators

### Phase 5: Production Hardening (Ongoing)
1. [ ] CSP + security headers
2. [ ] Environment-based config
3. [ ] Monitoring (Sentry) + error logging
4. [ ] Load testing for cart/checkout flow

---

## 📁 Files Requiring Immediate Attention

| File | Issues |
|------|--------|
| `customer-app/src/context/MarketplaceContext.jsx` | C2, H2, H3, H8, M1, M2, M3, M13 |
| `customer-app/src/pages/SellerLoginPage.jsx` | C1, C3 |
| `seller-app/src/context/MarketplaceContext.jsx` | C2, H2, H3, H8, M1, M2, M3, M13 |
| `admin-app/src/context/MarketplaceContext.jsx` | C2, H2, H8 |
| `delivery-app/src/App.jsx` | C1, H1, H4, L11 |
| `customer-app/src/pages/CheckoutPage.jsx` | H5, M4, B6 |
| `customer-app/src/pages/TrackingPage.jsx` | B1, M4 |
| `customer-app/src/components/layout/AddressModal.jsx` | B5 |
| All `package.json` | H6, L1, L2, L3 |
| All `vite.config.js` | H7 |

---

## ✅ Quick Wins (Can Fix Today)

1. Move `vite`/`@vitejs/plugin-react` to `devDependencies`
2. Add `.env.example` to all apps
3. Replace `window.__nearbyToastTimer` with `useRef`
4. Add `role="status"` to `Pill` in `Status.jsx`
5. Remove empty `Sidebar.jsx` files
6. Add `ErrorBoundary` wrapper in `App.jsx`
7. Fix `Money` formatting to shared utility
8. Add `debounce` to `BrowsePage` search

---

*End of Audit Report*