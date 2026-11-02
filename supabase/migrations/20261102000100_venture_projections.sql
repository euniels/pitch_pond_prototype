begin;

create table public.venture_metrics (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references public.ventures on delete cascade,
  key text not null check (key ~ '^[a-z0-9_]{2,60}$'),
  name text not null check (char_length(name) between 2 and 100),
  category text not null check (category in ('revenue','active_customers','retention','gross_margin','cash_runway','product_milestone','readiness','evidence_coverage','custom')),
  unit text not null check (unit in ('php','count','percent','months','score','custom')),
  direction text not null check (direction in ('increase','decrease')),
  cadence text not null check (cadence in ('weekly','monthly','quarterly')),
  privacy_classification text not null default 'indexed' check (privacy_classification in ('indexed','exact')),
  active boolean not null default true,
  created_by uuid not null references auth.users,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (venture_id,key),
  unique (id,venture_id)
);

create table public.metric_observations (
  id uuid primary key default gen_random_uuid(),
  metric_id uuid not null,
  venture_id uuid not null,
  value numeric(20,6) not null,
  observed_on date not null,
  source text not null default 'manual' check (source in ('manual','evidence','import')),
  verification_state text not null default 'self_reported' check (verification_state in ('self_reported','evidence_linked','reviewed')),
  evidence_id uuid references public.evidence_items on delete set null,
  supersedes_id uuid unique references public.metric_observations on delete restrict,
  created_by uuid not null references auth.users,
  created_at timestamptz not null default now(),
  foreign key (metric_id,venture_id) references public.venture_metrics(id,venture_id) on delete cascade,
  check (verification_state='self_reported' or evidence_id is not null)
);

create table public.projection_goals (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references public.ventures on delete cascade,
  metric_id uuid not null,
  label text not null check (char_length(label) between 3 and 140),
  baseline_value numeric(20,6) not null,
  target_value numeric(20,6) not null,
  weight smallint not null check (weight between 1 and 100),
  target_date date not null,
  scenario_inputs jsonb not null default '{}' check (jsonb_typeof(scenario_inputs)='object'),
  status text not null default 'active' check (status in ('active','paused','complete','archived')),
  created_by uuid not null references auth.users,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (metric_id,venture_id) references public.venture_metrics(id,venture_id) on delete cascade,
  unique (id,venture_id),
  check (baseline_value <> target_value),
  check (target_date > created_at::date)
);

create table public.goal_evidence_links (
  goal_id uuid not null references public.projection_goals on delete cascade,
  evidence_id uuid not null references public.evidence_items on delete cascade,
  linked_by uuid not null references auth.users,
  created_at timestamptz not null default now(),
  primary key (goal_id,evidence_id)
);

create table public.projection_model_versions (
  version text primary key,
  name text not null,
  config jsonb not null check (jsonb_typeof(config)='object'),
  active boolean not null default false,
  created_by uuid references auth.users,
  created_at timestamptz not null default now()
);
create unique index projection_model_one_active_idx on public.projection_model_versions(active) where active;

create table public.projection_runs (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null,
  venture_id uuid not null,
  created_by uuid not null references auth.users,
  model_version text not null references public.projection_model_versions,
  scenario text not null check (scenario in ('cautious','baseline','accelerated')),
  horizon_months smallint not null check (horizon_months between 1 and 60),
  input_hash text not null check (char_length(input_hash) between 16 and 128),
  input_kind text not null check (input_kind in ('assumption_based','data_backed')),
  probability smallint not null check (probability between 0 and 100),
  confidence smallint not null check (confidence between 0 and 100),
  status_band text not null check (status_band in ('on_track','watch','at_risk')),
  indexed_series jsonb not null check (jsonb_typeof(indexed_series)='array'),
  exact_series jsonb not null check (jsonb_typeof(exact_series)='array'),
  drivers jsonb not null default '[]' check (jsonb_typeof(drivers)='array'),
  limitations jsonb not null default '[]' check (jsonb_typeof(limitations)='array'),
  sensitivity jsonb not null default '{}' check (jsonb_typeof(sensitivity)='object'),
  input_summary jsonb not null default '{}' check (jsonb_typeof(input_summary)='object'),
  expected_target_date date,
  calculated_at timestamptz not null default now(),
  stale_after timestamptz not null,
  foreign key (goal_id,venture_id) references public.projection_goals(id,venture_id) on delete cascade
);

