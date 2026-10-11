begin;
create extension if not exists pgcrypto;
create schema if not exists private;

create type public.membership_role as enum ('founder','investor_mentor','institution_reviewer','institution_manager','platform_admin');
create type public.evidence_status as enum ('quarantined','scanning','clean','rejected','extraction_pending','ready','deleted');
create type public.readiness_state as enum ('not_started','in_progress','evidence_linked','reviewed');

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, display_name text not null default '', locale text not null default 'en-PH', deletion_requested_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.organizations (id uuid primary key default gen_random_uuid(), name text not null check (char_length(name) between 2 and 160), kind text not null check (kind in ('venture','investor','institution','platform')), region text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.organization_memberships (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, user_id uuid not null references auth.users on delete cascade, role public.membership_role not null, created_at timestamptz not null default now(), unique(organization_id,user_id,role));
create table public.invitations (id uuid primary key default gen_random_uuid(), email text not null, token_hash text not null unique, role public.membership_role not null, organization_id uuid references public.organizations on delete cascade, expires_at timestamptz not null, accepted_at timestamptz, accepted_by uuid references auth.users, invited_by uuid not null references auth.users, created_at timestamptz not null default now(), check (accepted_at is null or accepted_by is not null));
create unique index invitations_open_email_role_idx on public.invitations(lower(email),role) where accepted_at is null;
create table public.plans (id text primary key, name text not null, description text not null, indicative_price_min integer check(indicative_price_min>=0), indicative_price_max integer check(indicative_price_max>=0), active boolean not null default true, created_at timestamptz not null default now());
create table public.workspace_entitlements (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, plan_id text not null references public.plans, features jsonb not null default '{}', starts_at timestamptz not null default now(), ends_at timestamptz, assigned_by uuid references auth.users, created_at timestamptz not null default now());

create table public.ventures (id uuid primary key default gen_random_uuid(), organization_id uuid not null unique references public.organizations on delete cascade, name text not null, tagline text not null, sector text not null, stage text not null, region text not null, city text, funding_need_min numeric(14,2) not null default 0, funding_need_max numeric(14,2) not null default 0, traction_level smallint not null default 0 check(traction_level between 0 and 5), impact_goals text[] not null default '{}', risk_level smallint not null default 3 check(risk_level between 1 and 5), consent_to_match boolean not null default false, visibility text not null default 'private' check(visibility in ('private','cohort','matched')), deletion_requested_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(funding_need_max>=funding_need_min));
create table public.venture_sections (id uuid primary key default gen_random_uuid(), venture_id uuid not null references public.ventures on delete cascade, dimension text not null, state public.readiness_state not null default 'not_started', content jsonb not null default '{}', reviewed_by uuid references auth.users, reviewed_at timestamptz, updated_at timestamptz not null default now(), unique(venture_id,dimension));
create table public.claims (id uuid primary key default gen_random_uuid(), venture_id uuid not null references public.ventures on delete cascade, created_by uuid not null references auth.users, dimension text not null, statement text not null check(char_length(statement) between 4 and 4000), status text not null default 'draft' check(status in ('draft','active','archived')), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.evidence_items (id uuid primary key default gen_random_uuid(), venture_id uuid not null references public.ventures on delete cascade, owner_id uuid not null references auth.users, title text not null, file_name text not null, storage_path text not null unique, mime_type text not null, detected_mime_type text, extension text, size_bytes bigint not null check(size_bytes between 1 and 10485760), sha256 text, evidence_date date not null, status public.evidence_status not null default 'quarantined', scan_provider text, scan_reference text, scanned_at timestamptz, rejection_reason text, extracted_text text, extraction_status text not null default 'blocked', source_pages jsonb not null default '[]', deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.claim_evidence_links (claim_id uuid not null references public.claims on delete cascade, evidence_id uuid not null references public.evidence_items on delete cascade, linked_by uuid not null references auth.users, created_at timestamptz not null default now(), primary key(claim_id,evidence_id));
create table public.milestones (id uuid primary key default gen_random_uuid(), venture_id uuid not null references public.ventures on delete cascade, title text not null, occurred_on date, status text not null default 'planned' check(status in ('planned','achieved','verified')), evidence_id uuid references public.evidence_items on delete set null, created_by uuid not null references auth.users, created_at timestamptz not null default now());
create table public.readiness_rubrics (version text primary key, name text not null, dimensions jsonb not null, active boolean not null default false, created_at timestamptz not null default now());
create unique index readiness_rubrics_one_active_idx on public.readiness_rubrics(active) where active;
create table public.matching_rubrics (version text primary key, name text not null, weights jsonb not null check(jsonb_typeof(weights)='object'), hard_exclusions jsonb not null default '[]' check(jsonb_typeof(hard_exclusions)='array'), active boolean not null default false, created_at timestamptz not null default now());
create unique index matching_rubrics_one_active_idx on public.matching_rubrics(active) where active;
create table public.readiness_snapshots (id uuid primary key default gen_random_uuid(), venture_id uuid not null references public.ventures on delete cascade, rubric_version text not null references public.readiness_rubrics, completion_percent smallint not null check(completion_percent between 0 and 100), evidence_coverage_percent smallint not null check(evidence_coverage_percent between 0 and 100), dimensions jsonb not null, calculated_by uuid references auth.users, created_at timestamptz not null default now());

create table public.investor_theses (id uuid primary key default gen_random_uuid(), owner_id uuid not null unique references auth.users on delete cascade, organization_id uuid references public.organizations on delete set null, sectors text[] not null, stages text[] not null, regions text[] not null default '{}', ticket_min numeric(14,2) not null default 0, ticket_max numeric(14,2) not null default 0, minimum_traction smallint not null default 0 check(minimum_traction between 0 and 5), impact_goals text[] not null default '{}', risk_tolerance smallint not null default 3 check(risk_tolerance between 1 and 5), excluded_sectors text[] not null default '{}', mentorship_only boolean not null default false, rubric_version text not null default '2026.1', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(ticket_max>=ticket_min));
create table public.match_snapshots (id uuid primary key default gen_random_uuid(), venture_id uuid not null references public.ventures on delete cascade, thesis_id uuid not null references public.investor_theses on delete cascade, reviewer_id uuid not null references auth.users, rubric_version text not null, compatibility_score smallint not null check(compatibility_score between 0 and 100), factors jsonb not null, reasons jsonb not null default '[]', mismatches jsonb not null default '[]', eligible boolean not null, calculated_at timestamptz not null default now(), created_at timestamptz not null default now());
create table public.saved_matches (id uuid primary key default gen_random_uuid(), match_id uuid not null references public.match_snapshots on delete cascade, user_id uuid not null references auth.users on delete cascade, disposition text not null check(disposition in ('saved','dismissed')), created_at timestamptz not null default now(), unique(match_id,user_id));
create table public.review_assignments (id uuid primary key default gen_random_uuid(), venture_id uuid not null references public.ventures on delete cascade, reviewer_id uuid not null references auth.users on delete cascade, assigned_by uuid not null references auth.users, status text not null default 'assigned', due_at timestamptz, created_at timestamptz not null default now(), unique(venture_id,reviewer_id));
create table public.blind_reveals (id uuid primary key default gen_random_uuid(), venture_id uuid not null references public.ventures on delete cascade, reviewer_id uuid not null references auth.users on delete cascade, reason text not null check(char_length(reason) between 10 and 240), revealed_at timestamptz not null default now(), unique(venture_id,reviewer_id));

create table public.cohorts (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, name text not null, starts_on date, ends_on date, status text not null default 'draft' check(status in ('draft','active','complete','archived')), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(ends_on is null or starts_on is null or ends_on>=starts_on));
create table public.cohort_ventures (cohort_id uuid not null references public.cohorts on delete cascade, venture_id uuid not null references public.ventures on delete cascade, joined_at timestamptz not null default now(), primary key(cohort_id,venture_id));
create table public.reviewer_assignments (id uuid primary key default gen_random_uuid(), cohort_id uuid not null references public.cohorts on delete cascade, venture_id uuid not null references public.ventures on delete cascade, reviewer_id uuid not null references auth.users on delete cascade, assigned_by uuid not null references auth.users, status text not null default 'assigned', created_at timestamptz not null default now(), unique(cohort_id,venture_id,reviewer_id));

create table public.introductions (id uuid primary key default gen_random_uuid(), venture_id uuid not null references public.ventures on delete cascade, thesis_id uuid references public.investor_theses on delete set null, requested_by uuid not null references auth.users, recipient_id uuid not null references auth.users, status text not null default 'requested' check(status in ('requested','accepted','declined','cancelled','completed')), message text not null, outcome text, meeting_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.diligence_requests (id uuid primary key default gen_random_uuid(), introduction_id uuid not null references public.introductions on delete cascade, requested_by uuid not null references auth.users, title text not null, description text not null, status text not null default 'open' check(status in ('open','shared','resolved','declined')), due_at timestamptz, created_at timestamptz not null default now());
create table public.document_access_grants (id uuid primary key default gen_random_uuid(), evidence_id uuid not null references public.evidence_items on delete cascade, granted_to uuid not null references auth.users on delete cascade, granted_by uuid not null references auth.users, introduction_id uuid references public.introductions on delete cascade, expires_at timestamptz not null, revoked_at timestamptz, created_at timestamptz not null default now(), check(expires_at>created_at));
create table public.notes (id uuid primary key default gen_random_uuid(), author_id uuid not null references auth.users on delete cascade, venture_id uuid references public.ventures on delete cascade, introduction_id uuid references public.introductions on delete cascade, body text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(venture_id is not null or introduction_id is not null));
create table public.notifications (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade, kind text not null, title text not null, body text not null, link text, read_at timestamptz, created_at timestamptz not null default now());

create table public.consent_records (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade, purpose text not null, granted boolean not null, evidence_ids uuid[] not null default '{}', policy_version text not null default 'pilot-2026-10', created_at timestamptz not null default now());
create table public.ai_runs (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade, venture_id uuid references public.ventures on delete set null, purpose text not null, model text not null, prompt_version text not null, input_hash text not null, evidence_ids uuid[] not null default '{}', status text not null, latency_ms integer, usage jsonb not null default '{}', created_at timestamptz not null default now());
create table public.audit_events (id uuid primary key default gen_random_uuid(), actor_id uuid references auth.users, organization_id uuid references public.organizations, action text not null, entity_type text not null, entity_id uuid, metadata jsonb not null default '{}', created_at timestamptz not null default now());
create table public.product_events (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users on delete set null, organization_id uuid references public.organizations on delete set null, event_name text not null, properties jsonb not null default '{}', created_at timestamptz not null default now());
create table public.feature_flags (key text primary key, description text not null, enabled boolean not null default false, rules jsonb not null default '{}', updated_by uuid references auth.users, updated_at timestamptz not null default now());
create table public.pilot_applications (id uuid primary key default gen_random_uuid(), name text not null, email text not null, organization text not null, role text not null, goals text not null, region text not null, consent boolean not null check(consent), status text not null default 'new', created_at timestamptz not null default now());
create table public.rate_limit_events (id bigint generated always as identity primary key, key_hash text not null, created_at timestamptz not null default now());
create index rate_limit_events_key_time_idx on public.rate_limit_events(key_hash,created_at desc);
create index memberships_user_idx on public.organization_memberships(user_id,role);
create index memberships_org_idx on public.organization_memberships(organization_id,role);
create index ventures_matching_idx on public.ventures(consent_to_match,sector,stage) where deletion_requested_at is null;
create index sections_venture_idx on public.venture_sections(venture_id,dimension);
create index claims_venture_dimension_idx on public.claims(venture_id,dimension,status);
create index evidence_venture_status_idx on public.evidence_items(venture_id,status) where deleted_at is null;
create index evidence_owner_idx on public.evidence_items(owner_id,created_at desc);
create index claim_links_evidence_idx on public.claim_evidence_links(evidence_id);
create index readiness_snapshots_venture_time_idx on public.readiness_snapshots(venture_id,created_at desc);
create index matches_reviewer_time_idx on public.match_snapshots(reviewer_id,calculated_at desc);
create index matches_venture_idx on public.match_snapshots(venture_id,eligible);
create index cohort_ventures_venture_idx on public.cohort_ventures(venture_id);
create index reviewer_assignments_venture_idx on public.reviewer_assignments(venture_id,reviewer_id);
create index introductions_venture_status_idx on public.introductions(venture_id,status);
create index introductions_participants_idx on public.introductions(requested_by,recipient_id);
create index grants_recipient_expiry_idx on public.document_access_grants(granted_to,expires_at) where revoked_at is null;
create index grants_evidence_idx on public.document_access_grants(evidence_id);
create index notifications_user_time_idx on public.notifications(user_id,created_at desc);
create index audit_events_time_idx on public.audit_events(created_at desc);
create index ai_runs_user_time_idx on public.ai_runs(user_id,created_at desc);

create or replace function private.has_org_role(p_org uuid,p_roles public.membership_role[]) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.organization_memberships m where m.organization_id=p_org and m.user_id=(select auth.uid()) and m.role=any(p_roles)) $$;
create or replace function private.is_aal2() returns boolean language sql stable set search_path='' as $$ select coalesce((select auth.jwt()->>'aal'),'aal1')='aal2' $$;
create or replace function private.is_platform_admin() returns boolean language sql stable security definer set search_path='' as $$ select private.is_aal2() and exists(select 1 from public.organization_memberships m where m.user_id=(select auth.uid()) and m.role='platform_admin') $$;
create or replace function private.owns_venture(p_venture uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.ventures v join public.organization_memberships m on m.organization_id=v.organization_id where v.id=p_venture and m.user_id=(select auth.uid()) and (m.role='founder' or (m.role in ('institution_manager','platform_admin') and private.is_aal2()))) $$;
create or replace function private.assigned_venture(p_venture uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.review_assignments r where r.venture_id=p_venture and r.reviewer_id=(select auth.uid())) or exists(select 1 from public.reviewer_assignments r where r.venture_id=p_venture and r.reviewer_id=(select auth.uid())) $$;
create or replace function private.can_view_venture(p_venture uuid) returns boolean language sql stable security definer set search_path='' as $$ select private.owns_venture(p_venture) or private.is_platform_admin() or (exists(select 1 from public.ventures v where v.id=p_venture and v.deletion_requested_at is null) and (private.assigned_venture(p_venture) or exists(select 1 from public.match_snapshots m where m.venture_id=p_venture and m.reviewer_id=(select auth.uid()) and m.eligible) or (private.is_aal2() and exists(select 1 from public.cohort_ventures cv join public.cohorts c on c.id=cv.cohort_id where cv.venture_id=p_venture and private.has_org_role(c.organization_id,array['institution_manager']::public.membership_role[]))))) $$;
create or replace function private.can_view_evidence(p_evidence uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.evidence_items e where e.id=p_evidence and e.deleted_at is null and (e.owner_id=(select auth.uid()) or private.owns_venture(e.venture_id))) or (private.is_platform_admin() and exists(select 1 from public.evidence_items e where e.id=p_evidence and e.deleted_at is null)) or exists(select 1 from public.document_access_grants g join public.evidence_items e on e.id=g.evidence_id where g.evidence_id=p_evidence and e.deleted_at is null and g.granted_to=(select auth.uid()) and g.revoked_at is null and g.expires_at>now()) $$;
grant usage on schema private to authenticated;
grant execute on function private.has_org_role(uuid,public.membership_role[]),private.is_platform_admin(),private.is_aal2(),private.owns_venture(uuid),private.assigned_venture(uuid),private.can_view_venture(uuid),private.can_view_evidence(uuid) to authenticated;

create or replace function public.check_rate_limit(p_key text,p_limit integer,p_window_seconds integer) returns boolean language plpgsql security definer set search_path='' as $$ declare n integer; scoped_key text:=case when (select auth.role())='authenticated' then coalesce((select auth.uid())::text,'unknown')||':'||p_key else p_key end; h text:=encode(extensions.digest(scoped_key,'sha256'),'hex'); begin if p_limit<1 or p_window_seconds<1 then return false; end if; delete from public.rate_limit_events where created_at<now()-interval '1 day'; select count(*) into n from public.rate_limit_events where key_hash=h and created_at>now()-make_interval(secs=>p_window_seconds); if n>=p_limit then return false; end if; insert into public.rate_limit_events(key_hash) values(h); return true; end $$;
revoke all on function public.check_rate_limit(text,integer,integer) from public;
grant execute on function public.check_rate_limit(text,integer,integer) to anon,authenticated,service_role;

create or replace function private.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
do $$ declare t text; begin foreach t in array array['profiles','organizations','ventures','venture_sections','claims','evidence_items','investor_theses','cohorts','introductions','notes'] loop execute format('create trigger touch_updated_at before update on public.%I for each row execute function private.touch_updated_at()',t); end loop; end $$;
create or replace function private.prevent_audit_mutation() returns trigger language plpgsql set search_path='' as $$ begin raise exception 'audit events are immutable'; end $$;
create trigger audit_immutable before update or delete on public.audit_events for each row execute function private.prevent_audit_mutation();
create or replace function private.audit_insert() returns trigger language plpgsql security definer set search_path='' as $$ begin insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata) values((select auth.uid()),tg_table_name||'_created',tg_table_name,new.id,'{}'); return new; end $$;
create trigger audit_blind_reveal after insert on public.blind_reveals for each row execute function private.audit_insert();
create trigger audit_invitation after insert on public.invitations for each row execute function private.audit_insert();
create trigger audit_access_grant after insert on public.document_access_grants for each row execute function private.audit_insert();
create trigger audit_membership after insert on public.organization_memberships for each row execute function private.audit_insert();
create trigger audit_entitlement after insert on public.workspace_entitlements for each row execute function private.audit_insert();
create trigger audit_cohort after insert on public.cohorts for each row execute function private.audit_insert();
create trigger audit_reviewer_assignment after insert on public.reviewer_assignments for each row execute function private.audit_insert();
create trigger audit_introduction after insert on public.introductions for each row execute function private.audit_insert();
create or replace function private.audit_introduction_status() returns trigger language plpgsql security definer set search_path='' as $$ begin if new.status is distinct from old.status then insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata) values((select auth.uid()),'introduction_status_changed','introductions',new.id,jsonb_build_object('from',old.status,'to',new.status)); end if; if new.meeting_at is distinct from old.meeting_at or new.outcome is distinct from old.outcome then insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata) values((select auth.uid()),'introduction_coordination_updated','introductions',new.id,jsonb_build_object('meeting_changed',new.meeting_at is distinct from old.meeting_at,'outcome_changed',new.outcome is distinct from old.outcome)); end if; return new; end $$;
create trigger audit_introduction_status_change after update on public.introductions for each row execute function private.audit_introduction_status();
create or replace function private.protect_evidence_security_fields() returns trigger language plpgsql set search_path='' as $$ begin if (select auth.role())<>'service_role' and (new.owner_id<>old.owner_id or new.venture_id<>old.venture_id or new.storage_path<>old.storage_path or new.mime_type<>old.mime_type or new.extension is distinct from old.extension or new.size_bytes<>old.size_bytes or new.status is distinct from old.status or new.sha256 is distinct from old.sha256 or new.detected_mime_type is distinct from old.detected_mime_type or new.scan_provider is distinct from old.scan_provider or new.scan_reference is distinct from old.scan_reference or new.scanned_at is distinct from old.scanned_at or new.rejection_reason is distinct from old.rejection_reason or new.extracted_text is distinct from old.extracted_text or new.extraction_status is distinct from old.extraction_status or new.source_pages is distinct from old.source_pages) then raise exception 'evidence security fields are server-managed'; end if; return new; end $$;
create trigger evidence_security_fields before update on public.evidence_items for each row execute function private.protect_evidence_security_fields();
create or replace function private.protect_notification_fields() returns trigger language plpgsql set search_path='' as $$ begin if (select auth.role())<>'service_role' and (new.id<>old.id or new.user_id<>old.user_id or new.kind<>old.kind or new.title<>old.title or new.body<>old.body or new.link is distinct from old.link or new.created_at<>old.created_at) then raise exception 'only notification read state can be changed'; end if; return new; end $$;
create trigger notification_fields before update on public.notifications for each row execute function private.protect_notification_fields();
create or replace function private.protect_venture_deletion() returns trigger language plpgsql set search_path='' as $$ begin if old.deletion_requested_at is not null and new.deletion_requested_at is distinct from old.deletion_requested_at and (select auth.role())<>'service_role' then raise exception 'venture deletion requests are server-managed once recorded'; end if; if new.deletion_requested_at is not null then new.consent_to_match=false; end if; return new; end $$;
create trigger venture_deletion_protection before update on public.ventures for each row execute function private.protect_venture_deletion();
create or replace function private.protect_introduction_transition() returns trigger language plpgsql set search_path='' as $$ begin if (select auth.role())='service_role' then return new; end if; if new.venture_id is distinct from old.venture_id or new.thesis_id is distinct from old.thesis_id or new.requested_by is distinct from old.requested_by or new.recipient_id is distinct from old.recipient_id or new.message is distinct from old.message then raise exception 'introduction participants and request details are immutable'; end if; if new.status is distinct from old.status then if old.status='requested' and new.status in ('accepted','declined') and old.recipient_id<>(select auth.uid()) then raise exception 'only the recipient can accept or decline'; elsif old.status='requested' and new.status='cancelled' and old.requested_by<>(select auth.uid()) then raise exception 'only the requester can cancel'; elsif old.status='accepted' and new.status='completed' and (select auth.uid()) not in (old.requested_by,old.recipient_id) then raise exception 'only a participant can complete'; elsif not ((old.status='requested' and new.status in ('accepted','declined','cancelled')) or (old.status='accepted' and new.status in ('completed','cancelled'))) then raise exception 'invalid introduction transition'; end if; end if; return new; end $$;
create trigger introduction_status_transition before update on public.introductions for each row execute function private.protect_introduction_transition();

