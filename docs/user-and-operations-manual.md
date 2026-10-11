# PitchPond user and operations manual

This manual covers pilot participants, platform operators, deployment, acceptance, incident response, and rollback. It assumes the application has been deployed from `apps/web` and the Supabase migration has been applied.

## 1. Product rules everyone should know

PitchPond helps founders organize evidence, reviewers assess readiness, and supporters understand compatibility. A readiness state measures completed work and evidence coverage. A compatibility score measures fit against a disclosed thesis. Neither predicts investment success.

Do not upload information you are not authorized to share. Do not treat a match, AI suggestion, readiness state, introduction, or reviewer comment as investment, legal, tax, or accounting advice. PitchPond does not accept investments, hold funds, or sell placement.

Evidence is private unless a founder creates an explicit, expiring grant. Identity is hidden in Blind First Look until a supporter supplies a reason and reveals it. Every sensitive reveal or access action may be audited.

## 2. Account access and navigation

### Accept an invitation

1. Open the invitation link sent by PitchPond before its expiry time.
2. Confirm the invited email address and continue through Supabase authentication.
3. Use the emailed magic link in the same browser. Only allow redirects back to the configured PitchPond site.
4. The invitation is consumed once. On success, the workspace shows every role attached to the account.
5. If the link is expired or already used, ask the pilot administrator for a new invitation. Do not forward invitation links.

### Switch between roles

An account may hold several memberships. The workspace navigation exposes only the authorized areas: Founder Studio, Thesis & matches, Cohorts, Administration, and Account security. Opening a hidden route manually does not bypass authorization.

### Enroll in MFA

Institution managers and platform administrators must open **Account security**, start TOTP enrollment, scan the QR code with an authenticator, and verify a current code. Save recovery information using the organization’s approved secure method. Management and administration routes require the resulting AAL2 session.

### Sign out

Use **Sign out** in the workspace. On a shared device, also close the browser. Never share a magic link, invitation token, TOTP seed, recovery code, or signed evidence URL.

## 3. Founder manual

### Create the venture profile

1. Open **Founder Studio**.
2. Enter the venture name, a clear one-line summary, sector, stage, region, and optional city/municipality.
3. Enter the minimum and maximum funding need in Philippine pesos; the maximum must not be lower than the minimum.
4. Select a traction level from 0 to 5 and risk level from 1 to 5.
5. Select applicable impact goals.
6. Enable matching consent only when the venture is ready to appear in eligible supporter matches. This consent shares profile facts for matching; it does not grant document access.
7. Save. Changes affect future match snapshots, not historical calculations.

### Complete the Readiness Map

Work through all nine dimensions: Problem, Market, Solution, Traction, Team, Business model, Use of funds, Financial readiness, and Legal/business readiness.

For each dimension:

1. Add or edit the dimension summary.
2. Add at least one concrete, falsifiable claim.
3. Upload supporting evidence and wait for a clean scan.
4. Link the clean evidence to the relevant claim.
5. Ask the assigned reviewer to review the dimension when applicable.

States are calculated as follows:

- **Not started:** no summary, claim, or linked clean evidence.
- **In progress:** some required work exists, but the dimension is not fully supported.
- **Evidence linked:** summary and claim are complete and at least one linked item is clean.
- **Reviewed:** an assigned reviewer approved a fully supported dimension. Removing required support causes the calculated state to fall back.

The Fundability Graph summarizes these transparent inputs together with milestones and match factors. It is not a probability or score of fundraising success.

### Write useful claims

Choose the dimension and state one fact that evidence can support. Prefer “Twelve paid pilot customers renewed in Q3” over “Customers love us.” Keep one factual proposition per claim. Archive obsolete claims instead of changing their meaning after review.

### Record milestones

Enter a short title, status, and date when known. Use Planned for future work, Achieved for completed work, and Verified only when the relevant evidence exists. Attach evidence where the workflow permits.

### Upload evidence

1. Choose **Upload evidence** and provide a descriptive title and evidence date.
2. Select one PDF, DOCX, XLSX, CSV, JPEG, or PNG file no larger than 10 MB.
3. The file enters quarantine. It cannot be viewed, shared, parsed, or sent to AI while quarantined or scanning.
4. Wait for Ready/Clean. A rejected item shows a safe reason; correct the file and upload a new copy rather than attempting to bypass validation.
5. Link the clean item to one or more claims.

