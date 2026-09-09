-- Bricxley's canonical account, role, rental workflow and RLS schema.
-- Apply with `supabase db push` after linking the intended project.

create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('tenant', 'owner', 'agent', 'admin');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.interest_status as enum ('DRAFT', 'SUBMITTED', 'ACCEPTED', 'DECLINED', 'WITHDRAWN', 'EXPIRED');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.visit_status as enum ('REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.listing_status as enum ('DRAFT', 'PUBLISHED', 'PAUSED', 'RENTED', 'ARCHIVED');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique check (phone is null or phone ~ '^\+[1-9][0-9]{7,14}$'),
  phone_verified boolean not null default false,
  email text,
  email_verified boolean not null default false,
  google_sub text unique,
  full_name text,
  avatar_url text,
  primary_role public.app_role,
  last_active_role public.app_role,
  identity_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.properties (
  id text primary key default ('property-' || replace(gen_random_uuid()::text, '-', '')),
  manager_id uuid not null references public.profiles(id) on delete restrict,
  listed_as public.app_role not null check (listed_as in ('owner', 'agent')),
  title text not null check (char_length(title) between 6 and 160),
  locality text not null,
  city text not null default 'Hyderabad',
  property_type text not null,
  monthly_rent integer not null check (monthly_rent >= 0),
  deposit integer not null default 0 check (deposit >= 0),
  brokerage integer not null default 0 check (brokerage >= 0),
  description text,
  status public.listing_status not null default 'DRAFT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_properties (
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_id text not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references public.properties(id) on delete cascade,
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  lister_id uuid not null references public.profiles(id) on delete restrict,
  tenant_name text not null default 'Bricxley tenant',
  move_in_date date not null,
  occupants smallint not null check (occupants between 1 and 20),
  occupation_type text not null,
  lease_preference text,
  message text check (char_length(message) <= 2000),
  status public.interest_status not null default 'SUBMITTED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists one_active_interest_per_property
  on public.interests(tenant_id, property_id)
  where status in ('DRAFT', 'SUBMITTED', 'ACCEPTED');

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  interest_id uuid not null unique references public.interests(id) on delete cascade,
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  lister_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  interest_id uuid not null unique references public.interests(id) on delete cascade,
  property_id text not null references public.properties(id) on delete cascade,
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  lister_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in ('message', 'system')),
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);

create table if not exists public.contact_consents (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  shared_at timestamptz not null default now(),
  unique (conversation_id, user_id)
);

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references public.properties(id) on delete cascade,
  interest_id uuid not null references public.interests(id) on delete cascade,
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  lister_id uuid not null references public.profiles(id) on delete cascade,
  scheduled_at timestamptz not null,
  status public.visit_status not null default 'REQUESTED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.auth_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  phone_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- This table is intentionally server-only. It is used solely by the explicitly
