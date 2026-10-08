-- Rechte: RLS überall, keine Tabellenrechte für anon/service_role, RPCs nur für service_role.
begin;
create extension if not exists pgtap with schema extensions;
select plan(16);

select is(
  (select count(*) from pg_tables where schemaname in ('public', 'private') and not rowsecurity),
  0::bigint,
  'RLS ist auf allen Tabellen in public und private aktiv'
);

select is(
  (select count(*) from information_schema.role_table_grants
    where grantee = 'anon' and table_schema in ('public', 'private')),
  0::bigint,
  'anon hat keine Tabellenrechte in public/private'
);

select is(
  (select count(*) from information_schema.role_table_grants
    where grantee = 'service_role' and table_schema in ('public', 'private')),
  0::bigint,
  'service_role hat keine Tabellenrechte in public/private'
);

select is(
  (select count(*) from information_schema.role_table_grants
    where grantee = 'authenticated' and table_schema = 'private'),
  0::bigint,
  'authenticated hat keine Tabellenrechte in private'
);

select is(
  (select count(*) from information_schema.role_table_grants
    where grantee = 'authenticated' and table_schema = 'public'
      and privilege_type in ('INSERT', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER')),
  0::bigint,
  'authenticated hat keine INSERT/DELETE/TRUNCATE-Tabellenrechte in public (nur Spaltenrechte)'
);

select is(
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'private') and has_function_privilege('anon', p.oid, 'execute')),
  0::bigint,
  'anon darf keine Funktion in public/private ausführen'
);

select is(
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and has_function_privilege('authenticated', p.oid, 'execute')),
  0::bigint,
  'authenticated darf keine Funktion in public ausführen'
);

select is(
  (select array_agg(p.proname::text order by p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'private' and has_function_privilege('authenticated', p.oid, 'execute')),
  array['is_aal2', 'is_staff', 'staff_role_at_least'],
  'authenticated darf in private nur die RLS-Helper ausführen'
);

select is(
  (select array_agg(p.proname::text order by p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and has_function_privilege('service_role', p.oid, 'execute')),
  array['rpc_rate_limit_hit', 'rpc_submit_application', 'rpc_submit_follow_up'],
  'service_role darf in public genau die drei rpc_* ausführen'
);

select ok(
  has_function_privilege('supabase_auth_admin', 'private.hook_before_user_created(jsonb)', 'execute'),
  'supabase_auth_admin darf den Auth-Hook ausführen'
);

select ok(
  not has_function_privilege('authenticated', 'private.hook_before_user_created(jsonb)', 'execute'),
  'authenticated darf den Auth-Hook nicht ausführen'
);

select is(
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'private') and p.prosecdef
      and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')),
  0::bigint,
  'alle SECURITY-DEFINER-Funktionen haben einen festen search_path'
);

select ok(
  exists (select 1 from storage.buckets where id = 'application-files' and not public and file_size_limit = 10485760),
  'Bucket application-files ist privat mit 10 MiB'
);

select is(
  (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects'
    and policyname = 'staff_read_application_files' and cmd = 'SELECT'),
  1::bigint,
  'Storage: nur eine Lese-Policy für Staff'
);

select is(
  (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects'
    and qual like '%application-files%' and cmd <> 'SELECT'),
  0::bigint,
  'Storage: keine Schreib-Policies für application-files'
);

select ok(
  exists (select 1 from pg_policies where schemaname = 'realtime' and tablename = 'messages' and policyname = 'staff_receive_inbox'),
  'Realtime: Policy für staff:inbox existiert'
);

select * from finish();
rollback;
