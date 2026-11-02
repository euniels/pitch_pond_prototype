# PitchPond AI-assisted venture projection upgrade report

**Implementation date:** 3 November 2026  
**Release branch:** `feat/fundability-pilot`  
**Intended production project:** the existing Vercel project serving `pitchpondprototype.vercel.app`  
**Migration:** `20261102000100_venture_projections.sql`

## Executive result

PitchPond now has an authenticated, evidence-backed venture forecasting subsystem at source level. The feature estimates **Goal Attainment Likelihood** for a founder-declared numeric target and due date. It does not calculate company “success odds,” fundraising probability, survival probability, valuation, investment returns, or an investment verdict.

Three values remain deliberately separate throughout the interface and data model:

| Concept | Question answered | Source of truth |
| --- | --- | --- |
| Readiness completion | How much preparation and evidence work is complete? | Nine-dimension readiness workflow |
| Match compatibility | How well does this venture fit this investor thesis? | Versioned deterministic 100-point rubric |
| Goal Attainment Likelihood | How often do simulated paths reach this declared target by its due date? | Versioned deterministic projection engine |

The public `/intelligence` page demonstrates the complete experience with clearly fictional data. Authenticated founder, investor, and institution surfaces are implemented behind disabled-by-default feature flags. Production activation remains conditional on the target Supabase/Vercel environments and provider credentials passing the documented release gates.

## Forecasting contract delivered

The `2026.2` projection engine is server-authoritative and reproducible:

- supports revenue, active customers, retention, gross margin, runway, product/operating milestones, readiness, evidence coverage, and custom numeric goals;
- supports higher-is-better and lower-is-better targets;
- accepts 6-, 12-, 24-, and 36-month presets plus a custom future date;
- normalizes dated observations by metric cadence;
- estimates trend with a Theil-Sen median slope so a single unusual point cannot dominate;
- estimates historical variability with median absolute deviation;
- runs 10,000 paths using a pseudorandom seed derived from the canonical input hash;
- produces identical output for identical input, model version, scenario, and calculation date;
- returns P10, P50, and P90 paths, target likelihood, expected target date, scenario sensitivity, principal drivers, confidence, input coverage, limitations, and model version;
- constrains counts to nonnegative values and percentages to 0–100;
- stores money using decimal-safe normalized values at the database boundary;
- rejects non-finite values, invalid dates, invalid units, impossible bounds, and contradictory goal directions;
- calculates an active-goal portfolio index only when founder weights total exactly 100.

The descriptive result bands are **On track** (70–100%), **Watch closely** (40–69%), and **At risk** (0–39%). No code maps them to invest/do-not-invest or expected return language.

### Evidence stage and confidence

When fewer than three verified observations span at least 60 days, the engine produces an **Assumption-based Scenario Likelihood** using founder-entered growth and variability and marks it low confidence. It never fabricates a time series. The result becomes **Data-backed Likelihood** only after the qualifying history exists.

Data Confidence is calculated separately:

- linked-evidence verification: 30 points;
- observation count: 20 points;
- historical span: 20 points;
- recency: 15 points;
- cadence completeness and consistency: 15 points.

Confidence changes disclosure and uncertainty width, not the underlying observations. Every rendered snapshot includes a “How this was calculated” disclosure covering model version, calculation date, observation coverage, verified span, assumptions, simulation count, and limitations.

## Founder experience delivered

The route `/workspace/founder/projections` provides:

- metric creation with category, unit, direction, cadence, privacy classification, and active state;
- dated actual entry with source, verification state, optional clean-evidence link, and supersession support in the schema;
- goal creation with baseline, target, due date, importance weight, scenario assumptions, and active state;
- optional category-relevant acquisition, retention, burn, milestone-reliability, and evidence-cadence context, explicitly disclosed as narrative/comparison inputs rather than hidden numeric multipliers in model `2026.2`;
- cautious, baseline, and accelerated scenario calculation;
- accessible likelihood gauge and code-owned SVG P10/P50/P90 chart;
- actual-versus-target context, status band, expected date, confidence, drivers, sensitivity, assumptions, and limitations;
- immutable saved runs and input-hash/version disclosure;
- optional strict-schema AI explanation for a selected run;
- indexed or exact-value sharing to an eligible investor with purpose, expiry, and revocation;
- a summary card and direct entry point from Founder Studio.

Invalid or contradictory recalculation does not modify the previous snapshot. Scenario and source-data changes create a new run. Account export includes projection metrics, observations, goals, runs, shares, and relevant AI/audit metadata.

## Investor and institution experience delivered

The investor/mentor workspace reads projection snapshots only through the permission-filtering database interface. It shows indexed data by default: relative progress, trend, bands, confidence, assumptions, evidence freshness, and disclosure. Exact financial values require an exact share tied to an accepted introduction/diligence context. Investors cannot edit founder metrics, observations, goals, assumptions, confidence, or runs.

Blind First Look keeps venture identity cues separate from projection analytics. Compatibility remains independent: projection data does not change the match score or ranking. Views, exact-value access, grant creation, revocation, and expiry-sensitive reads are auditable.

The institution workspace computes projection distributions only from cohort-permitted, explicitly shared venture snapshots. It suppresses groups smaller than three to reduce re-identification risk. Cohort assignment alone does not create blanket access to a founder projection.

## AI assistance delivered

The OpenAI Structured Outputs layer now supports purpose `projection_explanation`. Its strict result contains:

- a plain-language summary;
- positive and negative drivers;
- assumption sensitivity;
- missing or stale data;
- evidence-backed risks;
- recommended next actions;
- reasonable investor questions;
- authorized referenced evidence IDs;
- limitations.