create or replace function private.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$ begin insert into public.profiles(id,display_name) values(new.id,coalesce(new.raw_user_meta_data->>'display_name',split_part(new.email,'@',1))) on conflict(id) do nothing; return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

create or replace function public.accept_invitation(p_token_hash text) returns table(role public.membership_role, organization_id uuid) language plpgsql security definer set search_path='' as $$
declare
  invite public.invitations%rowtype;
  target_org uuid;
  current_user_id uuid := (select auth.uid());
  current_email text := lower(coalesce((select auth.jwt()->>'email'),''));
  org_kind text;
begin
  if current_user_id is null then raise exception 'authentication required'; end if;
  select * into invite from public.invitations i where i.token_hash=p_token_hash for update;
  if not found or invite.accepted_at is not null or invite.expires_at<=now() or lower(invite.email)<>current_email then raise exception 'invitation unavailable'; end if;
  target_org:=invite.organization_id;
  if target_org is null then
    org_kind:=case when invite.role='founder' then 'venture' when invite.role='investor_mentor' then 'investor' when invite.role in ('institution_reviewer','institution_manager') then 'institution' else 'platform' end;
    insert into public.organizations(name,kind) values(split_part(invite.email,'@',1)||' workspace',org_kind) returning id into target_org;
  end if;
  insert into public.profiles(id,display_name) values(current_user_id,coalesce(nullif((select auth.jwt()->'user_metadata'->>'full_name'),''),split_part(invite.email,'@',1))) on conflict(id) do nothing;
  insert into public.organization_memberships(organization_id,user_id,role) values(target_org,current_user_id,invite.role) on conflict(organization_id,user_id,role) do nothing;
  update public.invitations set accepted_at=now(),accepted_by=current_user_id,organization_id=target_org where id=invite.id;
  insert into public.audit_events(actor_id,organization_id,action,entity_type,entity_id,metadata) values(current_user_id,target_org,'invitation_accepted','invitation',invite.id,jsonb_build_object('role',invite.role));
  return query select invite.role,target_org;
