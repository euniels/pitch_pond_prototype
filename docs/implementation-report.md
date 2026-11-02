# PitchPond pilot-ready implementation report

**Release branch:** `feat/fundability-pilot`

**Application baseline:** `ea6e030`; projection upgrade is on this release branch

**Legacy preservation branch:** `backup/pre-fundability-rebuild-20261011` at `ea889f9`

**Report updated:** 3 November 2026

**Intended production URL:** `https://pitchpondprototype.vercel.app`

## Executive status

The crowdfunding prototype has been rebuilt in this repository as an invitation-only, evidence-first venture-readiness and explainable-matching SaaS product. The implementation is complete at source level and passes the local application test, build, browser, accessibility, performance, dependency, and secret-exposure checks listed below.

Production promotion is **not complete**. The Vercel CLI on this workstation is authenticated as `gershancg-8358` in `Gershan Carl Guerrero Bon's projects`; that team does not contain the `pitchpondprototype` project, and this repository has no `.vercel/project.json`. The GitHub remote also rejects this account with HTTP 403. Creating a different Vercel project would break the requirement to preserve the existing project identity and URL, so no unrelated project has been overwritten.

The Supabase staging and production projects and the live OpenAI, attachment-scanner, Resend, SMTP, and operational credentials are also not available in this workspace. Consequently, cloud database migrations, pgTAP against the target databases, real invitation email, real scanning, real AI, and authenticated production acceptance journeys remain release gates. Feature flags default to safe values: uploads and AI are disabled until those integrations pass acceptance.

The AI-assisted Goal Attainment Likelihood upgrade is documented in full in `docs/projection-upgrade-report.md`. It adds the authenticated deterministic projection engine, evidence staging, immutable runs, indexed/exact sharing, investor/institution views, projection AI explanation contract, scheduled refresh, deep-pond dark default, and updated validation evidence. Where this earlier report describes the prior public scenario prototype, the projection upgrade report is authoritative.

## Scope delivered

### Product boundary

PitchPond now supports fundability preparation, evidence governance, deterministic compatibility, cohort review, and consented introductions. It does not:

- execute investments or securities transactions;
- hold, transfer, or escrow funds;
- process checkout or subscription payments;
- sell placement or change scores based on a plan;
- operate a public venture directory;
- predict fundraising success or give investment advice.

The tracked Laravel, PayMongo, crowdfunding, pledge, reward, equity, and fundraising-total implementation was removed from the active branch after preservation on the backup branch. Regression checks search rendered public pages for retired language.

### Public experience

The public site is a responsive, professional PitchPond experience centered on “Fundability before fundraising.” It uses the deck-inspired deep-ocean navy, aqua, green, lime, light, pond, and network visual system. The mark, wordmark, favicon, generated Open Graph image, sitemap, and robots metadata are code-owned and reusable.

Implemented routes:

| Route | Purpose |
| --- | --- |
| `/` | Product proposition, pilot objectives, trust boundaries, and role entry points |
| `/how-it-works` | End-to-end founder-to-introduction workflow |
| `/founder-studio` | Founder value proposition and nine-dimension workflow |
| `/evidence-vault` | Private evidence lifecycle and permission model |
| `/matching` | Deterministic matching and Blind First Look explanation |
| `/intelligence` | Interactive synthetic Goal Attainment Likelihood, forecast bands, confidence, scenarios, and future entrepreneurship pathways |
| `/institutions` | Cohort, review, introduction, and measurement proposition |
| `/pricing` | Indicative pilot plans without checkout |
| `/pilot` | Pilot eligibility and application form |
| `/demo` | Interactive product tour and filterable eight-venture sandbox with clearly synthetic data |
| `/responsible-ai` | AI purpose, consent, logging, limitations, and human-control statement |
| `/privacy` | Pilot privacy notice and data-control explanation |
| `/terms` | Pilot terms and explicit non-investment boundary |
| `/accessibility` | Accessibility commitment and support guidance |
| `/sign-in` | Invitation-only authentication entry point |

The pricing presentation includes Free Founder, indicative Founder Pro at PHP 499–999/month, Pitch Readiness Sprint, indicative Institutional Pilot at PHP 25,000–75,000, and free invited investor/mentor access. There is no checkout. Public proof points are explicitly labeled pilot objectives: 15–20 founders, 3–5 qualified introductions, one institutional partner, and no paid influence on scoring.

All principal public copy is centralized in `apps/web/src/lib/content.ts` for future localization. The initial release is English-complete, uses `en-PH`, emphasizes CALABARZON, and permits nationwide Philippine regions.

