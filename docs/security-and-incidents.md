# Security and incident response

## Baseline controls

- Production uses HTTPS-only secure cookies, CSRF validation, stateful Sanctum authentication, admin MFA, least-privilege roles, and rate limits.
- Sensitive operational fields are encrypted at the model layer. Raw payment credentials and unnecessary identity documents are never stored.
- PayMongo and Sumsub webhook secrets are kept in a managed secret store. Every webhook is signature-checked, time-bounded, persisted once, and processed idempotently.
- Payout and exceptional refund actions require two different authorized operators before provider release.
- Private uploads use signed URLs, content-type and size allowlists, malware scanning, and a quarantine prefix before they become reviewable.
- Logs must not contain passwords, session cookies, full addresses, identity documents, payment authorization data, or provider secrets.

## Incident severity

- **SEV-1:** confirmed exposure of sensitive data, unauthorized payout, widespread account takeover, or inability to reconcile money.
- **SEV-2:** partial payment or verification outage, exploitable authorization flaw without confirmed abuse, or material queue backlog.
- **SEV-3:** degraded non-critical feature, isolated delivery error, or support-impacting defect.

## Response sequence

1. Acknowledge and name an incident commander.
2. Preserve evidence: request IDs, audit events, deployment version, provider event IDs, and relevant timestamps.
3. Contain: disable the affected feature flag, rotate credentials, revoke sessions, or pause payouts without deleting records.
4. Reconcile affected pledges, payments, refunds, subscriptions, and payouts against provider records.
5. Notify legal/privacy leadership and determine contractual or regulatory notification deadlines.
6. Communicate plainly to affected users; never speculate about unconfirmed scope.
7. Restore from a known-good build or backup, verify totals, and monitor for recurrence.
8. Publish a blameless review with corrective owners and due dates.

## Backup drill

At least quarterly, restore the latest encrypted PostgreSQL backup into an isolated account, verify row totals and foreign keys, replay no external webhooks, and document recovery time and recovery-point results. S3 versioning and object-lock policy must be tested separately.