end $$;
revoke all on function public.accept_invitation(text) from public;
grant execute on function public.accept_invitation(text) to authenticated;

create or replace function public.review_readiness_section(p_venture_id uuid,p_dimension text) returns void language plpgsql security definer set search_path='' as $$ begin if (select auth.uid()) is null or not (private.assigned_venture(p_venture_id) or (private.is_aal2() and private.is_platform_admin())) then raise exception 'review assignment required'; end if; if p_dimension not in ('problem','market','solution','traction','team','business_model','use_of_funds','financial_readiness','legal_readiness') then raise exception 'invalid readiness dimension'; end if; update public.venture_sections s set state='reviewed',reviewed_by=(select auth.uid()),reviewed_at=now() where s.venture_id=p_venture_id and s.dimension=p_dimension and exists(select 1 from public.claims c join public.claim_evidence_links l on l.claim_id=c.id join public.evidence_items e on e.id=l.evidence_id where c.venture_id=s.venture_id and c.dimension=s.dimension and c.status='active' and e.status='ready' and e.deleted_at is null); if not found then raise exception 'section must have linked clean evidence before review'; end if; insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata) select (select auth.uid()),'readiness_section_reviewed','venture_section',s.id,jsonb_build_object('dimension',p_dimension) from public.venture_sections s where s.venture_id=p_venture_id and s.dimension=p_dimension; end $$;
revoke all on function public.review_readiness_section(uuid,text) from public;
grant execute on function public.review_readiness_section(uuid,text) to authenticated;