-- enabled local/test adapter and stores salted hashes, never OTP plaintext.
create table if not exists public.development_otp_challenges (
  phone text primary key check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  code_hash text not null,
  attempts smallint not null default 0 check (attempts >= 0),
  request_count smallint not null default 1 check (request_count > 0),
  requested_window_started_at timestamptz not null default now(),
  resend_available_at timestamptz not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
drop trigger if exists properties_updated_at on public.properties;
create trigger properties_updated_at before update on public.properties for each row execute procedure public.set_updated_at();
drop trigger if exists interests_updated_at on public.interests;
create trigger interests_updated_at before update on public.interests for each row execute procedure public.set_updated_at();
drop trigger if exists visits_updated_at on public.visits;
create trigger visits_updated_at before update on public.visits for each row execute procedure public.set_updated_at();
drop trigger if exists dev_otp_updated_at on public.development_otp_challenges;
create trigger dev_otp_updated_at before update on public.development_otp_challenges for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, email_verified, google_sub, full_name, avatar_url, last_login_at)
  values (
    new.id,
    new.email,
    coalesce(new.email_confirmed_at is not null, false),
    new.raw_user_meta_data ->> 'sub',
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    now()
  ) on conflict (id) do update set
    email = excluded.email,
    email_verified = excluded.email_verified,
    google_sub = coalesce(excluded.google_sub, public.profiles.google_sub),
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    last_login_at = now();
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.has_role(required_role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id = auth.uid() and role = required_role)
  or exists(select 1 from public.user_roles where user_id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_property_manager(property_id text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.properties where id = property_id and manager_id = auth.uid());
$$;

create or replace function public.is_conversation_participant(conversation_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.conversations where id = conversation_id and (tenant_id = auth.uid() or lister_id = auth.uid()));
$$;

create or replace function public.enable_my_role(requested_role public.app_role)
returns public.profiles language plpgsql security definer set search_path = public as $$
declare updated_profile public.profiles;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if requested_role = 'admin' then raise exception 'Admin role cannot be self-assigned'; end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), requested_role) on conflict do nothing;
  update public.profiles
  set primary_role = coalesce(primary_role, requested_role), last_active_role = requested_role, last_login_at = now()
  where id = auth.uid() returning * into updated_profile;
  return updated_profile;
end; $$;

create or replace function public.create_interest(
  p_property_id text, p_move_in_date date, p_occupants smallint,
  p_occupation_type text, p_lease_preference text default null, p_message text default null
)
returns public.interests language plpgsql security definer set search_path = public as $$
declare listing public.properties; created_interest public.interests;
begin
  if auth.uid() is null or not public.has_role('tenant') then raise exception 'Only tenants can submit interest'; end if;
  select * into listing from public.properties where id = p_property_id and status = 'PUBLISHED';
  if not found then raise exception 'This home is currently unavailable'; end if;
  insert into public.interests (property_id, tenant_id, lister_id, tenant_name, move_in_date, occupants, occupation_type, lease_preference, message)
  values (listing.id, auth.uid(), listing.manager_id, coalesce((select full_name from public.profiles where id = auth.uid()), 'Bricxley tenant'), p_move_in_date, p_occupants, p_occupation_type, p_lease_preference, p_message)
  returning * into created_interest;
  insert into public.notifications (user_id, type, title, message, entity_id)
  values (listing.manager_id, 'INTEREST_RECEIVED', 'New interest received', 'A tenant is interested in your property.', created_interest.id);
  return created_interest;
exception when unique_violation then raise exception 'You already have an active interest in this home';
end; $$;

create or replace function public.accept_interest(p_interest_id uuid)
returns public.interests language plpgsql security definer set search_path = public as $$
declare item public.interests; conversation public.conversations;
begin
  select * into item from public.interests where id = p_interest_id for update;
  if not found then raise exception 'Interest not found'; end if;
  if item.lister_id <> auth.uid() then raise exception 'You cannot manage this interest'; end if;
  if item.status <> 'SUBMITTED' then raise exception 'Only a submitted interest can be accepted'; end if;
  update public.interests set status = 'ACCEPTED' where id = item.id returning * into item;
  insert into public.matches (interest_id, tenant_id, lister_id) values (item.id, item.tenant_id, item.lister_id) on conflict (interest_id) do nothing;
  insert into public.conversations (interest_id, property_id, tenant_id, lister_id)
  values (item.id, item.property_id, item.tenant_id, item.lister_id)
  on conflict (interest_id) do update set updated_at = now() returning * into conversation;
  insert into public.messages (conversation_id, sender_id, kind, body)
  select conversation.id, null, 'system', 'Match created ✓ You can now chat and schedule a visit.'
  where not exists (select 1 from public.messages where conversation_id = conversation.id and kind = 'system');
  insert into public.notifications (user_id, type, title, message, entity_id)
  values (item.tenant_id, 'INTEREST_ACCEPTED', 'Your interest was accepted', 'You can now continue securely in Bricxley chat.', item.id);
  return item;
