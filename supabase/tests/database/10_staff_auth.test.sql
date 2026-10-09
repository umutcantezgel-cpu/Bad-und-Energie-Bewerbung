-- Staff, Allowlist, Auth-Hook, Staff nur per Einladung und Schutz des letzten Admins.
begin;
create extension if not exists pgtap with schema extensions;
select plan(11);

insert into private.staff_email_allowlist (email, role) values
  ('admin@test.local', 'admin'),
  ('recruiter@test.local', 'recruiter'),
  ('selfsignup@test.local', 'admin');

select is(
  private.hook_before_user_created('{"user": {"email": "Admin@Test.local"}}'::jsonb),
  '{}'::jsonb,
  'Hook lässt Allowlist-Adresse zu (unabhängig von Groß-/Kleinschreibung)'
);

select is(
  (private.hook_before_user_created('{"user": {"email": "fremd@example.com"}}'::jsonb) -> 'error' ->> 'http_code')::int,
  403,
  'Hook lehnt fremde Adresse mit 403 ab'
);

select is(
  (private.hook_before_user_created('{"user": {}}'::jsonb) -> 'error' ->> 'http_code')::int,
  403,
  'Hook lehnt fehlende Adresse ab'
);

-- Eingeladene Nutzer (ohne Passwort) und ein Nutzer ohne Allowlist-Eintrag.
insert into auth.users (id, email, aud, role) values
  ('11111111-1111-4111-8111-111111111111', 'admin@test.local', 'authenticated', 'authenticated'),
  ('22222222-2222-4222-8222-222222222222', 'recruiter@test.local', 'authenticated', 'authenticated'),
  ('44444444-4444-4444-8444-444444444444', 'outsider@test.local', 'authenticated', 'authenticated');

-- Selbst registriert (mit Passwort) auf einer Allowlist-Adresse.
insert into auth.users (id, email, aud, role, encrypted_password) values
  ('66666666-6666-4666-8666-666666666666', 'selfsignup@test.local', 'authenticated', 'authenticated',
   '$2a$10$abcdefghijklmnopqrstuuabcdefghijklmnopqrstuvwxyzabcde');

select is(
  (select role::text from public.staff where user_id = '11111111-1111-4111-8111-111111111111'),
  'admin',
  'Eingeladener Nutzer aus der Allowlist bekommt eine Staff-Zeile mit Rolle'
);

select is(
  (select count(*) from public.staff where user_id = '44444444-4444-4444-8444-444444444444'),
  0::bigint,
  'Auth-Nutzer ohne Allowlist-Eintrag wird kein Staff'
);

select is(
  (select count(*) from public.staff where user_id = '66666666-6666-4666-8666-666666666666'),
  0::bigint,
  'Selbst registriertes Konto mit Passwort wird nie Staff, auch auf einer Allowlist-Adresse'
);

select throws_ok(
  $$ update public.staff set role = 'viewer' where user_id = '11111111-1111-4111-8111-111111111111' $$,
  'P0001',
  'last_admin_protected',
  'Letzter Admin kann nicht herabgestuft werden'
);

select throws_ok(
  $$ update public.staff set is_active = false, deactivated_at = now() where user_id = '11111111-1111-4111-8111-111111111111' $$,
  'P0001',
  'last_admin_protected',
  'Letzter Admin kann nicht deaktiviert werden'
);

update public.staff set role = 'admin' where user_id = '22222222-2222-4222-8222-222222222222';

select lives_ok(
  $$ update public.staff set role = 'viewer' where user_id = '11111111-1111-4111-8111-111111111111' $$,
  'Admin kann herabgestuft werden, wenn ein anderer aktiver Admin existiert'
);

select throws_ok(
  $$ delete from public.staff where user_id = '22222222-2222-4222-8222-222222222222' $$,
  'P0001',
  'last_admin_protected',
  'Letzter Admin kann nicht gelöscht werden'
);

select throws_ok(
  $$ delete from auth.users where id = '22222222-2222-4222-8222-222222222222' $$,
  'P0001',
  'last_admin_protected',
  'Letzter Admin kann auch über das Löschen des Auth-Nutzers nicht entfernt werden'
);

select * from finish();
rollback;