The homepage and `/demo` now include a clearly labeled sample-data environment representing eight fictional Philippine businesses across climate tech, circular economy, health, education, agriculture, and enterprise software. It supports combined search, sector, region, stage, and readiness filters; four sort modes; session-only saved records; three-venture comparison; and a Blind First Look control that redacts identity cues consistently. Each synthetic detail view has dedicated Overview, Readiness, Evidence, and Milestones tabs with deterministic factor points, nine readiness workflow states, fictional document metadata, business-model context, funding needs, gaps, and impact goals. The records live in `apps/web/src/lib/sample-ventures.ts`, remain separate from Supabase data, and cannot enter authenticated workflows.

The How It Works page includes an accessible native disclosure FAQ covering product boundaries, readiness, matching, Blind First Look, evidence, and AI. This carries forward the useful question-and-answer interaction of the legacy prototype without restoring its retired transactional concepts.

### Venture intelligence and future pathways

The `/intelligence` experience adds a deterministic scenario lab for the eight synthetic ventures. Users can select a 6-, 12-, 18-, or 24-month horizon; apply cautious, baseline, or accelerated operating assumptions; or directly adjust readiness-work pace, new-evidence cadence, and milestone reliability. The output displays a central readiness trajectory, an uncertainty band, evidence growth, estimated verified checkpoints, and an evidence-base label. Founder and investor/mentor perspectives explain the same result differently while leaving the venture’s current compatibility score unchanged.

The lab never calculates a survival probability, fundraising probability, investment return, valuation, or investment verdict. Its public “AI-assisted interpretation” is explicitly a synthetic template with no model call. In the authenticated product, any future AI narrative remains advisory and separate from the deterministic projection.

Two longer-term concepts are represented as future validation pathways rather than active services:

- ready-to-operate microbusiness systems, covering operator fit, package evidence, permits, training, assumptions, launch readiness, and operating measurement;
- SME continuity and ownership transfer, covering owner preparation, anonymized screening, controlled diligence, professional advice, transition milestones, and post-transfer support.

Both reuse the evidence, readiness, permissions, matching, consent, and audit foundations. Neither currently lists businesses, sells packages, intermediates a sale, holds money, executes a transfer, or guarantees income.

An accessible header toggle provides light and dark themes. Dark is the first-visit default and the selection persists only in local browser storage. It is applied before first paint under the nonce-based Content Security Policy and is covered by desktop/mobile persistence and axe checks. Responsive rules include wide-screen, tablet, phone, narrow-phone, landscape, coarse-pointer, reduced-motion, and increased-contrast behavior.

### Authentication and memberships

- Supabase Auth uses cookie-based server sessions and magic links.
- Public self-registration is not part of the product; an unexpired, single-use invitation is required.
- One person can hold founder, investor/mentor, institution reviewer, institution manager, and platform administrator memberships.
- Invite acceptance records the user, organization, role, inviter, acceptance time, and immutable audit event.
- Workspace routes are coarsely protected in `proxy.ts`, then re-authorized in every Server Action and Route Handler.
- Institution managers and platform administrators require Supabase AAL2/TOTP MFA, enforced in the UI/action layer and RLS predicates.

### Founder workspace

The Founder Studio includes:

- venture name, summary, sector, stage, region, city/municipality, funding range, traction level, impact goals, risk level, and explicit matching consent;
- nine readiness dimensions: problem, market, solution, traction, team, business model, use of funds, financial readiness, and legal/business readiness;
- objective states: Not started, In progress, Evidence linked, and Reviewed;
- dimension summaries, active claims, milestones, evidence links, reviewer approval, and automatic immutable readiness snapshots;
- a Fundability Graph derived from dimension completion, claims, linked clean evidence, milestones, and available match factors—not an opaque success score;
- a private Evidence Vault with upload status, clean-document summary, access grants, revocation, and deletion;
- consented AI readiness-gap suggestions and evidence summaries, which remain editable advisory material;
- introduction and diligence status management;
- JSON account export, venture deletion request, evidence deletion, consent history, and retention support.

A dimension cannot remain Reviewed when its required summary/claim/evidence conditions no longer hold. Database triggers create versioned readiness snapshots when sections, claims, claim links, or evidence state changes.

### Investor and mentor workspace

The supporter workbench includes:

- thesis criteria for sector, stage, ticket range, geography, minimum traction, impact goals, risk tolerance, exclusions, and mentorship-only intent;
- deterministic match refresh using the active versioned rubric;
- factor-by-factor points, reasons, mismatches, eligibility, rubric version, and calculation time;
- Blind First Look, which removes venture name, logo, founder identity/photo, school/employer prestige cues, and exact address while retaining relevant generalized facts;
- explicit, reasoned identity reveal with an immutable audit event;
- save/dismiss controls, private notes, introduction requests, document-access requests, and diligence items;
- an optional AI narrative constrained to the authoritative stored factor breakdown and score.

