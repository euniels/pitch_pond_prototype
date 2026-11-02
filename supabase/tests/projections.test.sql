begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(27);

select ok((select relrowsecurity from pg_class where oid='public.venture_metrics'::regclass),'venture metrics have RLS');
select ok((select relrowsecurity from pg_class where oid='public.metric_observations'::regclass),'metric observations have RLS');
select ok((select relrowsecurity from pg_class where oid='public.projection_goals'::regclass),'projection goals have RLS');
select ok((select relrowsecurity from pg_class where oid='public.projection_runs'::regclass),'projection runs have RLS');
select ok((select relrowsecurity from pg_class where oid='public.projection_shares'::regclass),'projection shares have RLS');

insert into auth.users (id,email,aud,role) values
  ('11000000-0000-0000-0000-000000000001','projection-founder@test.pitchpond.ph','authenticated','authenticated'),
  ('11000000-0000-0000-0000-000000000002','projection-investor@test.pitchpond.ph','authenticated','authenticated'),
  ('11000000-0000-0000-0000-000000000003','projection-unrelated@test.pitchpond.ph','authenticated','authenticated');
insert into public.organizations (id,name,kind,region) values
  ('21000000-0000-0000-0000-000000000001','Projection venture','venture','CALABARZON'),
  ('21000000-0000-0000-0000-000000000002','Projection investor','investor','National');
insert into public.organization_memberships (organization_id,user_id,role) values
  ('21000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000001','founder'),
  ('21000000-0000-0000-0000-000000000002','11000000-0000-0000-0000-000000000002','investor_mentor');
insert into public.ventures (id,organization_id,name,tagline,sector,stage,region,consent_to_match,visibility)
values ('31000000-0000-0000-0000-000000000001','21000000-0000-0000-0000-000000000001','Projection fixture','Evidence-backed projection fixture','Climate','Pilot','CALABARZON',true,'matched');
insert into public.investor_theses (id,owner_id,organization_id,sectors,stages,ticket_min,ticket_max)
values ('61000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000002','21000000-0000-0000-0000-000000000002',array['Climate'],array['Pilot'],100000,1000000);
insert into public.match_snapshots (id,venture_id,thesis_id,reviewer_id,rubric_version,compatibility_score,factors,eligible)
values ('62000000-0000-0000-0000-000000000001','31000000-0000-0000-0000-000000000001','61000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000002','2026.1',88,'[]',true);
insert into public.venture_metrics (id,venture_id,key,name,category,unit,direction,cadence,created_by)
values ('71000000-0000-0000-0000-000000000001','31000000-0000-0000-0000-000000000001','active_customers','Active customers','active_customers','count','increase','monthly','11000000-0000-0000-0000-000000000001');
insert into public.metric_observations (metric_id,venture_id,value,observed_on,created_by)
values ('71000000-0000-0000-0000-000000000001','31000000-0000-0000-0000-000000000001',100,current_date,'11000000-0000-0000-0000-000000000001');
insert into public.projection_goals (id,venture_id,metric_id,label,baseline_value,target_value,weight,target_date,created_by)
values ('72000000-0000-0000-0000-000000000001','31000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000001','Reach two hundred active customers',100,200,100,current_date+365,'11000000-0000-0000-0000-000000000001');
insert into public.projection_runs (
  id,goal_id,venture_id,created_by,model_version,scenario,horizon_months,input_hash,input_kind,
  probability,confidence,status_band,indexed_series,exact_series,drivers,limitations,sensitivity,input_summary,stale_after
) values (
  '73000000-0000-0000-0000-000000000001','72000000-0000-0000-0000-000000000001','31000000-0000-0000-0000-000000000001',
  '11000000-0000-0000-0000-000000000001','2026.2','baseline',12,'1234567890abcdef','data_backed',72,81,'on_track',
  '[{"month":0,"date":"2026-11-01","p10":100,"p50":100,"p90":100}]',
  '[{"month":0,"date":"2026-11-01","p10":100,"p50":100,"p90":100}]','[]','[]','{"cautious":55,"baseline":72,"accelerated":89}','{}',now()+interval '45 days'
);
insert into public.projection_shares (id,run_id,venture_id,recipient_id,shared_by,visibility,match_id,expires_at)
values ('74000000-0000-0000-0000-000000000001','73000000-0000-0000-0000-000000000001','31000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000002','11000000-0000-0000-0000-000000000001','indexed','62000000-0000-0000-0000-000000000001',now()+interval '30 days');

set local role authenticated;
select set_config('request.jwt.claim.sub','11000000-0000-0000-0000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"11000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal1"}',true);
select is((select count(*)::integer from public.venture_metrics),1,'founder reads owned metrics');
select is((select count(*)::integer from public.projection_runs),1,'founder reads immutable owned runs');

select set_config('request.jwt.claim.sub','11000000-0000-0000-0000-000000000002',true);
select set_config('request.jwt.claims','{"sub":"11000000-0000-0000-0000-000000000002","role":"authenticated","aal":"aal1"}',true);
select is((select count(*)::integer from public.venture_metrics),0,'matched investor cannot read raw metrics');
select is((select count(*)::integer from public.projection_runs),0,'matched investor cannot read raw runs');
select is((select count(*)::integer from public.projection_shares),1,'recipient sees active share metadata');
select ok(((public.get_shared_projection('73000000-0000-0000-0000-000000000001')->'indexedSeries') is not null),'recipient receives indexed series through controlled RPC');
select is((public.get_shared_projection('73000000-0000-0000-0000-000000000001')->'exactSeries')::text,'null','indexed share withholds exact series');

