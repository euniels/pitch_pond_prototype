# PitchPond

PitchPond is an invitation-only, evidence-first venture-readiness and explainable matching platform for Philippine founders, supporters, and ecosystem institutions. It does not execute investments, hold funds, provide investment advice, or predict fundraising success.

## Product surfaces

- Founder Studio with a nine-dimension Readiness Map, claims, milestones, and Fundability Graph
- Private Evidence Vault with quarantine, malware-scan gating, explicit grants, revocation, and expiring links
- Investor and mentor thesis builder, deterministic compatibility rubric, and Blind First Look
- Institution cohort, reviewer, introduction, and pilot-outcome workflows
- Audited administration for invitations, entitlements, feature flags, AI runs, and file quarantine

## Runtime

The active product is in `apps/web` and uses Next.js 16, React Server Components, Server Actions, Route Handlers, Supabase Auth/Postgres/Storage, OpenAI Responses API, Resend, Zod, Vitest, and Playwright. Database migrations and policies live in `supabase`.

```powershell
Copy-Item .env.example apps/web/.env.local
cd apps/web
npm ci
npm run dev
```

For local Supabase development, install Docker and run `npx supabase start`, then `npx supabase db reset` from the repository root.
After linking staging, run `npm run db:types`; generated types are intentionally refreshed from the applied schema rather than edited by hand.

## Verification

```powershell
npm test
cd apps/web
npm run test:e2e
npx --yes @lhci/cli@0.15.1 autorun
# From the repository root, with local Supabase running:
cd ../..
npx supabase test db
```

## Deployment

Use the existing Vercel project and set its Root Directory to `apps/web`. Configure Preview and Production variables separately. Apply additive Supabase migrations before promoting the corresponding web deployment. Keep the previous Vercel deployment available for rollback.

Production evidence uploads intentionally fail closed unless both attachment-scanner variables are configured. Feature flags for AI and uploads are seeded disabled and should be enabled only after provider acceptance testing.

Legal, privacy, accessibility, and Responsible AI pages are honest pilot-stage documentation and require Philippine counsel and privacy-officer approval before external onboarding.

## Release documentation

- [Implementation report](docs/implementation-report.md) — delivered scope, architecture, validation evidence, requirement coverage, and current release gates.
- [User and operations manual](docs/user-and-operations-manual.md) — role-by-role usage, deployment, acceptance, security operations, incident response, troubleshooting, and rollback.
- [Digital brand system](docs/brand-system.md) — deck-derived logo, palette, composition, typography, motion, and accessibility rules.