Compatibility is 100 deterministic points: sector 20, stage 20, funding/ticket overlap 20, traction 15, geography 10, impact 10, and risk 5. Absent founder matching consent and a hard sector exclusion prevent eligibility. Plan, payment, sponsored visibility, and institutional prestige are not inputs and are covered by regression tests.

### Institution workspace

Institution managers and assigned reviewers can:

- create dated cohorts and manage lifecycle status;
- invite founders, reviewers, and mentors through the platform administration flow;
- add consented venture records to cohorts;
- assign reviewers to specific cohort ventures;
- review evidence-backed readiness dimensions;
- coordinate introductions, meeting dates, and outcomes;
- monitor real aggregate completion, evidence coverage, match-to-reveal screening time, match acceptance, introductions, meetings, and recorded outcomes.

No fabricated analytics are displayed. Empty states explain which actual activities will populate each metric.

### Administrator workspace

After AAL2 MFA, a platform administrator can:

- create organizations and role-bound invitations;
- assign manual plan entitlements with optional end dates;
- enable or disable reviewed feature flags;
- inspect versioned matching rubrics and atomically activate a migration-defined rubric whose nonnegative integer weights total 100;
- inspect quarantined/scanning files and reject them, but never override the scanner to mark a file clean;
- see AI-run counts and recent immutable audit events.

Administrative actions cannot silently modify readiness or compatibility results. Existing snapshots retain their original rubric versions and factor breakdowns.

## Evidence, privacy, and retention

- The `evidence` Supabase Storage bucket is private and limited to 10 MB objects.
- Accepted formats are PDF, DOCX, XLSX, CSV, JPEG, and PNG.
- Initiation validates extension, declared MIME, size, ownership, feature state, origin, and rate limit.
- Completion re-checks file size, checksum, detected MIME, extension consistency, database ownership, and scanner result.
- New files enter quarantine. Viewing, parsing, sharing, and AI processing remain blocked until clean.
- Production upload initiation fails closed if the AttachmentScanner-compatible endpoint or token is absent.
- EICAR content is rejected in the local adapter test path.
- Clean supported documents can be text-extracted with extraction status and source-page metadata; extracted content is never publicly exposed.
- Downloads use authorization-checked, 60-second signed URLs. Permanent public object URLs are not generated.
- Document grants are explicit, recipient-specific, expiring, revocable, and optionally tied to an accepted introduction.
- Evidence and venture deletion are soft-delete-first. The bearer-authenticated retention job permanently removes eligible storage objects after the configured period.
- Export returns the requesting user’s profile, memberships, venture and readiness data, evidence metadata, collaborations, thesis, notes, matches, saves, reveals, grants, notifications, consent history, and AI-run metadata. Raw private files are not silently bundled.

## AI contract

The server-side OpenAI Responses API integration defaults to the environment-configured `gpt-6-astra` model. It has four narrow purposes: readiness-gap suggestions, clean-evidence summaries, match-factor narratives, and immutable projection explanations.

Controls include:

- explicit consent and a user action for every run;
- only selected venture fields or clean evidence text;
- uploaded content treated as untrusted data;
- no write-capable model tools;
- strict Zod-backed structured outputs;
- evidence ID verification and rejection of fabricated references;
- authoritative deterministic scores preserved independently of model output;
- advisory labels and deterministic fallbacks for missing configuration, refusal, timeout, incomplete output, provider error, rate limit, or schema failure;
- `ai_runs` metadata containing purpose, model, prompt version, input hash, referenced evidence IDs, status, latency, and usage—not raw sensitive prompts or document text in application logs.

## Data model and access control

The additive migration defines identity/tenancy, founder, matching, institution, collaboration, trust, and measurement records:

- `profiles`, `organizations`, `organization_memberships`, `invitations`, `plans`, `workspace_entitlements`;
- `ventures`, `venture_sections`, `claims`, `evidence_items`, `claim_evidence_links`, `milestones`, `readiness_rubrics`, `readiness_snapshots`;
- `investor_theses`, `matching_rubrics`, `match_snapshots`, `saved_matches`, `review_assignments`, `blind_reveals`;
- `cohorts`, `cohort_ventures`, `reviewer_assignments`;
- `introductions`, `diligence_requests`, `document_access_grants`, `notes`, `notifications`;
- `consent_records`, `ai_runs`, `audit_events`, `product_events`, `feature_flags`, `pilot_applications`, `rate_limit_events`.
- `venture_metrics`, `metric_observations`, `projection_goals`, `goal_evidence_links`, `projection_model_versions`, `projection_runs`, `projection_shares`.

