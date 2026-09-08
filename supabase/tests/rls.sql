-- Execute with `supabase test db` after `supabase db reset` or against a linked
-- disposable project. These checks exercise the authorization rules with two
-- distinct authenticated identities; never run against production data.

begin;
select plan(8);

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'tenant@test.bricxley.invalid', '', now(), '{}', '{"full_name":"Tenant Test"}'),
  ('22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'owner@test.bricxley.invalid', '', now(), '{}', '{"full_name":"Owner Test"}'),
  ('33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'intruder@test.bricxley.invalid', '', now(), '{}', '{"full_name":"Intruder Test"}');

insert into public.user_roles (user_id, role) values
  ('11111111-1111-1111-1111-111111111111', 'tenant'),
  ('22222222-2222-2222-2222-222222222222', 'owner'),
  ('33333333-3333-3333-3333-333333333333', 'tenant');

insert into public.properties (id, manager_id, listed_as, title, locality, property_type, monthly_rent, status)
values ('rls-property', '22222222-2222-2222-2222-222222222222', 'owner', 'RLS test 2BHK home', 'Kondapur', 'Apartment', 32000, 'PUBLISHED');

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
select lives_ok($$ select public.create_interest('rls-property', current_date + 7, 2, 'Working Professional') $$, 'tenant can submit interest');
select is((select count(*) from public.interests), 1::bigint, 'tenant sees own interest');
select throws_ok($$ select public.accept_interest((select id from public.interests limit 1)) $$, 'tenant cannot accept their own interest');

select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
select lives_ok($$ select public.accept_interest((select id from public.interests limit 1)) $$, 'owner can accept interest on their own listing');
select is((select count(*) from public.conversations), 1::bigint, 'acceptance creates exactly one conversation');
select is((select count(*) from public.matches), 1::bigint, 'acceptance creates exactly one match');

select set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
select is((select count(*) from public.interests), 0::bigint, 'unrelated tenant cannot read another interest');
select throws_ok($$ select public.request_visit((select id from public.interests limit 1), now() + interval '2 days') $$, 'unrelated tenant cannot schedule another match visit');

select * from finish();
rollback;
