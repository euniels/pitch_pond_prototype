# Security and privacy operations

- Service-role, OpenAI, Resend, scanner, and cron secrets are server-only. Never expose them through `NEXT_PUBLIC_` variables, browser logs, support exports, or analytics.
- Production uploads are unavailable unless malware scanning is configured. Test the adapter with benign samples, MIME mismatches, oversized files, archive bombs, and EICAR before enabling the flag.
- Product logs must contain stable event IDs and redacted errors, not document text, access tokens, auth links, raw AI prompts, or personal profile fields.
- Review Supabase Auth redirect allowlists, invitation expiry, one-time use, MFA enrollment, membership changes, document grants, and blind reveals during every release.
- Investigate unexpected administrator access, evidence downloads, repeated reveal actions, scanner failures, or rate-limit spikes. Disable the affected flag, preserve audit evidence, revoke grants/sessions, and notify the privacy lead.
- Run the retention endpoint only with `Authorization: Bearer $CRON_SECRET`. Evidence deletion hides a record immediately; the job permanently removes storage after the configured retention period.
- Legal, privacy, Responsible AI, and retention language are pilot drafts until approved by Philippine counsel and the designated privacy officer.