RLS is enabled on every exposed public table. Policies separate venture ownership, assigned reviews, eligible supporter matches, institution cohort scope, introduction participation, and evidence grants. Anonymous access to venture, thesis, evidence, match, audit, and cohort analytics is denied. The service-role client exists only in server modules. Audit records are immutable at the database trigger level.

## Runtime and external interfaces

- Next.js 16.4 App Router and React 19.2;
- React Server Components for authenticated reads;
- Server Actions for form mutations;
- Route Handlers for auth callback, invite flow, upload lifecycle, signed download/delete, AI, pilot applications, exports, deletion, retention, and health;
- nonce-based Content Security Policy, security headers, origin checks, redirect allowlist, authenticated-user rate limiting, and safe text rendering;
- Supabase Auth/Postgres/Storage, OpenAI Responses, Resend, and an AttachmentScanner-compatible adapter;
- Vercel cron definitions for daily retention at 03:00 UTC and stale projection refresh at 04:00 UTC.

The health endpoint reports application readiness without returning secrets. Provider credentials are validated server-side and are never intentionally sent to browser bundles.

## Verification evidence

Completed locally on the release source:

| Check | Result |
| --- | --- |
| Vitest unit suites | 12 files, 62 tests passed |
| ESLint | Passed |
| TypeScript `tsc --noEmit` | Passed |
| Next.js production build | Passed |
| Playwright | 18 tests passed across desktop/mobile projects |
| Responsive overflow | Passed at 320, 375, 768, 1024, and 1440 px |
| Keyboard and automated accessibility | No serious or critical Axe findings |
| Lighthouse homepage production build | Performance 0.91, Accessibility 1.00, Best Practices 0.96, SEO 1.00 |
| Production dependency audit | Blocked: Next.js 16.4.0 has a critical advisory; dedicated security upgrade required before promotion |
| Browser bundle secret scan | No server credential names/values found |
| Staged-diff secret scan | Clear |
| Retired crowdfunding-language check | Clear in active sources and rendered-page assertion |
| `git diff --check` | Clean |

The CI workflow repeats dependency audit, unit, lint, type, build, Playwright, Lighthouse, Supabase setup, and pgTAP RLS tests. The projection pgTAP file adds 27 assertions covering ownership, unrelated and anonymous denial, indexed/exact investor visibility, expiry/revocation, value/date bounds, direction enforcement, and immutable projection/model history.

Not yet executable without external infrastructure:

- pgTAP against the target Supabase databases (local Docker Desktop was unavailable);
- generated database types from an applied staging schema—the checked-in types are a bootstrap contract;
- authenticated staging journeys for each role;
- real email delivery, malware scan, private storage, AI provider, cron, and log-redaction acceptance;
- protected Vercel Preview and production smoke tests.

## Requirement coverage and release gates

| Area | Source status | Production gate |
| --- | --- | --- |
| Public product, brand, policy pages, pricing, pilot form | Implemented and browser-tested | Legal/privacy approval before external onboarding |
| Invite-only multi-role workspaces | Implemented | Supabase Auth URLs, SMTP, seed admin, staging acceptance |
| Founder readiness and Fundability Graph | Implemented | Authenticated acceptance with migrated database |
| Evidence quarantine and grants | Implemented fail-closed | Scanner credentials and adversarial staging tests |
| Deterministic matching and blind review | Implemented and unit-tested | Synthetic end-to-end staging workflow |
| Institution workflow and real analytics | Implemented | Seed cohort/reviewer acceptance |
| Admin governance and AAL2 | Implemented | Admin TOTP enrollment and acceptance |
| AI structured advisory flows | Implemented with fallback | OpenAI key, model availability, consented staging tests |
| RLS and database invariants | Migration and 33 pgTAP assertions present | Run against staging and production candidate |
| Existing Vercel URL deployment | Not promoted | Correct Vercel team/project access and production configuration |

## Deployment blocker and exact handoff

To finish deployment without changing the requested URL, an owner of `pitchpondprototype.vercel.app` must do one of the following:

1. invite the currently authenticated Vercel user to the team/project and grant deployment/configuration access; or
2. sign the Vercel CLI on this workstation into the owning account/team.

Repository push access must also be granted to `gershancg-web` for `euniels/pitch_pond_prototype`, or an owner must push the release branch. Once access exists, follow `docs/user-and-operations-manual.md`, complete every staging gate, and promote the exact validated deployment. Do not create a substitute project, retarget the live alias, or enable AI/uploads before their dependencies pass.