select set_config('request.jwt.claim.sub','11000000-0000-0000-0000-000000000003',true);
select set_config('request.jwt.claims','{"sub":"11000000-0000-0000-0000-000000000003","role":"authenticated","aal":"aal1"}',true);
select is((select count(*)::integer from public.projection_shares),0,'unrelated user sees no projection share');
select throws_ok($$ select public.get_shared_projection('73000000-0000-0000-0000-000000000001') $$,'projection share unavailable','unrelated user cannot call shared projection RPC');

reset role;
insert into public.introductions (id,venture_id,thesis_id,requested_by,recipient_id,status,message)
values ('75000000-0000-0000-0000-000000000001','31000000-0000-0000-0000-000000000001','61000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000002','11000000-0000-0000-0000-000000000001','accepted','Accepted projection diligence fixture.');
select lives_ok($$ insert into public.projection_shares (id,run_id,venture_id,recipient_id,shared_by,visibility,introduction_id,expires_at) values ('74000000-0000-0000-0000-000000000002','73000000-0000-0000-0000-000000000001','31000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000002','11000000-0000-0000-0000-000000000001','exact','75000000-0000-0000-0000-000000000001',now()+interval '7 days') $$,'accepted introduction permits an exact-value grant');
set local role authenticated;
select set_config('request.jwt.claim.sub','11000000-0000-0000-0000-000000000002',true);
select set_config('request.jwt.claims','{"sub":"11000000-0000-0000-0000-000000000002","role":"authenticated","aal":"aal1"}',true);
select is(jsonb_typeof(public.get_shared_projection('73000000-0000-0000-0000-000000000001')->'exactSeries'),'array','exact grant exposes exact series through controlled RPC');
reset role;
update public.projection_shares set revoked_at=now() where id='74000000-0000-0000-0000-000000000002';
set local role authenticated;
select is((public.get_shared_projection('73000000-0000-0000-0000-000000000001')->'exactSeries')::text,'null','revoking exact grant immediately falls back to indexed values');
reset role;
update public.projection_shares set created_at=now()-interval '2 days',expires_at=now()-interval '1 day' where id='74000000-0000-0000-0000-000000000001';
set local role authenticated;
select throws_ok($$ select public.get_shared_projection('73000000-0000-0000-0000-000000000001') $$,'projection share unavailable','expired indexed grant removes projection access');

reset role;
select throws_ok($$ update public.projection_runs set probability=99 where id='73000000-0000-0000-0000-000000000001' $$,'projection runs are immutable','saved probability cannot be rewritten');
select throws_ok($$ update public.projection_model_versions set config='{}' where version='2026.2' $$,'projection model configuration is immutable','model configuration cannot be rewritten');
select throws_ok($$ insert into public.metric_observations (metric_id,venture_id,value,observed_on,created_by) values ('71000000-0000-0000-0000-000000000001','31000000-0000-0000-0000-000000000001',120,current_date+1,'11000000-0000-0000-0000-000000000001') $$,'actual observations cannot be future-dated','future actuals are rejected at the database boundary');
select throws_ok($$ insert into public.metric_observations (metric_id,venture_id,value,observed_on,created_by) values ('71000000-0000-0000-0000-000000000001','31000000-0000-0000-0000-000000000001',-1,current_date-1,'11000000-0000-0000-0000-000000000001') $$,'metric value cannot be negative','negative constrained actuals are rejected');
insert into public.venture_metrics (id,venture_id,key,name,category,unit,direction,cadence,created_by)
values ('71000000-0000-0000-0000-000000000002','31000000-0000-0000-0000-000000000001','retention','Retention','retention','percent','increase','monthly','11000000-0000-0000-0000-000000000001');
select throws_ok($$ insert into public.metric_observations (metric_id,venture_id,value,observed_on,created_by) values ('71000000-0000-0000-0000-000000000002','31000000-0000-0000-0000-000000000001',101,current_date,'11000000-0000-0000-0000-000000000001') $$,'percentage and score values must remain within 0 to 100','percentage actuals above 100 are rejected');
select throws_ok($$ insert into public.projection_goals (venture_id,metric_id,label,baseline_value,target_value,weight,target_date,created_by) values ('31000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000001','Wrong direction fixture',100,90,100,current_date+365,'11000000-0000-0000-0000-000000000001') $$,'projection target must follow the metric direction','goal direction is enforced at the database boundary');
select throws_ok($$ insert into public.projection_goals (venture_id,metric_id,label,baseline_value,target_value,weight,target_date,created_by) values ('31000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000001','Excessive horizon fixture',100,200,100,(current_date+interval '61 months')::date,'11000000-0000-0000-0000-000000000001') $$,'projection target date must be within the next 60 months','goal horizon is capped at 60 months');

set local role anon;
select is((select count(*)::integer from public.projection_runs),0,'anonymous user sees no projection runs');
select is((select count(*)::integer from public.projection_shares),0,'anonymous user sees no projection shares');

select * from finish();
rollback;