create table public.projection_shares (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.projection_runs on delete cascade,
  venture_id uuid not null references public.ventures on delete cascade,
  recipient_id uuid not null references auth.users on delete cascade,
  shared_by uuid not null references auth.users,
  visibility text not null default 'indexed' check (visibility in ('indexed','exact')),
  match_id uuid references public.match_snapshots on delete set null,
  introduction_id uuid references public.introductions on delete set null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at>created_at),
  check (visibility='indexed' or introduction_id is not null)
);

create index venture_metrics_venture_idx on public.venture_metrics(venture_id,active);
create index metric_observations_metric_date_idx on public.metric_observations(metric_id,observed_on desc);
create index metric_observations_venture_idx on public.metric_observations(venture_id,observed_on desc);
create index projection_goals_venture_status_idx on public.projection_goals(venture_id,status);
create index projection_runs_goal_time_idx on public.projection_runs(goal_id,calculated_at desc);
create index projection_runs_venture_time_idx on public.projection_runs(venture_id,calculated_at desc);
create index projection_shares_recipient_expiry_idx on public.projection_shares(recipient_id,expires_at) where revoked_at is null;
create index projection_shares_venture_idx on public.projection_shares(venture_id,created_at desc);

create or replace function private.validate_metric_observation_value() returns trigger
language plpgsql security definer set search_path='' as $$
declare metric public.venture_metrics%rowtype;
begin
  select * into metric from public.venture_metrics where id=new.metric_id and venture_id=new.venture_id;
  if not found then raise exception 'projection metric is unavailable'; end if;
  if new.observed_on>current_date then raise exception 'actual observations cannot be future-dated'; end if;
  if metric.unit in ('php','count','months','percent','score') and new.value<0 then
    raise exception 'metric value cannot be negative';
  end if;
  if metric.unit in ('percent','score') and new.value>100 then
    raise exception 'percentage and score values must remain within 0 to 100';
  end if;
  return new;
end $$;
create trigger metric_observation_value_valid before insert or update on public.metric_observations for each row execute function private.validate_metric_observation_value();

create or replace function private.validate_projection_goal_value() returns trigger
language plpgsql security definer set search_path='' as $$
declare metric public.venture_metrics%rowtype;
begin
  select * into metric from public.venture_metrics where id=new.metric_id and venture_id=new.venture_id;
  if not found then raise exception 'projection metric is unavailable'; end if;
  if new.target_date<=current_date or new.target_date>(current_date+interval '60 months')::date then
    raise exception 'projection target date must be within the next 60 months';
  end if;
  if metric.unit in ('php','count','months','percent','score') and (new.baseline_value<0 or new.target_value<0) then
    raise exception 'projection values cannot be negative';
  end if;
  if metric.unit in ('percent','score') and (new.baseline_value>100 or new.target_value>100) then
    raise exception 'percentage and score goals must remain within 0 to 100';
  end if;
  if (metric.direction='increase' and new.target_value<=new.baseline_value)
     or (metric.direction='decrease' and new.target_value>=new.baseline_value) then
    raise exception 'projection target must follow the metric direction';
  end if;
  return new;
end $$;
create trigger projection_goal_value_valid before insert or update on public.projection_goals for each row execute function private.validate_projection_goal_value();

create or replace function private.validate_projection_evidence() returns trigger
language plpgsql security definer set search_path='' as $$
declare evidence public.evidence_items%rowtype;
begin
  if new.evidence_id is null then return new; end if;
  select * into evidence from public.evidence_items where id=new.evidence_id;
  if not found or evidence.venture_id<>new.venture_id or evidence.status not in ('clean','ready') or evidence.deleted_at is not null then
    raise exception 'projection evidence must be clean and belong to the venture';
  end if;
  return new;
end $$;
create trigger metric_observation_evidence_valid before insert or update on public.metric_observations for each row execute function private.validate_projection_evidence();

create or replace function private.validate_goal_evidence() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if not exists(
    select 1 from public.projection_goals g
    join public.evidence_items e on e.id=new.evidence_id
    where g.id=new.goal_id and e.venture_id=g.venture_id and e.status in ('clean','ready') and e.deleted_at is null
  ) then raise exception 'goal evidence must be clean and belong to the venture'; end if;
  return new;
end $$;
create trigger goal_evidence_valid before insert or update on public.goal_evidence_links for each row execute function private.validate_goal_evidence();

