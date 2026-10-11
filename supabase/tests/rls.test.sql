begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(12);
select ok((select relrowsecurity from pg_class where oid='public.ventures'::regclass),'ventures has RLS');
select ok((select relrowsecurity from pg_class where oid='public.evidence_items'::regclass),'evidence has RLS');
select ok((select relrowsecurity from pg_class where oid='public.investor_theses'::regclass),'theses have RLS');
select ok((select relrowsecurity from pg_class where oid='public.match_snapshots'::regclass),'matches have RLS');
select ok((select relrowsecurity from pg_class where oid='public.audit_events'::regclass),'audit has RLS');
select is(
  (select count(*)::integer from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity),
  0,
  'every public table has RLS'
);
select is((select public.check_rate_limit('rls-test',1,60)),true,'first rate-limit event accepted');
select is((select public.check_rate_limit('rls-test',1,60)),false,'second rate-limit event blocked');
insert into public.audit_events(action,entity_type) values('immutability_test','test');
select throws_ok($$ update public.audit_events set action='tampered' where action='immutability_test' $$,'audit events are immutable','audit events reject update');
select is(
  (select count(*)::integer from pg_policies where schemaname='public' and tablename in ('ventures','evidence_items','investor_theses','match_snapshots','pilot_applications') and 'anon'=any(roles)),
  0,
  'sensitive tables expose no anonymous policies'
);
select is(
  (select count(*)::integer from pg_policies where schemaname='public' and tablename='audit_events' and cmd in ('INSERT','UPDATE','DELETE') and 'authenticated'=any(roles)),
  0,
  'authenticated users cannot forge or mutate audit rows'
);
select is((select public from storage.buckets where id='evidence'),false,'evidence bucket is private');
select * from finish();
rollback;