Do not rename an executable or archive to an accepted extension. Extension, MIME type, detected type, size, and checksum are validated. Production upload is intentionally unavailable if malware scanning is not configured.

### Ask for AI assistance

AI controls appear only when the feature is enabled. Review exactly which profile fields or clean evidence item will be sent, provide explicit consent, and start the run. Treat the response as a draft: verify every statement and reference, edit what you keep, and never assume the model reviewed material that was not selected. AI cannot change a readiness state or compatibility score.

### Grant document access

1. Use an active collaboration/introduction and select a clean evidence item.
2. Select the recipient and an expiry time.
3. Create the grant. The recipient receives only the granted item while the grant remains valid.
4. Revoke the grant immediately when it is no longer needed. Previously generated signed links expire within 60 seconds.

### Manage introductions and diligence

Review the requesting supporter, message, and current status. Accept, decline, or cancel within the available controls. After acceptance, respond to diligence items by sharing an appropriate existing evidence item or declining with context. Never upload credentials, full identity documents, or unrelated personal records solely because a requester asks.

### Export or delete data

- **Download JSON export** returns the account’s structured records and evidence metadata after server authorization.
- **Delete evidence** hides the item immediately and queues permanent storage removal under the retention policy.
- **Delete venture** requires explicit confirmation and starts the protected venture-deletion workflow.
- For full account deletion, use the account deletion endpoint/workflow or contact the operator; the request is audited and processed according to the approved retention policy.

## 4. Investor and mentor manual

### Define the thesis

Open **Thesis & matches** and specify sectors, stages, ticket range, regions, minimum traction, impact goals, risk tolerance, hard sector exclusions, and whether the account is mentorship-only. Save the thesis before refreshing matches. Select realistic criteria: hard exclusions make a venture ineligible rather than merely lowering the score.

### Refresh and read matches

Refresh matches to create versioned snapshots from currently consented ventures and the active rubric. Read:

- total score out of 100;
- points and maximum points for every factor;
- explicit reasons and mismatches;
- rubric version and calculation time;
- eligibility state.

The scoring weights are sector 20, stage 20, ticket overlap 20, traction 15, geography 10, impact 10, and risk tolerance 5. A paid plan cannot improve a result.

### Use Blind First Look

Before reveal, assess the venture using sector, generalized region, stage, traction, funding need, readiness, evidence coverage, impact, and factor explanations. Do not attempt to infer protected identity from external searches.

When identity is necessary, choose **Reveal**, enter a meaningful reason, and confirm. The action is permanent for that reviewer/venture pair and creates an audit event. Use revealed information only for the pilot purpose.

### Save, dismiss, and take notes

Save a match for follow-up or dismiss it to manage the workbench. Notes are private to their author. Do not place highly sensitive personal data or unsupported allegations in notes.

### Request an introduction

Send a concise message explaining the intended conversation, relevant thesis, and expected next step. The founder decides whether to accept. An introduction request is not an investment offer or commitment.

### Request evidence and diligence

After an accepted introduction, create a narrowly scoped diligence item with a useful title, description, and due date. Access only documents explicitly granted to you. Do not retain a downloaded copy after the approved purpose and period end; the platform’s expiry cannot recall copies already downloaded.

### Use AI match explanations

The optional narrative explains stored match factors; it does not calculate or alter them. If the prose conflicts with the displayed factor table, the deterministic factor table is authoritative and the issue should be reported.

## 5. Institution reviewer and manager manual

### Manager setup

1. Enroll and verify MFA.
2. Ask the platform administrator to create or confirm the institution organization and membership.
3. Open **Cohorts** and create a cohort with a clear name, dates, and lifecycle status.
4. Invite founders and reviewers through the administrator-controlled invitation workflow.
5. Add founder-supplied venture IDs to the correct cohort.
6. Assign a reviewer to each venture. Assign only staff with a legitimate pilot purpose.

### Reviewer workflow

