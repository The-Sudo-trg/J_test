# Bug Report Template

For suspected security issues, use the dedicated [Security Vulnerability Report Template](SECURITY_REPORT_TEMPLATE.md). Do not include credentials, tokens, customer PII, payment data, or weaponized exploit code in an ordinary issue tracker ticket.

```md
## Title
[Area] Concise description

## Severity
Critical | High | Medium | Low

## Environment
- App: customer | seller | admin | delivery | API
- URL/environment: local | development | staging | production
- Browser/OS or device:
- Node/runtime version:
- Git branch and commit:
- User role / test account:

## Preconditions
Required account, data, feature flags, product IDs, or order IDs.

## Steps to reproduce
1.
2.
3.

## Expected behavior

## Actual behavior

## Evidence
- Timestamp and timezone:
- Request/correlation ID:
- Sanitized browser console/network logs:
- Screenshots or video:
- Relevant backend logs/traces:

## Impact and frequency
Affected users, business impact, and reproduction rate.

## Suspected cause
Optional. Include file, module, or function if known.

## Suggested mitigation/fix
Optional.

## Regression
Yes/No. Last known good release, if known.
```

## Severity guide

| Severity | Definition | Example |
|---|---|---|
| Critical | Security breach, data loss, payment/order corruption, or total service outage. | One customer can access another customer's order or payment data. |
| High | Core flow unavailable or materially incorrect with no reasonable workaround. | Checkout creates duplicate orders. |
| Medium | Important function degraded with a workaround. | Seller stock screen fails to update until reload. |
| Low | Minor visual, copy, or non-blocking usability defect. | Misaligned icon in a desktop-only view. |