create or replace function public.activate_matching_rubric(p_version text) returns void language plpgsql security definer set search_path='' as $$
declare rubric public.matching_rubrics%rowtype;
begin
  if not private.is_platform_admin() then raise exception 'platform administrator access with MFA required'; end if;
  select * into rubric from public.matching_rubrics where version=p_version for update;
  if not found then raise exception 'unknown matching rubric'; end if;
  if not (
    jsonb_typeof(rubric.weights->'sector')='number' and jsonb_typeof(rubric.weights->'stage')='number' and
    jsonb_typeof(rubric.weights->'ticket')='number' and jsonb_typeof(rubric.weights->'traction')='number' and
    jsonb_typeof(rubric.weights->'geography')='number' and jsonb_typeof(rubric.weights->'impact')='number' and
    jsonb_typeof(rubric.weights->'risk')='number' and
    (rubric.weights->>'sector')::integer>=0 and (rubric.weights->>'stage')::integer>=0 and
    (rubric.weights->>'ticket')::integer>=0 and (rubric.weights->>'traction')::integer>=0 and
    (rubric.weights->>'geography')::integer>=0 and (rubric.weights->>'impact')::integer>=0 and
    (rubric.weights->>'risk')::integer>=0 and
    (rubric.weights->>'sector')::integer+(rubric.weights->>'stage')::integer+
    (rubric.weights->>'ticket')::integer+(rubric.weights->>'traction')::integer+
    (rubric.weights->>'geography')::integer+(rubric.weights->>'impact')::integer+
    (rubric.weights->>'risk')::integer=100
  ) then raise exception 'matching rubric weights must be non-negative integers totaling 100'; end if;
  update public.matching_rubrics set active=false where active;
  update public.matching_rubrics set active=true where version=p_version;
  insert into public.audit_events(actor_id,action,entity_type,metadata) values((select auth.uid()),'matching_rubric_activated','matching_rubric',jsonb_build_object('version',p_version));
