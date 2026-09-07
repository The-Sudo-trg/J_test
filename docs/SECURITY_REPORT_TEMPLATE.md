# Security Vulnerability Report Template

> Submit security reports through a restricted channel. Do not attach real credentials, production tokens, customer PII, payment data, or destructive proof-of-concept code.

```md
## Title
[Component] Concise vulnerability title

## Reporter information
Optional name/contact/organization

## Report date
YYYY-MM-DD

## Severity
Critical | High | Medium | Low | Informational

## CVSS v3.1
- Score:
- Vector:
- Metric rationale:

## CVE
None / CVE-style draft / Assigned CVE-ID

## Product information
- Product: justto
- App/component: customer | seller | admin | delivery | API | infrastructure | firmware
- Version, branch, and commit:
- Environment: local | development | staging | production

## Affected component
File path, module, endpoint, service, or firmware version.

## Vulnerability description
### Summary
Two to three sentences.

### Technical detail
Vulnerability type, root cause, prerequisites, attack vector, authentication/authorization state, and safe exploitation explanation.

## Potential impact
- Confidentiality:
- Integrity:
- Availability:
- Business/compliance impact:

## Steps to reproduce
1.
2.
3.

Include exact test URLs, HTTP methods, sanitized headers, request bodies, test account role, and expected versus actual behavior.

## Safe proof of concept
Use non-production data only. Include sanitized commands/code sufficient for engineering to reproduce; avoid payloads that could damage systems or access other users' data.

## Evidence
- Timestamp/timezone:
- Request/correlation IDs:
- Sanitized logs/traces:
- Screenshots/video:
- Relevant deployment version:

## Recommended remediation or mitigation
Specific code/configuration change, compensating controls, and verification test.

## References
CWE, OWASP category, advisory/CVE links, and related tickets.

## Timeline
- Discovered:
- Reported:
- Acknowledged:
- Fixed:
- Verified:
- Disclosed (if applicable):

## Additional notes
Risk assumptions, scope limitations, and suggested follow-up review.
```
