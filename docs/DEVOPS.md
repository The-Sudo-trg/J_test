# CI/CD, Deployment, and Observability Runbook

## Current deployment shape

The repository contains four independently deployable Vite static sites. Deploy the customer, seller, admin, and delivery applications as separate projects/services. Each application has its own lockfile and build output in `dist/`.

Static sites can run on Vercel, Cloudflare Pages, or Render Static Sites. Configure each project with its relevant `frontend/*-app` directory as the root, `npm ci && npm run build` as build command, and `dist` as output/publish directory.

## Environments and promotion

| Environment | Source | Deployment rule |
|---|---|---|
| Development | feature branch | Preview deployment after successful CI. |
| Staging | protected `main` branch | Automatic deploy after all checks and smoke tests. |
| Production | signed/tagged release | Manual approval after staging validation. |

Use immutable deployment artifacts. Roll back by redeploying the last known-good artifact/version; do not rebuild an old commit during an incident.

## GitHub Actions CI

Create `.github/workflows/ci.yml` with the following content:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main, ui-refactor]

permissions:
  contents: read

jobs:
  build:
    name: Build ${{ matrix.app }}
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        app:
          - frontend/customer-app
          - frontend/seller-app
          - frontend/admin-app
          - frontend/delivery-app
    defaults:
      run:
        working-directory: ${{ matrix.app }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: ${{ matrix.app }}/package-lock.json
      - run: npm ci
      - run: npm run build
      - run: npm audit --omit=dev --audit-level=high
      - uses: actions/upload-artifact@v4
        with:
          name: ${{ replace(matrix.app, '/', '-') }}-dist
          path: ${{ matrix.app }}/dist
          if-no-files-found: error
```

Before making test/lint jobs required, add `test`, `lint`, and `format:check` scripts and their dependencies to every app. Then add these CI steps before build:

```yaml
      - run: npm run format:check
      - run: npm run lint
      - run: npm test
```

## Render blueprint example

Save this as `render.yaml` when using Render:

```yaml
services:
  - type: web
    name: justto-customer
    runtime: static
    rootDir: frontend/customer-app
    buildCommand: npm ci && npm run build
    staticPublishPath: ./dist
  - type: web
    name: justto-seller
    runtime: static
    rootDir: frontend/seller-app
    buildCommand: npm ci && npm run build
    staticPublishPath: ./dist
  - type: web
    name: justto-admin
    runtime: static
    rootDir: frontend/admin-app
    buildCommand: npm ci && npm run build
    staticPublishPath: ./dist
  - type: web
    name: justto-delivery
    runtime: static
    rootDir: frontend/delivery-app
    buildCommand: npm ci && npm run build
    staticPublishPath: ./dist
```

## Secrets and configuration

Use `.env.example` for non-secret documented configuration and deployment-provider environment variables for actual values. `VITE_*` variables are public browser configuration; never place secrets in them.

For the future backend, store credentials in GitHub Environment secrets plus the deployment provider's secret manager. Separate staging and production secrets, rotate regularly, and give CI only the minimum permissions needed for its environment.

## Observability

### Frontend

- Capture client exceptions, release version, route, and sanitized API failure context in Sentry or an equivalent service.
- Collect Core Web Vitals and browser performance metrics.
- Tag telemetry by environment and deployment revision.

### Future backend

- Emit structured JSON logs containing `request_id`, `order_id`, `store_id`, actor role, and release version.
- Export request count, error rate, p50/p95/p99 latency, checkout failures, payment-webhook failures, stock conflicts, queue lag, and resource saturation.
- Trace checkout through stock reservation, payment, dispatch, and notification operations using OpenTelemetry.

### Alerts

- Checkout/order transition failures above 1% for five minutes.
- API p95 latency above 500 ms.
- Failed production deployment or failed post-deploy smoke check.
- Payment webhook failures or growing webhook/dispatch backlog.
- Database, Redis, or worker saturation.
- Sudden client-error increase after a release.

## Production backend readiness

When a Rust backend is added, include a multi-stage Dockerfile, database migration step, health/readiness endpoints, and an OpenAPI contract. Run `cargo fmt --check`, `cargo clippy -- -D warnings`, `cargo test`, dependency auditing, container scanning, integration tests with Postgres/Redis, and a staged deployment with automatic health-check rollback.