create or replace function private.prevent_projection_run_mutation() returns trigger
language plpgsql set search_path='' as $$
begin raise exception 'projection runs are immutable'; end $$;
create trigger projection_runs_immutable before update or delete on public.projection_runs for each row execute function private.prevent_projection_run_mutation();

create or replace function private.protect_projection_model_version() returns trigger
language plpgsql set search_path='' as $$
begin
  if tg_op='DELETE' then raise exception 'projection model versions are immutable'; end if;
  if (to_jsonb(new)-'active')<>(to_jsonb(old)-'active') then raise exception 'projection model configuration is immutable'; end if;
  return new;
end $$;
create trigger projection_model_versions_protected before update or delete on public.projection_model_versions for each row execute function private.protect_projection_model_version();

create or replace function private.valid_projection_recipient(
  p_venture uuid,
  p_recipient uuid,
  p_match uuid,
  p_introduction uuid,
  p_visibility text
) returns boolean language sql stable security definer set search_path='' as $$
  select
    case
      when p_visibility='exact' then exists(
        select 1 from public.introductions i
        where i.id=p_introduction and i.venture_id=p_venture
          and i.status in ('accepted','completed')
          and p_recipient in (i.requested_by,i.recipient_id)
      )
      when p_match is not null then exists(
        select 1 from public.match_snapshots m
        where m.id=p_match and m.venture_id=p_venture and m.reviewer_id=p_recipient and m.eligible
      )
      when p_introduction is not null then exists(
        select 1 from public.introductions i
        where i.id=p_introduction and i.venture_id=p_venture
          and p_recipient in (i.requested_by,i.recipient_id)
      )
      else exists(
        select 1 from public.review_assignments r where r.venture_id=p_venture and r.reviewer_id=p_recipient
        union all
        select 1 from public.reviewer_assignments r where r.venture_id=p_venture and r.reviewer_id=p_recipient
      )
    end
$$;

create or replace function private.validate_projection_share() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if not exists(select 1 from public.projection_runs r where r.id=new.run_id and r.venture_id=new.venture_id) then
    raise exception 'projection run does not belong to the venture';
  end if;
  if not private.valid_projection_recipient(new.venture_id,new.recipient_id,new.match_id,new.introduction_id,new.visibility) then
    raise exception 'recipient is not eligible for this projection share';
  end if;
  return new;
end $$;
create trigger projection_share_valid before insert or update on public.projection_shares for each row execute function private.validate_projection_share();

create or replace function private.audit_projection_share() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata)
  values(
    (select auth.uid()),
    case when tg_op='INSERT' then 'projection_shared' when new.revoked_at is distinct from old.revoked_at then 'projection_share_revoked' else 'projection_share_updated' end,
    'projection_share',new.id,
    jsonb_build_object('run_id',new.run_id,'venture_id',new.venture_id,'visibility',new.visibility,'recipient_id',new.recipient_id)
  );
  return new;
end $$;
create trigger projection_share_audit after insert or update on public.projection_shares for each row execute function private.audit_projection_share();

create or replace function private.audit_projection_run() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata)
  values(new.created_by,'projection_calculated','projection_run',new.id,jsonb_build_object('goal_id',new.goal_id,'model_version',new.model_version,'input_kind',new.input_kind));
  return new;
end $$;
create trigger projection_run_audit after insert on public.projection_runs for each row execute function private.audit_projection_run();

insert into public.projection_model_versions(version,name,config,active)
values('2026.2','Goal Attainment Likelihood 2026.2',jsonb_build_object(
  'simulations',10000,
  'trend','theil_sen',
  'variability','median_absolute_deviation',
  'percentiles',jsonb_build_array(10,50,90),
  'data_backed_minimum_observations',3,
  'data_backed_minimum_span_days',60
),true)
on conflict (version) do nothing;

create or replace function public.activate_projection_model(p_version text) returns void
language plpgsql security definer set search_path='' as $$
begin
  if not private.is_platform_admin() then raise exception 'platform administrator with MFA required'; end if;
  if not exists(select 1 from public.projection_model_versions where version=p_version) then raise exception 'unknown projection model'; end if;
  update public.projection_model_versions set active=false where active;
  update public.projection_model_versions set active=true where version=p_version;
  insert into public.audit_events(actor_id,action,entity_type,metadata)
  values((select auth.uid()),'projection_model_activated','projection_model',jsonb_build_object('version',p_version));
