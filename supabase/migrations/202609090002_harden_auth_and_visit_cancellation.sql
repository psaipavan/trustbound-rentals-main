-- Security hardening identified during the pre-deployment authorization audit.
-- This migration is additive so it is safe to apply after the initial schema.

-- A user may change only non-verification profile fields, and may choose only
-- from roles that have already been granted to that same account.
revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url, last_active_role) on public.profiles to authenticated;

drop policy if exists "profiles update self" on public.profiles;
create policy "profiles update safe self fields" on public.profiles
  for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and (
      last_active_role is null
      or exists (
        select 1 from public.user_roles
        where user_id = auth.uid() and role = last_active_role
      )
    )
  );

-- Security-definer functions must never inherit PostgreSQL's default PUBLIC
-- execute privilege. The explicit grants below leave them callable only by an
-- authenticated Bricxley session.
revoke all on function public.enable_my_role(public.app_role) from public, anon;
revoke all on function public.create_interest(text, date, smallint, text, text, text) from public, anon;
revoke all on function public.accept_interest(uuid) from public, anon;
revoke all on function public.decline_interest(uuid) from public, anon;
revoke all on function public.withdraw_interest(uuid) from public, anon;
revoke all on function public.request_visit(uuid, timestamptz) from public, anon;
revoke all on function public.confirm_visit(uuid) from public, anon;
revoke all on function public.create_property(text, text, text, integer, integer, integer, text, public.app_role) from public, anon;

create or replace function public.accept_interest(p_interest_id uuid)
returns public.interests language plpgsql security definer set search_path = public as $$
declare item public.interests; conversation public.conversations;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
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

create or replace function public.request_visit(p_interest_id uuid, p_scheduled_at timestamptz)
returns public.visits language plpgsql security definer set search_path = public as $$
declare item public.interests; created_visit public.visits;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
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
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.visits set status = 'CONFIRMED' where id = p_visit_id and status = 'REQUESTED'
    and (tenant_id = auth.uid() or lister_id = auth.uid()) returning * into item;
  if not found then raise exception 'Visit cannot be confirmed'; end if;
  select id into conversation_id from public.conversations where interest_id = item.interest_id;
  if conversation_id is not null then
    insert into public.messages (conversation_id, sender_id, kind, body)
    values (conversation_id, null, 'system', 'Visit Confirmed ✓');
  end if;
  insert into public.notifications (user_id, type, title, message, entity_id)
  values (case when auth.uid() = item.tenant_id then item.lister_id else item.tenant_id end,
    'VISIT_CONFIRMED', 'Visit confirmed', 'Your Bricxley visit has been confirmed.', item.id);
  return item;
end; $$;

create or replace function public.cancel_visit(p_visit_id uuid)
returns public.visits language plpgsql security definer set search_path = public as $$
declare item public.visits; conversation_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.visits set status = 'CANCELLED' where id = p_visit_id
    and status in ('REQUESTED', 'CONFIRMED')
    and (tenant_id = auth.uid() or lister_id = auth.uid()) returning * into item;
  if not found then raise exception 'Visit cannot be cancelled'; end if;
  select id into conversation_id from public.conversations where interest_id = item.interest_id;
  if conversation_id is not null then
    insert into public.messages (conversation_id, sender_id, kind, body)
    values (conversation_id, null, 'system', 'Visit cancelled');
  end if;
  insert into public.notifications (user_id, type, title, message, entity_id)
  values (case when auth.uid() = item.tenant_id then item.lister_id else item.tenant_id end,
    'VISIT_CANCELLED', 'Visit cancelled', 'A scheduled Bricxley visit was cancelled.', item.id);
  return item;
end; $$;

revoke all on function public.cancel_visit(uuid) from public, anon;
grant execute on function public.cancel_visit(uuid) to authenticated;