1. Open the assigned cohort venture.
2. Assess the summary, active claims, and linked clean evidence for a dimension.
3. Confirm that evidence supports the claim and is current enough for the stated purpose.
4. Mark the dimension Reviewed only when the application permits it; the server checks assignment and evidence requirements.
5. Record screening work without adding invented metrics or changing founder facts.

### Pilot analytics

The institution dashboard derives completion, evidence coverage, screening time, match acceptance, introductions, meetings, and outcomes from real product events. Treat small-cohort analytics as operational signals, not generalized investment-performance claims. Do not export or publish participant-level data without the applicable consent and approved privacy basis.

### Introduction coordination

Managers can record meeting dates and outcomes for cohort introductions. Use neutral factual descriptions. The coordination action is audited and does not let a manager change compatibility calculations or founder readiness inputs silently.

## 6. Platform administrator manual

### Daily access rule

Use an individual administrator account with TOTP MFA. Never use the service-role key in a browser or share one admin login. Review recent audit events and operational alerts before making changes.

### Create organizations and invitations

1. Create the organization with the correct type and region.
2. Create an invitation with email, role, and organization. Leaving organization blank creates a role-appropriate workspace on acceptance where supported.
3. Deliver the generated link only through the approved email channel.
4. Replace expired links; never extend or reuse a consumed token in the database.
5. Confirm the new membership and relevant audit event after acceptance.

Use `platform_admin` sparingly. Institution manager and administrator invitees must enroll in MFA before privileged access.

### Assign manual plans

Choose the organization, plan, and optional end date. Plans control pilot entitlements only. Confirm through a regression test or factor comparison that an entitlement change did not affect readiness or matching.

### Operate feature flags

- `file_uploads`: keep disabled until scanner, storage, MIME/checksum, EICAR, grant, expiry, and deletion tests pass in the target environment.
- `ai_assistance`: keep disabled until OpenAI structured output, consent, refusal, timeout, fallback, usage recording, and log-redaction tests pass.
- `blind_reveal`: enable only after reveal authorization and audit events pass.

Disable the relevant flag immediately during a provider or privacy incident.

### Govern rubrics

New rubric definitions are added by reviewed, additive SQL migrations. The UI activates only an existing version. Before activation, independently verify all weights are nonnegative integers totaling 100 and hard exclusions are approved. Activation requires MFA and is audited. Never edit historical match snapshots.

### Handle quarantine

Administrators may reject quarantined files but cannot mark them clean. If scanning is delayed, inspect provider health and correlation identifiers without downloading untrusted content. Do not change database status manually to bypass the adapter.

### Review audit and AI activity

Use audit records for reveals, access grants, invitations, rubric activation, membership, and sensitive actions. Use AI-run metadata to inspect status, latency, model, usage, prompt version, and hashed inputs. Do not expect raw prompts or evidence text in logs; their absence is intentional.

## 7. Deployment manual

### Prerequisites

- owner or deployer access to the existing Vercel project serving `pitchpondprototype.vercel.app`;
- push access to the intended Git repository, or permission to deploy the checked-out source directly;
- separate Singapore-region Supabase staging and production projects;
- OpenAI API key and an available configured model;
- AttachmentScanner-compatible endpoint/token;
- Resend API key, verified sender domain, and Supabase SMTP configuration;
- operational mailbox, cron secret, and approved retention days;
- Philippine legal/privacy approval before inviting external participants.

### Required environment values