end $$;
revoke all on function public.activate_matching_rubric(text) from public;
grant execute on function public.activate_matching_rubric(text) to authenticated;

create or replace function private.refresh_readiness_snapshot(p_venture_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare
  rubric text;
  dimension_rows jsonb;
  completed integer;
  covered integer;
begin
  if p_venture_id is null or not exists(select 1 from public.ventures where id=p_venture_id) then return; end if;
  select version into rubric from public.readiness_rubrics where active order by created_at desc limit 1;
  if rubric is null then return; end if;
  with dimensions(dimension) as (
    select unnest(array['problem','market','solution','traction','team','business_model','use_of_funds','financial_readiness','legal_readiness'])
  ), calculated as (
    select d.dimension,
      case when nullif(trim(coalesce(s.content->>'summary','')),'') is null then 0 else 1 end as summary_complete,
      case when exists(select 1 from public.claims c where c.venture_id=p_venture_id and c.dimension=d.dimension and c.status='active') then 1 else 0 end as claim_complete,
      case when exists(select 1 from public.claims c join public.claim_evidence_links l on l.claim_id=c.id join public.evidence_items e on e.id=l.evidence_id where c.venture_id=p_venture_id and c.dimension=d.dimension and c.status='active' and e.status='ready' and e.deleted_at is null) then 1 else 0 end as has_evidence,
      coalesce(s.state,'not_started'::public.readiness_state) as stored_state
    from dimensions d left join public.venture_sections s on s.venture_id=p_venture_id and s.dimension=d.dimension
  )
  select jsonb_agg(jsonb_build_object(
      'dimension',dimension,
      'state',case when stored_state='reviewed' and summary_complete+claim_complete=2 and has_evidence=1 then 'reviewed' when summary_complete+claim_complete=2 and has_evidence=1 then 'evidence_linked' when summary_complete+claim_complete+has_evidence>0 then 'in_progress' else 'not_started' end,
      'completedFields',summary_complete+claim_complete,
      'requiredFields',2,
      'evidenceCount',has_evidence
    ) order by dimension),
    sum(summary_complete+claim_complete),
    sum(has_evidence)
  into dimension_rows,completed,covered from calculated;
  insert into public.readiness_snapshots(venture_id,rubric_version,completion_percent,evidence_coverage_percent,dimensions,calculated_by)
  values(p_venture_id,rubric,round(coalesce(completed,0)::numeric/18*100)::smallint,round(coalesce(covered,0)::numeric/9*100)::smallint,coalesce(dimension_rows,'[]'::jsonb),(select auth.uid()));
end $$;

create or replace function private.capture_readiness_snapshot() returns trigger language plpgsql security definer set search_path='' as $$
declare venture_id uuid;
begin
  if tg_table_name='claim_evidence_links' then
    if tg_op='DELETE' then
      select c.venture_id into venture_id from public.claims c where c.id=old.claim_id;
    else
      select c.venture_id into venture_id from public.claims c where c.id=new.claim_id;
    end if;
  else
    if tg_op='DELETE' then venture_id:=old.venture_id; else venture_id:=new.venture_id; end if;
  end if;
  perform private.refresh_readiness_snapshot(venture_id);
  if tg_op='DELETE' then return old; else return new; end if;
end $$;
create trigger readiness_snapshot_sections after insert or update or delete on public.venture_sections for each row execute function private.capture_readiness_snapshot();
create trigger readiness_snapshot_claims after insert or update or delete on public.claims for each row execute function private.capture_readiness_snapshot();
create trigger readiness_snapshot_links after insert or delete on public.claim_evidence_links for each row execute function private.capture_readiness_snapshot();
create trigger readiness_snapshot_evidence after update of status,deleted_at on public.evidence_items for each row execute function private.capture_readiness_snapshot();

do $$ declare t text; begin foreach t in array array['profiles','organizations','organization_memberships','invitations','plans','workspace_entitlements','ventures','venture_sections','claims','evidence_items','claim_evidence_links','milestones','readiness_rubrics','matching_rubrics','readiness_snapshots','investor_theses','match_snapshots','saved_matches','review_assignments','blind_reveals','cohorts','cohort_ventures','reviewer_assignments','introductions','diligence_requests','document_access_grants','notes','notifications','consent_records','ai_runs','audit_events','product_events','feature_flags','pilot_applications','rate_limit_events'] loop execute format('alter table public.%I enable row level security',t); end loop; end $$;

create policy profiles_self on public.profiles for select to authenticated using(id=(select auth.uid()) or private.is_platform_admin());
create policy profiles_self_update on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy organizations_member_read on public.organizations for select to authenticated using(private.has_org_role(id,array['founder','investor_mentor','institution_reviewer','institution_manager','platform_admin']::public.membership_role[]) or private.is_platform_admin());
create policy organizations_admin_write on public.organizations for all to authenticated using(private.is_aal2() and private.is_platform_admin()) with check(private.is_aal2() and private.is_platform_admin());
create policy memberships_self_or_admin on public.organization_memberships for select to authenticated using(user_id=(select auth.uid()) or private.has_org_role(organization_id,array['institution_manager','platform_admin']::public.membership_role[]) or private.is_platform_admin());
create policy memberships_admin_write on public.organization_memberships for all to authenticated using(private.is_aal2() and (private.has_org_role(organization_id,array['institution_manager','platform_admin']::public.membership_role[]) or private.is_platform_admin())) with check(private.is_aal2() and (private.has_org_role(organization_id,array['institution_manager','platform_admin']::public.membership_role[]) or private.is_platform_admin()));
create policy invitations_admin on public.invitations for all to authenticated using(private.is_aal2() and (private.is_platform_admin() or (organization_id is not null and private.has_org_role(organization_id,array['institution_manager']::public.membership_role[])))) with check(private.is_aal2() and (private.is_platform_admin() or (organization_id is not null and private.has_org_role(organization_id,array['institution_manager']::public.membership_role[]))));
create policy invitations_institution_founder_insert on public.invitations for insert to authenticated with check(private.is_aal2() and role='founder' and organization_id is null and invited_by=(select auth.uid()) and exists(select 1 from public.organization_memberships m where m.user_id=(select auth.uid()) and m.role='institution_manager'));
create policy plans_authenticated_read on public.plans for select to authenticated using(true);
create policy entitlements_member_read on public.workspace_entitlements for select to authenticated using(private.has_org_role(organization_id,array['founder','investor_mentor','institution_reviewer','institution_manager','platform_admin']::public.membership_role[]) or private.is_platform_admin());
create policy entitlements_admin_write on public.workspace_entitlements for all to authenticated using(private.is_aal2() and private.is_platform_admin()) with check(private.is_aal2() and private.is_platform_admin());
create policy ventures_scoped_read on public.ventures for select to authenticated using(private.can_view_venture(id));
create policy ventures_founder_insert on public.ventures for insert to authenticated with check(private.has_org_role(organization_id,array['founder']::public.membership_role[]) or (private.is_aal2() and (private.has_org_role(organization_id,array['institution_manager','platform_admin']::public.membership_role[]) or private.is_platform_admin())));
create policy ventures_owner_update on public.ventures for update to authenticated using(private.owns_venture(id) or (private.is_aal2() and private.is_platform_admin())) with check(private.owns_venture(id) or (private.is_aal2() and private.is_platform_admin()));
create policy sections_scoped on public.venture_sections for select to authenticated using(private.can_view_venture(venture_id));
create policy sections_owner_write on public.venture_sections for all to authenticated using(private.owns_venture(venture_id) or (private.is_aal2() and private.is_platform_admin())) with check(private.owns_venture(venture_id) or (private.is_aal2() and private.is_platform_admin()));
create policy claims_scoped on public.claims for select to authenticated using(private.can_view_venture(venture_id));
create policy claims_owner_write on public.claims for all to authenticated using(private.owns_venture(venture_id) or (private.is_aal2() and private.is_platform_admin())) with check(private.owns_venture(venture_id) or (private.is_aal2() and private.is_platform_admin()));
create policy evidence_explicit_read on public.evidence_items for select to authenticated using(private.can_view_evidence(id));
create policy evidence_owner_insert on public.evidence_items for insert to authenticated with check(owner_id=(select auth.uid()) and private.owns_venture(venture_id));
create policy evidence_owner_update on public.evidence_items for update to authenticated using(owner_id=(select auth.uid()) or (private.is_aal2() and private.is_platform_admin())) with check(owner_id=(select auth.uid()) or (private.is_aal2() and private.is_platform_admin()));
create policy links_scoped_read on public.claim_evidence_links for select to authenticated using(private.can_view_evidence(evidence_id));
create policy links_owner_write on public.claim_evidence_links for all to authenticated using(linked_by=(select auth.uid()) and exists(select 1 from public.claims c join public.evidence_items e on e.venture_id=c.venture_id where c.id=claim_id and e.id=evidence_id and private.owns_venture(c.venture_id))) with check(linked_by=(select auth.uid()) and exists(select 1 from public.claims c join public.evidence_items e on e.venture_id=c.venture_id where c.id=claim_id and e.id=evidence_id and private.owns_venture(c.venture_id)));
create policy milestones_scoped on public.milestones for select to authenticated using(private.can_view_venture(venture_id));
create policy milestones_owner_write on public.milestones for all to authenticated using(private.owns_venture(venture_id)) with check(private.owns_venture(venture_id));
create policy rubrics_read on public.readiness_rubrics for select to authenticated using(true);
create policy matching_rubrics_read on public.matching_rubrics for select to authenticated using(true);
create policy matching_rubrics_admin_write on public.matching_rubrics for all to authenticated using(private.is_platform_admin()) with check(private.is_platform_admin());
create policy snapshots_scoped on public.readiness_snapshots for select to authenticated using(private.can_view_venture(venture_id));
create policy theses_owner on public.investor_theses for all to authenticated using(owner_id=(select auth.uid()) or private.is_platform_admin()) with check(owner_id=(select auth.uid()) or private.is_platform_admin());
create policy matches_participant on public.match_snapshots for select to authenticated using(reviewer_id=(select auth.uid()) or private.can_view_venture(venture_id));
create policy saved_owner on public.saved_matches for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy reviews_participant on public.review_assignments for select to authenticated using(reviewer_id=(select auth.uid()) or private.owns_venture(venture_id) or private.is_platform_admin());
create policy reveals_reviewer_insert on public.blind_reveals for insert to authenticated with check(reviewer_id=(select auth.uid()) and private.can_view_venture(venture_id));
create policy reveals_participant_read on public.blind_reveals for select to authenticated using(reviewer_id=(select auth.uid()) or private.can_view_venture(venture_id));
create policy cohorts_staff on public.cohorts for select to authenticated using(private.has_org_role(organization_id,array['institution_reviewer','institution_manager','platform_admin']::public.membership_role[]) or private.is_platform_admin());
create policy cohorts_manager_write on public.cohorts for all to authenticated using(private.is_aal2() and (private.has_org_role(organization_id,array['institution_manager','platform_admin']::public.membership_role[]) or private.is_platform_admin())) with check(private.is_aal2() and (private.has_org_role(organization_id,array['institution_manager','platform_admin']::public.membership_role[]) or private.is_platform_admin()));
create policy cohort_ventures_scoped on public.cohort_ventures for select to authenticated using(private.can_view_venture(venture_id));
create policy cohort_ventures_manager_write on public.cohort_ventures for all to authenticated using(private.is_aal2() and exists(select 1 from public.cohorts c where c.id=cohort_id and (private.has_org_role(c.organization_id,array['institution_manager']::public.membership_role[]) or private.is_platform_admin()))) with check(private.is_aal2() and exists(select 1 from public.cohorts c where c.id=cohort_id and (private.has_org_role(c.organization_id,array['institution_manager']::public.membership_role[]) or private.is_platform_admin())));
create policy reviewer_assignments_self on public.reviewer_assignments for select to authenticated using(reviewer_id=(select auth.uid()) or private.can_view_venture(venture_id));
create policy reviewer_assignments_manager_write on public.reviewer_assignments for all to authenticated using(private.is_aal2() and exists(select 1 from public.cohorts c where c.id=cohort_id and (private.has_org_role(c.organization_id,array['institution_manager']::public.membership_role[]) or private.is_platform_admin()))) with check(assigned_by=(select auth.uid()) and private.is_aal2() and exists(select 1 from public.cohorts c where c.id=cohort_id and (private.has_org_role(c.organization_id,array['institution_manager']::public.membership_role[]) or private.is_platform_admin())));
create policy introductions_participant on public.introductions for select to authenticated using(requested_by=(select auth.uid()) or recipient_id=(select auth.uid()) or private.can_view_venture(venture_id));
create policy introductions_request on public.introductions for insert to authenticated with check(requested_by=(select auth.uid()) and private.can_view_venture(venture_id));
create policy introductions_update on public.introductions for update to authenticated using(requested_by=(select auth.uid()) or recipient_id=(select auth.uid())) with check(requested_by=(select auth.uid()) or recipient_id=(select auth.uid()));
create policy introductions_manager_coordinate on public.introductions for update to authenticated using(private.is_aal2() and exists(select 1 from public.cohort_ventures cv join public.cohorts c on c.id=cv.cohort_id where cv.venture_id=introductions.venture_id and private.has_org_role(c.organization_id,array['institution_manager']::public.membership_role[]))) with check(private.is_aal2() and exists(select 1 from public.cohort_ventures cv join public.cohorts c on c.id=cv.cohort_id where cv.venture_id=introductions.venture_id and private.has_org_role(c.organization_id,array['institution_manager']::public.membership_role[])));
create policy diligence_participant on public.diligence_requests for select to authenticated using(exists(select 1 from public.introductions i where i.id=introduction_id and (i.requested_by=(select auth.uid()) or i.recipient_id=(select auth.uid()) or private.can_view_venture(i.venture_id))));
create policy diligence_requester_insert on public.diligence_requests for insert to authenticated with check(requested_by=(select auth.uid()) and exists(select 1 from public.introductions i where i.id=introduction_id and i.status='accepted' and (i.requested_by=(select auth.uid()) or i.recipient_id=(select auth.uid()))));
create policy diligence_participant_update on public.diligence_requests for update to authenticated using(exists(select 1 from public.introductions i where i.id=introduction_id and (i.requested_by=(select auth.uid()) or i.recipient_id=(select auth.uid()) or private.can_view_venture(i.venture_id)))) with check(exists(select 1 from public.introductions i where i.id=introduction_id and (i.requested_by=(select auth.uid()) or i.recipient_id=(select auth.uid()) or private.can_view_venture(i.venture_id))));
create policy grants_participant on public.document_access_grants for select to authenticated using(granted_to=(select auth.uid()) or granted_by=(select auth.uid()) or private.can_view_evidence(evidence_id));
create policy grants_owner_insert on public.document_access_grants for insert to authenticated with check(granted_by=(select auth.uid()) and exists(select 1 from public.evidence_items e where e.id=evidence_id and (e.owner_id=(select auth.uid()) or private.owns_venture(e.venture_id))));
create policy grants_owner_update on public.document_access_grants for update to authenticated using(granted_by=(select auth.uid()) or exists(select 1 from public.evidence_items e where e.id=evidence_id and (e.owner_id=(select auth.uid()) or private.owns_venture(e.venture_id)))) with check(granted_by=(select auth.uid()) or exists(select 1 from public.evidence_items e where e.id=evidence_id and (e.owner_id=(select auth.uid()) or private.owns_venture(e.venture_id))));
create policy notes_private on public.notes for all to authenticated using(author_id=(select auth.uid())) with check(author_id=(select auth.uid()));
create policy notifications_private on public.notifications for select to authenticated using(user_id=(select auth.uid()));
create policy notifications_mark_read on public.notifications for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy consents_private on public.consent_records for select to authenticated using(user_id=(select auth.uid()) or private.is_platform_admin());
create policy consents_insert on public.consent_records for insert to authenticated with check(user_id=(select auth.uid()));
create policy ai_runs_private on public.ai_runs for select to authenticated using(user_id=(select auth.uid()) or private.is_platform_admin());
create policy ai_runs_insert on public.ai_runs for insert to authenticated with check(user_id=(select auth.uid()));
create policy audit_admin_read on public.audit_events for select to authenticated using((private.is_aal2() and private.is_platform_admin()) or actor_id=(select auth.uid()));
create policy events_own_insert on public.product_events for insert to authenticated with check(user_id=(select auth.uid()));
create policy flags_auth_read on public.feature_flags for select to authenticated using(true);
create policy flags_admin_write on public.feature_flags for all to authenticated using(private.is_aal2() and private.is_platform_admin()) with check(private.is_aal2() and private.is_platform_admin());
create policy pilot_admin_read on public.pilot_applications for select to authenticated using(private.is_aal2() and private.is_platform_admin());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('evidence','evidence',false,10485760,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/csv','image/jpeg','image/png']) on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy evidence_storage_insert on storage.objects for insert to authenticated with check(bucket_id='evidence' and (storage.foldername(name))[1]=(select auth.uid())::text and exists(select 1 from public.evidence_items e where e.storage_path=name and e.owner_id=(select auth.uid()) and e.status='quarantined' and e.deleted_at is null));
create policy evidence_storage_read on storage.objects for select to authenticated using(bucket_id='evidence' and exists(select 1 from public.evidence_items e where e.storage_path=name and private.can_view_evidence(e.id) and e.status in ('clean','ready')));

insert into public.plans(id,name,description,indicative_price_min,indicative_price_max) values
('free-founder','Free Founder','Core readiness profile and limited private evidence storage',0,0),
('founder-pro','Founder Pro','Expanded evidence, guided reviews, and collaboration',499,999),
('readiness-sprint','Pitch Readiness Sprint','Separately scoped hands-on readiness engagement',null,null),
('institution-pilot','Institutional Pilot','Cohort workflow, reviewer coordination, and pilot analytics',25000,75000),
('supporter-pilot','Investor and Mentor Pilot','Free access for invited pilot supporters',0,0)
on conflict(id) do nothing;
insert into public.readiness_rubrics(version,name,dimensions,active) values('2026.1','Pilot readiness rubric','["problem","market","solution","traction","team","business_model","use_of_funds","financial_readiness","legal_readiness"]',true) on conflict(version) do nothing;
insert into public.matching_rubrics(version,name,weights,hard_exclusions,active) values('2026.1','Pilot compatibility rubric','{"sector":20,"stage":20,"ticket":20,"traction":15,"geography":10,"impact":10,"risk":5}','["absent_founder_consent","excluded_sector"]',true) on conflict(version) do nothing;
insert into public.feature_flags(key,description,enabled) values('file_uploads','Enable evidence upload only when production scanning is configured',false),('ai_assistance','Enable consented, advisory AI workflows',false),('blind_reveal','Enable audited identity reveals',true) on conflict(key) do nothing;
commit;
