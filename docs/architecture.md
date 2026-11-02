# PitchPond pilot architecture

## Boundaries

PitchPond records venture readiness, supporting evidence, explicit supporter criteria, deterministic compatibility, and consented introductions. It does not custody money, execute securities, rank by payment, or predict fundraising success.

The web runtime lives in `apps/web`. Reads use React Server Components. Authenticated mutations use Server Actions where they are form-oriented and Route Handlers for uploads, AI, exports, deletion, auth callbacks, and retention. Every mutation authenticates again on the server; role visibility in the UI is not an access boundary.

## Authorization

Supabase Auth provides cookie-based sessions. PostgreSQL RLS is enabled on every public table. Organization memberships are additive, so one user may hold several roles. Venture ownership, reviewer assignment, eligible match access, and time-bound document grants are separate predicates.

Evidence content is never public. Uploads begin in a private bucket and `quarantined` database state. A server-only completion handler validates declared size, extension, detected MIME type, checksum, ownership, and the scanner response. Parsing and downloads remain blocked until the record is `ready`. Security-managed evidence fields cannot be changed through an end-user session.

Platform audit events are immutable. Identity reveals, grants, invitations, and sensitive operations create audit records. Institution managers and platform administrators require an AAL2 Supabase session, with RLS enforcing AAL2 for manager and administrator access as defense in depth.

## Deterministic product rules

Readiness is checklist completion and evidence coverage across problem, market, solution, traction, team, business model, use of funds, financial readiness, and legal/business readiness.

Compatibility rubrics are immutable, versioned records. The active `2026.1` rubric assigns sector 20, stage 20, ticket overlap 20, traction 15, geography 10, impact 10, and risk tolerance 5. Missing founder consent and hard sector exclusions make a match ineligible. Plans, payment state, sponsored visibility, and organization prestige are not inputs. An MFA-authenticated administrator can atomically activate a migration-defined version; the activation is audited and never rewrites existing snapshots.

AI can suggest readiness gaps, summarize clean evidence, or narrate already-calculated match factors. It cannot change readiness, match scores, eligibility, or publish content. Inputs require consent, outputs use strict schemas, referenced evidence IDs are verified, and only input hashes and operational metadata are retained in `ai_runs`.

## Venture goal projections

Goal Attainment Likelihood is a third, independent product concept. Readiness measures completed preparation, compatibility measures fit against one thesis, and a projection estimates whether one declared numeric goal will be reached by its due date. A projection is never described as company success, survival, fundraising probability, investment return, or an investment verdict.

The server calculation is versioned as `2026.2`. It normalizes verified observations by cadence, estimates trend with a Theil-Sen median slope, estimates variability with median absolute deviation, and runs 10,000 input-hash-seeded paths. Identical authorized inputs therefore reproduce the same result. Increasing and decreasing goals are supported; counts cannot fall below zero, percentages remain in 0-100, and money is normalized to integer minor units at the database boundary. Results contain P10/P50/P90 paths, target likelihood, expected target date, scenario sensitivity, numeric drivers, a confidence score, the input hash, and the model version.

With fewer than three verified observations spanning 60 days, the result is explicitly `assumption_based` and low confidence. It uses founder-entered growth and variability rather than inventing history. A `data_backed` result is available only after the qualifying history exists. Data Confidence is independently derived from evidence verification (30), observation count (20), historical span (20), recency (15), and cadence completeness (15). Confidence changes the disclosure and uncertainty width, not stored actuals.

Projection runs and model versions are immutable. Scenario or input changes create new runs; they never rewrite prior results. A goal portfolio index is the weighted average of active goal likelihoods and is computed only when weights total 100. Plans, organization prestige, compatibility, AI text, and payment state are absent from the numeric calculation contract.

Founders own metrics, observations, goals, and shares through venture membership. Investors receive no projection until an unexpired explicit share exists. Shared payloads are indexed by default. Exact values require `visibility = exact`, an accepted introduction/diligence context, and a separate founder action. Revocation and expiry are checked at read time; view, grant, revoke, and exact access events are audited. Institutions receive venture details only through cohort permission and explicit projection sharing, while aggregates are suppressed below three ventures.

AI purpose `projection_explanation` receives a saved result, authorized metric metadata, and only founder-selected clean evidence. The strict result may explain drivers, risks, sensitivity, missing data, next actions, reasonable investor questions, references, and limitations. It has no probability field and cannot mutate a target, observation, confidence value, projection, readiness state, compatibility result, publication state, or share. Provider failure leaves the deterministic projection intact.

The public `/intelligence` lab uses fictional fixtures and a reduced deterministic browser simulation for responsive interaction. It demonstrates the disclosure, P10/P50/P90 chart, scenarios, goal status, evidence quality, and founder/investor perspectives without reading or writing authenticated records.

Microbusiness launch systems and SME continuity are future bounded contexts, not extensions to the current transaction model. They may reuse identity, evidence, consent, access grants, matching, and audit primitives. Package catalog, supplier verification, operator readiness, owner authority, business assets and obligations, professional diligence, and transition plans require separate schemas, policies, legal review, and pilot gates before implementation. No current table or route executes a sale or ownership transfer.
