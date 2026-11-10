# Controlled deployment and rollback

## Required infrastructure

Create separate Supabase projects in Singapore for staging and production. Disable public sign-up, configure the production site and callback URLs, enable TOTP MFA, and configure custom SMTP. Apply migrations from `supabase/migrations`, then verify the private `evidence` bucket and all RLS policies before adding real users.

Configure these Vercel values separately for Preview and Production: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `ATTACHMENT_SCANNER_ENDPOINT`, `ATTACHMENT_SCANNER_TOKEN`, `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`, `OPERATIONAL_EMAIL`, and `EVIDENCE_RETENTION_DAYS`.

Deploy `services/scanner` as a separate Railway service in `asia-southeast1-eqsg3a` (Singapore). Use the included Dockerfile, mount a persistent volume at `/var/lib/clamav`, expose its HTTPS domain, and set a long random `SCANNER_TOKEN`. Configure the Railway health check as `/health`. The Vercel `ATTACHMENT_SCANNER_ENDPOINT` value is the Railway HTTPS URL plus `/scan`; `ATTACHMENT_SCANNER_TOKEN` must equal the Railway token. The scanner never stores uploaded content and logs only status and duration.

The production application is deployed from `apps/web` as the `pitchpond` project under the authenticated personal Vercel account. Its public alias is `https://pitchpond.vercel.app`. Production evidence uploads fail closed without scanner credentials. Keep `file_uploads`, `ai_assistance`, `venture_projections`, and `projection_ai` disabled until their separate end-to-end acceptance tests pass. Deterministic projections may be enabled while projection AI remains disabled.

The operator running the release must confirm `vercel project inspect pitchpond` resolves to project `prj_2rOYb7qqsmQcXR4hCUi4VJaBnULW` under `gershan-carl-guerrero-bons-projects` before changing settings or aliases. The local Vercel link lives under `apps/web/.vercel` and remains untracked.

## Release checklist

1. Confirm the current production URL contains no real user or payment data.
2. Keep the `backup/pre-fundability-rebuild-20261011` branch and old immutable Vercel deployment.
3. Apply the additive migration to staging, then run `npm run db:types` to replace the checked-in bootstrap types with types generated from that linked project.
4. Deploy the feature branch as a protected Preview.
5. Run unit, scanner, lint, type, production-build, Playwright at 320/375/768/1024/1105/1440 widths, Lighthouse, production dependency audit, secret scan, the complete pgTAP RLS matrix, and scanner clean/EICAR/oversize/authentication checks. Run `supabase/tests/projections.test.sql` against staging and confirm all 27 assertions pass.
6. Complete founder, supporter, institution, and administrator acceptance journeys with synthetic staging accounts. For projections, exercise low-data to data-backed transition, indexed sharing, exact-value grant, expiry, revocation, institutional small-group suppression, and immutable scenario history.
7. Confirm email, signed URLs, projection share reads, revocation, expiry, audit events, MFA, AI refusal/fallback, scheduled projection refresh, and retention jobs. Verify that AI output, plan entitlement, prestige, and compatibility changes do not alter a stored projection percentage.
8. Search rendered content and bundles for retired product language and server-only keys.
9. Apply the same migration to production, promote the exact validated deployment, and preserve the `pitchpond.vercel.app` alias.
10. Smoke-test all public routes plus one controlled workflow per role, then review Vercel and Supabase logs for errors and sensitive values.

## Rollback

Do not roll back the database destructively. Disable new behavior with feature flags, restore the previous immutable Vercel deployment, and leave additive columns/tables in place. If a migration needs correction, ship a new forward migration. Revoke compromised evidence URLs by revoking grants; signed URLs expire within 60 seconds. Set `file_uploads` and `ai_assistance` false during any evidence/AI provider incident. Set `projection_ai` false for projection AI incidents; deterministic saved projections remain available. Set `venture_projections` false only when the calculation, permission, or audit boundary itself is affected. Never delete or rewrite prior projection runs during rollback.