end $$;
revoke all on function public.activate_projection_model(text) from public;
grant execute on function public.activate_projection_model(text) to authenticated;

create or replace function public.get_shared_projection(p_run_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare shared public.projection_shares%rowtype;
declare run public.projection_runs%rowtype;
declare response jsonb;
begin
  if (select auth.uid()) is null then raise exception 'authentication required'; end if;
  select * into shared from public.projection_shares s
  where s.run_id=p_run_id and s.recipient_id=(select auth.uid())
    and s.revoked_at is null and s.expires_at>now()
  order by case when s.visibility='exact' then 0 else 1 end,s.created_at desc limit 1;
  if not found then raise exception 'projection share unavailable'; end if;
  select * into run from public.projection_runs where id=p_run_id;
  response=jsonb_build_object(
    'id',run.id,'ventureId',run.venture_id,'goalId',run.goal_id,
    'modelVersion',run.model_version,'scenario',run.scenario,'horizonMonths',run.horizon_months,
    'inputKind',run.input_kind,'probability',run.probability,'confidence',run.confidence,
    'statusBand',run.status_band,'indexedSeries',run.indexed_series,
    'exactSeries',case when shared.visibility='exact' then run.exact_series else null end,
    'drivers',run.drivers,'limitations',run.limitations,'sensitivity',run.sensitivity,
    'expectedTargetDate',run.expected_target_date,'calculatedAt',run.calculated_at,'staleAfter',run.stale_after,'visibility',shared.visibility
  );
  insert into public.audit_events(actor_id,action,entity_type,entity_id,metadata)
  values((select auth.uid()),'projection_viewed','projection_run',run.id,jsonb_build_object('visibility',shared.visibility));
  return response;
end $$;
revoke all on function public.get_shared_projection(uuid) from public;
grant execute on function public.get_shared_projection(uuid) to authenticated;

alter table public.venture_metrics enable row level security;
alter table public.metric_observations enable row level security;
alter table public.projection_goals enable row level security;
alter table public.goal_evidence_links enable row level security;
alter table public.projection_model_versions enable row level security;
alter table public.projection_runs enable row level security;
alter table public.projection_shares enable row level security;

create policy venture_metrics_owner on public.venture_metrics for all to authenticated
using(private.owns_venture(venture_id) or private.is_platform_admin())
with check(private.owns_venture(venture_id) and created_by=(select auth.uid()));
create policy metric_observations_owner on public.metric_observations for all to authenticated
using(private.owns_venture(venture_id) or private.is_platform_admin())
with check(private.owns_venture(venture_id) and created_by=(select auth.uid()));
create policy projection_goals_owner on public.projection_goals for all to authenticated
using(private.owns_venture(venture_id) or private.is_platform_admin())
with check(private.owns_venture(venture_id) and created_by=(select auth.uid()));
create policy goal_evidence_owner on public.goal_evidence_links for all to authenticated
using(exists(select 1 from public.projection_goals g where g.id=goal_id and (private.owns_venture(g.venture_id) or private.is_platform_admin())))
with check(linked_by=(select auth.uid()) and exists(select 1 from public.projection_goals g where g.id=goal_id and private.owns_venture(g.venture_id)));
create policy projection_models_read on public.projection_model_versions for select to authenticated using(true);
create policy projection_runs_owner_read on public.projection_runs for select to authenticated
using(private.owns_venture(venture_id) or private.is_platform_admin());
create policy projection_shares_participant_read on public.projection_shares for select to authenticated
using(shared_by=(select auth.uid()) or recipient_id=(select auth.uid()) or private.is_platform_admin());
create policy projection_shares_owner_insert on public.projection_shares for insert to authenticated
with check(shared_by=(select auth.uid()) and private.owns_venture(venture_id));
create policy projection_shares_owner_update on public.projection_shares for update to authenticated
using(shared_by=(select auth.uid()) and private.owns_venture(venture_id))
with check(shared_by=(select auth.uid()) and private.owns_venture(venture_id));

insert into public.feature_flags(key,description,enabled,rules)
values
  ('venture_projections','Evidence-backed goal attainment projections',false,'{}'),
  ('projection_ai','AI explanations for deterministic projection results',false,'{}')
on conflict (key) do nothing;

commit;