end; $$;

create or replace function public.decline_interest(p_interest_id uuid)
returns public.interests language plpgsql security definer set search_path = public as $$
declare item public.interests;
begin
  update public.interests set status = 'DECLINED' where id = p_interest_id and lister_id = auth.uid() and status = 'SUBMITTED' returning * into item;
  if not found then raise exception 'Interest cannot be declined'; end if;
  insert into public.notifications (user_id, type, title, message, entity_id)
  values (item.tenant_id, 'INTEREST_DECLINED', 'Interest update', 'The listing manager declined this interest.', item.id);
  return item;
end; $$;

create or replace function public.withdraw_interest(p_interest_id uuid)
returns public.interests language plpgsql security definer set search_path = public as $$
declare item public.interests;
begin
  update public.interests set status = 'WITHDRAWN' where id = p_interest_id and tenant_id = auth.uid() and status = 'SUBMITTED' returning * into item;
  if not found then raise exception 'Interest cannot be withdrawn'; end if;
  return item;
end; $$;

create or replace function public.request_visit(p_interest_id uuid, p_scheduled_at timestamptz)
returns public.visits language plpgsql security definer set search_path = public as $$
declare item public.interests; created_visit public.visits;
begin
  select * into item from public.interests where id = p_interest_id;
  if not found or item.status <> 'ACCEPTED' then raise exception 'A visit can be scheduled after a match'; end if;
  if auth.uid() <> item.tenant_id and auth.uid() <> item.lister_id then raise exception 'You cannot schedule this visit'; end if;
  if p_scheduled_at <= now() then raise exception 'Choose a future time for the visit'; end if;
  insert into public.visits (property_id, interest_id, tenant_id, lister_id, scheduled_at)
  values (item.property_id, item.id, item.tenant_id, item.lister_id, p_scheduled_at) returning * into created_visit;
  insert into public.notifications (user_id, type, title, message, entity_id)
  values (case when auth.uid() = item.tenant_id then item.lister_id else item.tenant_id end,
    'VISIT_REQUESTED', 'Visit requested', 'A visit time needs your confirmation.', created_visit.id);
  return created_visit;
end; $$;

create or replace function public.confirm_visit(p_visit_id uuid)
returns public.visits language plpgsql security definer set search_path = public as $$
declare item public.visits; conversation_id uuid;
begin
  update public.visits set status = 'CONFIRMED' where id = p_visit_id and status = 'REQUESTED'
    and (tenant_id = auth.uid() or lister_id = auth.uid()) returning * into item;
  if not found then raise exception 'Visit cannot be confirmed'; end if;
  select id into conversation_id from public.conversations where interest_id = item.interest_id;
  insert into public.messages (conversation_id, sender_id, kind, body)
  values (conversation_id, null, 'system', 'Visit Confirmed ✓');
  insert into public.notifications (user_id, type, title, message, entity_id)
  values (case when auth.uid() = item.tenant_id then item.lister_id else item.tenant_id end,
    'VISIT_CONFIRMED', 'Visit confirmed', 'Your Bricxley visit has been confirmed.', item.id);
  return item;
end; $$;

create or replace function public.create_property(
  p_title text, p_locality text, p_property_type text, p_monthly_rent integer,
  p_deposit integer, p_brokerage integer, p_description text, p_listed_as public.app_role
)
returns public.properties language plpgsql security definer set search_path = public as $$
declare created_property public.properties;
begin
  if p_listed_as not in ('owner', 'agent') or not public.has_role(p_listed_as) then raise exception 'You cannot create this listing'; end if;
  insert into public.properties (manager_id, listed_as, title, locality, property_type, monthly_rent, deposit, brokerage, description)
  values (auth.uid(), p_listed_as, p_title, p_locality, p_property_type, p_monthly_rent, p_deposit, p_brokerage, p_description)
  returning * into created_property;
  return created_property;