Set these independently for Preview and Production:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
OPENAI_MODEL
ATTACHMENT_SCANNER_ENDPOINT
ATTACHMENT_SCANNER_TOKEN
RESEND_API_KEY
EMAIL_FROM
CRON_SECRET
OPERATIONAL_EMAIL
EVIDENCE_RETENTION_DAYS
```

Only the first three values are public by design. Never prefix any other secret with `NEXT_PUBLIC_`. Use a different cron secret and service-role key in each environment.

### Prepare Supabase staging

1. Create the staging project in Singapore and record its project reference securely.
2. Disable public sign-up. Configure Site URL and exact Preview/auth callback allowlist entries.
3. Configure custom SMTP and TOTP MFA.
4. Link the CLI from the repository root and apply `supabase/migrations` with the approved Supabase migration command.
5. Confirm the migration created a private `evidence` bucket, seeded reference plans/rubrics/flags only, enabled RLS on all public tables, and denied anonymous business-data reads.
6. From `apps/web`, run `npm run db:types` and review the generated diff against the applied schema.
7. Run `npx supabase test db`; all 33 assertions must pass.
8. Seed only synthetic staging users/organizations and one MFA-enabled administrator through the approved bootstrap method. Do not copy production personal data.

### Configure and link Vercel safely

1. Run `npx vercel whoami` and `npx vercel teams ls`.
2. Select the team that actually owns `pitchpondprototype.vercel.app`.
3. Run `npx vercel project ls` and confirm the exact project exists before linking.
4. Link this repository to that exact project. Inspect `.vercel/project.json` and verify its organization/project IDs against the Vercel dashboard.
5. In the existing project, set **Root Directory** to `apps/web`. Do not create a replacement project and do not change PioneerPath or another visible project.
6. Add Preview values using the staging providers and Production values using production providers. Environment changes require a new deployment.

### Create and accept a protected Preview

1. Push `feat/fundability-pilot` or deploy the branch to a protected Preview of the existing project.
2. Confirm the Preview uses staging Supabase and staging-only credentials.
3. Run from `apps/web`:

```powershell
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm run test:e2e
npx --yes @lhci/cli@0.15.1 autorun
npm audit --omit=dev --audit-level=high
```

4. Run the database tests from the repository root with the linked staging project/local Supabase test environment.
5. Inspect generated client assets and platform logs for service-role, OpenAI, scanner, Resend, cron, tokens, prompts, evidence text, and personal data.

### Acceptance journeys

Use synthetic accounts and complete every journey:

1. **Authentication:** invite → magic link → membership → multi-role navigation → invite cannot be reused.
2. **Founder:** profile → nine summaries/claims → clean upload → claim link → automatic snapshot → reviewer approval → export.
3. **Evidence abuse:** oversize, extension/MIME mismatch, EICAR, expired URL, revoked grant, unrelated user/IDOR, deleted item, absent scanner.
4. **Matching:** thesis → hard exclusion → consent block → eligible calculation → factor total/version → save/dismiss.
5. **Blind review:** redacted view → reasoned reveal → immutable audit event.
6. **Collaboration:** introduction request → founder acceptance → evidence grant → download → diligence → revoke/expire.
7. **Institution:** cohort → founder/reviewer invite → venture add → assignment → reviewed dimension → meeting/outcome → aggregate metrics.
8. **Admin:** MFA enforcement → plan assignment → feature flag → valid rubric activation → invalid rubric rejection → quarantine rejection → audit view.
9. **AI:** explicit consent → each purpose → valid structured response → fabricated ID rejection → refusal → timeout → rate limit → provider outage fallback.
10. **Data rights:** export → evidence delete → venture delete → account deletion request → retention job.
11. **Accessibility/responsiveness:** keyboard, visible focus, screen reader names/headings, reduced motion, contrast, and widths 320/375/768/1024/1440.

Record tester, time, environment, test data IDs, expected result, actual result, and evidence for every case. Every failure affecting access control, evidence safety, consent, audit integrity, score determinism, or secret exposure blocks promotion.

### Prepare production

1. Verify with the incumbent operator that the current live prototype has no real users, payment records, or funds. Export/preserve anything legitimately required before changing the application.
2. Preserve the current immutable Vercel deployment and the `backup/pre-fundability-rebuild-20261011` branch.
3. Create/configure production Supabase independently; do not clone staging users or evidence.
4. Apply the same reviewed additive migration. Seed reference plans, rubric versions, and feature flags only.
5. Repeat pgTAP and core RLS smoke checks against the production candidate.
6. Configure exact production Site URL, callbacks, SMTP, providers, retention, and secrets.
7. Keep `file_uploads` and `ai_assistance` disabled at first production boot.

### Promote production

1. Promote the exact accepted Preview build in the existing Vercel project.
2. Verify that `https://pitchpondprototype.vercel.app` resolves to that immutable deployment and TLS is valid.
3. Do not redirect or reassign the alias to a new unrelated project.
4. Smoke-test every public route, robots, sitemap, social image, health endpoint, and one controlled workflow per role.
5. Search the live rendered site for crowdfunding, equity-sale, pledge, reward, PayMongo, escrow, fundraising-total, and AI-success-prediction language.
6. Review Vercel, Supabase, email, scanner, and AI logs for errors and redaction.
7. Enable one provider-backed feature at a time only after its production smoke test passes.
8. Record deployment ID, Git commit, migration version, rubric versions, operator, start/end time, smoke results, and rollback target.

