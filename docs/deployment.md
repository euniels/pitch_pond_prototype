# Controlled deployment and rollback

## Required infrastructure

Create separate Supabase projects in Singapore for staging and production. Disable public sign-up, configure the production site and callback URLs, enable TOTP MFA, and configure custom SMTP. Apply migrations from `supabase/migrations`, then verify the private `evidence` bucket and all RLS policies before adding real users.

Configure these Vercel values separately for Preview and Production: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `ATTACHMENT_SCANNER_ENDPOINT`, `ATTACHMENT_SCANNER_TOKEN`, `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`, `OPERATIONAL_EMAIL`, and `EVIDENCE_RETENTION_DAYS`.

Set the existing `pitchpondprototype` Vercel project Root Directory to `apps/web`. Never create or link over a visually similar project. Production evidence uploads fail closed without scanner credentials. Keep `file_uploads` and `ai_assistance` feature flags disabled until their end-to-end acceptance tests pass.

## Release checklist

1. Confirm the current production URL contains no real user or payment data.
2. Keep the `backup/pre-fundability-rebuild-20261011` branch and old immutable Vercel deployment.
3. Apply the additive migration to staging, then run `npm run db:types` to replace the checked-in bootstrap types with types generated from that linked project.
4. Deploy the feature branch as a protected Preview.
5. Run unit, lint, type, production-build, Playwright at 320/375/768/1024/1440 widths, Lighthouse, production dependency audit, secret scan, the complete pgTAP RLS matrix, and scanner EICAR checks.
6. Complete founder, supporter, institution, and administrator acceptance journeys with synthetic staging accounts.
7. Confirm email, signed URLs, revocation, expiry, audit events, MFA, AI refusal/fallback, and retention jobs.
8. Search rendered content and bundles for retired product language and server-only keys.
9. Apply the same migration to production, promote the exact validated deployment, and preserve the `pitchpondprototype.vercel.app` alias.
10. Smoke-test all public routes plus one controlled workflow per role, then review Vercel and Supabase logs for errors and sensitive values.

## Rollback

Do not roll back the database destructively. Disable new behavior with feature flags, restore the previous immutable Vercel deployment, and leave additive columns/tables in place. If a migration needs correction, ship a new forward migration. Revoke compromised evidence URLs by revoking grants; signed URLs expire within 60 seconds. Set `file_uploads` and `ai_assistance` false during any provider incident.
