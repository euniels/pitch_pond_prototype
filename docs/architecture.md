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