The schema intentionally has no probability output. The request is built from an immutable saved projection, approved metric context, and explicitly selected clean evidence. Exact financial values are indexed/redacted unless the founder expressly consents for that request. Returned evidence IDs are checked against the authorized request. No write-capable model tools are available.

Refusal, timeout, incomplete output, provider outage, rate limit, invalid schema, or fabricated references leave the deterministic projection intact. The run stores purpose, prompt version, model, input hash, authorized evidence IDs, status, latency, and usage without placing raw sensitive financial inputs in application logs.

## Database, authorization, and audit delivered

The additive migration creates:

- `venture_metrics`;
- `metric_observations`;
- `projection_goals`;
- `goal_evidence_links`;
- `projection_model_versions`;
- `projection_runs`;
- `projection_shares`.

RLS and server authorization enforce founder venture membership, explicitly shared unexpired investor access, indexed/exact visibility, accepted-introduction requirements for exact access, cohort-bounded institution access, anonymous denial, and service-role-only privileged operations. Projection runs and model versions are immutable. Activation creates a new model state/audit event and cannot rewrite prior runs.

The controlled shared-projection database function filters exact series at the database boundary and records access. Share creation, revocation, view, and exact-value reveal are audit events. Venture/account deletion and retention behavior include projection records through foreign-key and export contracts.

Feature flags are seeded disabled:

- `venture_projections` controls deterministic authenticated projection workflows;
- `projection_ai` independently controls AI explanation.

This allows deterministic analytics to operate while the AI provider remains disabled.

## Scheduled refresh and interfaces delivered

Interfaces include:

- Server Actions for metrics, observations, goals, shares, and revocation;
- `POST /api/projections/calculate` for authorized deterministic calculation and immutable persistence;
- `POST /api/ai/projection_explanation` through the existing purpose-based AI handler;
- projection records in the controlled account export;
- `/api/cron/projections` at 04:00 UTC in `vercel.json`.

The scheduled refresh checks stale latest runs and recalculates only when authorized source observations changed. If inputs did not change, it records a deduplicated stale notification/event instead of manufacturing a different result.

## Visual and accessibility result

Dark mode is the default when no preference is stored. The deep-pond system uses abyss navy `#020D18`, deep forest `#031A14`, pond green `#06362C`, pine `#0B5B47`, aqua `#35F2DF`, green `#52DF91`, signal lime `#DFFF62`, primary text `#EFFFF7`, and muted text `#A7C9C0`. Light mode remains available and persists locally.

The public projection lab contains a reduced-motion-safe forecast drawing, percentage gauge, P10/P50/P90 chart, scenario comparison, goal/driver/confidence panels, founder/investor perspective switch, synthetic-data label, and non-investment disclosure. Controls are keyboard operable, visualizations have text equivalents, status does not rely only on color, focus remains visible, and the layout has no horizontal overflow at the release breakpoints.

## Validation evidence

Local validation on this source has produced:

- 12 Vitest files / 62 passing tests;
- TypeScript check passed;
- ESLint passed;
- Next.js production build passed;
- 18 Playwright tests passed across desktop and mobile;
- Axe WCAG A/AA/2.1 AA checks passed for the tested public routes;
- responsive overflow checks passed at 320, 375, 768, 1024, and 1440 pixels;
- Lighthouse on the production `/intelligence` build scored 1.00 for performance, accessibility, best practices, and SEO;
- browser-bundle and changed-source scans found no server secret names or credential-shaped values;
- deterministic seeding, horizons, increasing/decreasing goals, staged evidence behavior, percentile ordering, outliers, duplicate/invalid observations, confidence, weights, and forbidden-input isolation covered by unit tests;
- strict AI schema rejection of model-supplied probability covered by unit tests;
- a 27-assertion projection pgTAP suite added for founder/investor/anonymous access, indexed/exact visibility, expiry/revocation, value/date bounds, direction enforcement, and immutable runs/model versions.

The pgTAP suite still requires an applied staging/local Supabase database; Docker Desktop is not running on this workstation and no project is linked. Real email, storage/scanner, OpenAI, cron, MFA, and authenticated multi-user journeys require the provider-connected staging environment and remain production gates.

The 3 November dependency audit also identified a critical advisory affecting the installed Next.js 16.4.0. Zod and Undici were updated to patched versions, but production promotion remains blocked until the dedicated Next.js security upgrade and its full regression pass are complete.

## Deployment status and remaining external gates

The repository is ready for security-upgrade validation and then a protected Preview, but production must not be redirected to a substitute Vercel project. The authenticated Vercel user `gershancg-8358` can see only its personal team and that team does not contain `pitchpondprototype`; this checkout also has no `.vercel/project.json`. Before promotion, an operator must provide access to the Vercel team/project that owns `pitchpondprototype.vercel.app`, configure the project Root Directory as `apps/web`, and supply separate Preview/Production Supabase, OpenAI, scanner, Resend/SMTP, cron, and operational values.

The required sequence is:

1. apply the additive migration to staging and regenerate Supabase TypeScript types;
2. run all application and pgTAP suites against staging;
3. deploy a protected Preview of the existing Vercel project;
4. complete founder, investor, institution, administrator, exact-value, revocation, consent, provider-failure, and privacy acceptance journeys;
5. enable `venture_projections` in staging and validate scheduled refresh;
6. enable `projection_ai` only after its separate privacy/failure gates pass;
7. promote the exact accepted Preview to the existing production alias;
8. retain the previous immutable deployment and roll back with feature flags plus Vercel deployment restoration, never destructive database rollback.

Philippine legal, securities, privacy, and Responsible AI language remains pilot documentation pending counsel and privacy-officer approval.