end; $$;

create or replace function public.notify_message_recipient()
returns trigger language plpgsql security definer set search_path = public as $$
declare recipient uuid;
begin
  if new.kind <> 'message' or new.sender_id is null then return new; end if;
  select case when tenant_id = new.sender_id then lister_id else tenant_id end into recipient from public.conversations where id = new.conversation_id;
  insert into public.notifications (user_id, type, title, message, entity_id)
  values (recipient, 'NEW_MESSAGE', 'New Bricxley message', 'You have a new secure message.', new.conversation_id);
  return new;
end; $$;
drop trigger if exists on_message_created on public.messages;
create trigger on_message_created after insert on public.messages for each row execute procedure public.notify_message_recipient();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.properties enable row level security;
alter table public.saved_properties enable row level security;
alter table public.interests enable row level security;
alter table public.matches enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.contact_consents enable row level security;
alter table public.visits enable row level security;
alter table public.notifications enable row level security;
alter table public.auth_audit_log enable row level security;
alter table public.development_otp_challenges enable row level security;

create policy "profiles are private" on public.profiles for select using (id = auth.uid());
create policy "profiles update self" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "roles are private" on public.user_roles for select using (user_id = auth.uid());
create policy "public published properties" on public.properties for select using (status = 'PUBLISHED' or manager_id = auth.uid());
create policy "saved properties are private" on public.saved_properties for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "interest participants can read" on public.interests for select using (tenant_id = auth.uid() or lister_id = auth.uid());
create policy "match participants can read" on public.matches for select using (tenant_id = auth.uid() or lister_id = auth.uid());
create policy "conversation participants can read" on public.conversations for select using (tenant_id = auth.uid() or lister_id = auth.uid());
create policy "conversation participants read messages" on public.messages for select using (public.is_conversation_participant(conversation_id));
create policy "participants send messages" on public.messages for insert with check (sender_id = auth.uid() and kind = 'message' and public.is_conversation_participant(conversation_id));
create policy "participants share contact" on public.contact_consents for select using (public.is_conversation_participant(conversation_id));
create policy "participants record own consent" on public.contact_consents for insert with check (user_id = auth.uid() and public.is_conversation_participant(conversation_id));
create policy "visit participants can read" on public.visits for select using (tenant_id = auth.uid() or lister_id = auth.uid());
create policy "notifications are private" on public.notifications for select using (user_id = auth.uid());
create policy "users mark own notifications read" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke all on public.development_otp_challenges from anon, authenticated;
revoke all on public.auth_audit_log from anon, authenticated;
grant usage on schema public to authenticated;
grant select, insert, delete on public.saved_properties to authenticated;
grant select on public.profiles, public.user_roles, public.properties, public.interests, public.matches, public.conversations, public.messages, public.contact_consents, public.visits, public.notifications to authenticated;
grant insert on public.messages, public.contact_consents to authenticated;
grant update on public.profiles, public.notifications to authenticated;
grant execute on function public.enable_my_role(public.app_role), public.create_interest(text,date,smallint,text,text,text), public.accept_interest(uuid), public.decline_interest(uuid), public.withdraw_interest(uuid), public.request_visit(uuid,timestamptz), public.confirm_visit(uuid), public.create_property(text,text,text,integer,integer,integer,text,public.app_role) to authenticated;

-- Property media is private by default. The listing manager can upload only to
-- their own folder; signed URLs can be added when a listing is published.
insert into storage.buckets (id, name, public)
values ('property-media', 'property-media', false)
on conflict (id) do nothing;
create policy "listing managers upload own media" on storage.objects for insert to authenticated
  with check (bucket_id = 'property-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "listing managers read own media" on storage.objects for select to authenticated
  using (bucket_id = 'property-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "listing managers delete own media" on storage.objects for delete to authenticated
  using (bucket_id = 'property-media' and (storage.foldername(name))[1] = auth.uid()::text);
