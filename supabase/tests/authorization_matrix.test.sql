begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(21);

-- Stable fixture IDs keep failures readable. All fixture creation happens as the
-- database owner so the assertions exercise policies instead of setup code.
insert into auth.users (id, email, aud, role)
values
  ('10000000-0000-0000-0000-000000000001', 'founder@test.pitchpond.ph', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000002', 'reviewer@test.pitchpond.ph', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000003', 'investor@test.pitchpond.ph', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000004', 'unrelated@test.pitchpond.ph', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000005', 'manager@test.pitchpond.ph', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000006', 'admin@test.pitchpond.ph', 'authenticated', 'authenticated');

insert into public.organizations (id, name, kind, region)
values
  ('20000000-0000-0000-0000-000000000001', 'Founder fixture', 'venture', 'CALABARZON'),
  ('20000000-0000-0000-0000-000000000002', 'Institution fixture', 'institution', 'CALABARZON'),
  ('20000000-0000-0000-0000-000000000003', 'Investor fixture', 'investor', 'National'),
  ('20000000-0000-0000-0000-000000000004', 'Platform fixture', 'platform', 'National');

insert into public.organization_memberships (organization_id, user_id, role)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'founder'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'institution_reviewer'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'investor_mentor'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'institution_manager'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000006', 'platform_admin');

insert into public.ventures (
  id, organization_id, name, tagline, sector, stage, region,
  funding_need_min, funding_need_max, consent_to_match, visibility
)
values (
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'Consent-first venture', 'Fixture only', 'Climate', 'Seed', 'CALABARZON',
  100000, 500000, true, 'matched'
);

insert into public.evidence_items (
  id, venture_id, owner_id, title, file_name, storage_path, mime_type,
  detected_mime_type, extension, size_bytes, sha256, evidence_date,
  status, extraction_status
)
values (
  '40000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'Customer interviews', 'interviews.pdf',
  '10000000-0000-0000-0000-000000000001/30000000-0000-0000-0000-000000000001/interviews.pdf',
  'application/pdf', 'application/pdf', 'pdf', 2048, repeat('a', 64), current_date,
  'ready', 'complete'
);

insert into public.cohorts (id, organization_id, name, status)
values ('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Pilot cohort', 'active');
insert into public.cohort_ventures (cohort_id, venture_id)
values ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001');
insert into public.reviewer_assignments (cohort_id, venture_id, reviewer_id, assigned_by)
values (
  '50000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000005'
);

insert into public.venture_sections (venture_id, dimension, state, content)
values (
  '30000000-0000-0000-0000-000000000001',
  'problem',
  'in_progress',
  '{"summary":"Customer interviews consistently identify this problem."}'
);
insert into public.claims (id, venture_id, created_by, dimension, statement, status)
values (
  '70000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'problem',
  'Interviewed customers repeatedly experience the documented workflow problem.',
  'active'
);
insert into public.claim_evidence_links (claim_id, evidence_id, linked_by)
values (
  '70000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001'
);
select is(
  (select completion_percent from public.readiness_snapshots where venture_id='30000000-0000-0000-0000-000000000001' order by created_at desc limit 1),
  11::smallint,
  'readiness snapshot stores objective field completion'
);
select is(
  (select evidence_coverage_percent from public.readiness_snapshots where venture_id='30000000-0000-0000-0000-000000000001' order by created_at desc limit 1),
  11::smallint,
  'readiness snapshot stores evidence coverage'
);

insert into public.investor_theses (
  id, owner_id, organization_id, sectors, stages, regions,
  ticket_min, ticket_max
)
values (
  '60000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000003',
  array['Climate'], array['Seed'], array['CALABARZON'], 100000, 1000000
);
insert into public.match_snapshots (
  venture_id, thesis_id, reviewer_id, rubric_version,
  compatibility_score, factors, eligible
)
values (
  '30000000-0000-0000-0000-000000000001',
  '60000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000003',
  '2026.1', 90, '{}'::jsonb, true
);

set local role authenticated;

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal1"}', true);
select is((select count(*)::integer from public.ventures), 1, 'founder reads own venture');
select is((select count(*)::integer from public.evidence_items), 1, 'founder reads own evidence');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated","aal":"aal1"}', true);
select is((select count(*)::integer from public.ventures), 1, 'assigned reviewer reads assigned venture');
select is((select count(*)::integer from public.evidence_items), 0, 'assignment alone does not expose evidence');
select lives_ok(
  $$ select public.review_readiness_section('30000000-0000-0000-0000-000000000001','problem') $$,
  'assigned reviewer can review a complete evidence-linked section'
);
select is(
  (select state::text from public.venture_sections where venture_id='30000000-0000-0000-0000-000000000001' and dimension='problem'),
  'reviewed',
  'review state is stored after assigned review'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated","aal":"aal1"}', true);
select is((select count(*)::integer from public.ventures), 1, 'eligible matched investor reads venture');
select is((select count(*)::integer from public.evidence_items), 0, 'match alone does not expose evidence');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000004', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated","aal":"aal1"}', true);
select is((select count(*)::integer from public.ventures), 0, 'unrelated user cannot read venture');
select is((select count(*)::integer from public.evidence_items), 0, 'unrelated user cannot read evidence');

reset role;
insert into public.document_access_grants (
  evidence_id, granted_to, granted_by, expires_at
)
values (
  '40000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000001',
  now() + interval '1 hour'
);
set local role authenticated;
select is((select count(*)::integer from public.evidence_items), 1, 'active explicit grant exposes evidence');

reset role;
update public.document_access_grants set revoked_at=now();
set local role authenticated;
select is((select count(*)::integer from public.evidence_items), 0, 'revoked grant no longer exposes evidence');

reset role;
update public.document_access_grants
set revoked_at=null, created_at=now()-interval '2 hours', expires_at=now()-interval '1 hour';
set local role authenticated;
select is((select count(*)::integer from public.evidence_items), 0, 'expired grant no longer exposes evidence');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000005', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000005","role":"authenticated","aal":"aal1"}', true);
select is((select count(*)::integer from public.ventures), 0, 'institution manager needs MFA for cohort venture access');
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000005","role":"authenticated","aal":"aal2"}', true);
select is((select count(*)::integer from public.ventures), 1, 'institution manager with MFA reads cohort venture');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000006', true);
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000006","role":"authenticated","aal":"aal1"}', true);
select is((select count(*)::integer from public.ventures), 0, 'platform administrator needs MFA for venture data');
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000006","role":"authenticated","aal":"aal2"}', true);
select is((select count(*)::integer from public.ventures), 1, 'platform administrator with MFA reads venture data');

reset role;
set local role anon;
select is((select count(*)::integer from public.ventures), 0, 'anonymous user cannot read ventures');
select is((select count(*)::integer from public.evidence_items), 0, 'anonymous user cannot read evidence');

select * from finish();
rollback;