## 8. Routine operations

### Daily

- review health, error rate, provider alerts, quarantine age, failed emails, failed AI runs, rate-limit spikes, and recent privileged audit events;
- investigate repeated reveal/download failures without exposing content;
- confirm the retention cron ran with the expected deletion count.

### Weekly during the pilot

- review invitations, memberships, expiring grants, cohort assignments, unresolved diligence, and feature-flag state;
- compare analytics definitions against actual events;
- sample logs for redaction and confirm no sensitive content or secret appears;
- review dependency and platform advisories before scheduled releases.

### Before each release

- use an additive migration and preserve backward compatibility through rollout;
- regenerate database types after applying the migration to staging;
- run the full application, browser, Lighthouse, dependency, secret, pgTAP, IDOR, redirect, injection, scanner, and provider test set;
- obtain the required product, security/privacy, and legal sign-offs;
- identify the exact previous immutable Vercel deployment for rollback.

## 9. Incident response

### Suspected evidence or privacy exposure

1. Disable `file_uploads` and, if relevant, `ai_assistance`.
2. Revoke affected grants, sessions, and credentials; signed links naturally expire within 60 seconds.
3. Preserve immutable audit events, provider correlation IDs, and redacted infrastructure logs.
4. Do not copy evidence content into tickets or chat.
5. Notify the designated privacy/security lead and follow the approved Philippine breach-assessment process.
6. Correct the issue through reviewed code or a forward migration, then repeat adversarial acceptance before re-enabling.

### Provider outage

The UI should show deterministic safe fallbacks. Disable the affected feature if failures are persistent. Matching and readiness calculations must continue without AI. Uploads must remain unavailable when scanning is unavailable; never bypass quarantine.

### Compromised secret

Revoke/rotate it at the provider, update only the affected Vercel environment, redeploy, invalidate sessions or grants when relevant, inspect access logs, and document the incident. Do not commit a replacement secret.

## 10. Rollback

1. Disable newly enabled features using flags when possible.
2. Restore the previous immutable Vercel deployment for the same project/alias.
3. Do not destructively roll back the database. Leave additive tables/columns in place and ship a corrective forward migration.
4. Confirm the restored app can operate safely against the forward-compatible schema.
5. Re-run public and authenticated smoke checks and review logs.
6. Record why rollback occurred, the deployment IDs, affected data/actions, and the corrective plan.

## 11. Troubleshooting

| Symptom | Safe check | Resolution |
| --- | --- | --- |
| Invitation is invalid | Check expiry and accepted time without exposing token | Issue a new invitation |
| Manager/admin redirects to Security | Check current Supabase AAL | Complete TOTP verification |
| Upload control unavailable | Check `file_uploads`, scanner env, and provider health | Configure/test scanner; redeploy; then enable flag |
| File remains quarantined | Check scanner status/correlation ID | Retry through adapter or reject; never mark clean manually |
| Evidence download denied | Check ownership/grant, expiry, revocation, clean status | Create a new explicit grant if appropriate |
| Venture missing from matches | Check founder consent, exclusions, thesis, and visibility | Correct the relevant source fact/consent and refresh |
| AI control unavailable | Check `ai_assistance` and OpenAI config | Complete provider acceptance, redeploy, enable flag |
| AI prose differs from score | Compare stored factor table | Trust deterministic factors; disable/report narrative issue |
| Vercel project not listed | Check authenticated user/team | Stop; sign into or obtain access to the owner team |
| Database types differ | Confirm applied staging migration | Run `npm run db:types`, review, and commit generated output |
| RLS test fails | Preserve failing actor/table/policy context | Block release and fix via forward migration |

## 12. Support handoff template

When reporting a problem, include environment, route, role, timestamp with timezone, visible error/event ID, expected behavior, actual behavior, and reproducible steps. Do not include passwords, magic links, invitation tokens, TOTP data, service keys, signed URLs, raw evidence, or raw AI prompts.

