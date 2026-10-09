-- Rechte: RLS überall, keine Tabellenrechte für anon/service_role, genaue Spaltenrechte,
-- RPCs nur für service_role, keine Storage-Policies, genaue Realtime-Policy.
-- Katalogspalten sind vom Typ name (Collation "C"); für results_eq daher collate "default".
begin;
create extension if not exists pgtap with schema extensions;
select plan(23);

select is(
  (select count(*) from pg_tables where schemaname in ('public', 'private') and not rowsecurity),
  0::bigint,
  'RLS ist auf allen Tabellen in public und private aktiv'
);

select is(
  (select count(*) from information_schema.role_table_grants
    where grantee in ('anon', 'service_role') and table_schema in ('public', 'private')),
  0::bigint,
  'anon und service_role haben keine Tabellenrechte in public/private'
);

select is(
  (select count(*) from information_schema.role_table_grants
    where grantee = 'authenticated' and table_schema = 'private'),
  0::bigint,
  'authenticated hat keine Tabellenrechte in private'
);

-- has_*_privilege berücksichtigt auch Rechte über PUBLIC und Spaltenrechte.
select is(
  (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
     cross join (values ('anon'), ('service_role')) r(rol)
    where n.nspname in ('public', 'private') and c.relkind in ('r', 'p', 'v', 'm', 'f')
      and (has_table_privilege(r.rol, c.oid, 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN')
           or has_any_column_privilege(r.rol, c.oid, 'SELECT, INSERT, UPDATE, REFERENCES'))),
  0::bigint,
  'anon und service_role: keine Tabellen- oder Spaltenrechte, auch nicht über PUBLIC'
);

select is(
  (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'private' and c.relkind in ('r', 'p')
      and has_any_column_privilege('authenticated', c.oid, 'SELECT, INSERT, UPDATE, REFERENCES')),
  0::bigint,
  'authenticated: keine Spaltenrechte in private'
);

select is(
  (select count(*) from information_schema.role_table_grants
    where grantee = 'authenticated' and table_schema = 'public' and privilege_type <> 'SELECT'),
  0::bigint,
  'authenticated hat in public auf Tabellenebene nur SELECT'
);

select results_eq(
  $$ select table_name::text collate "default", column_name::text collate "default",
            privilege_type::text collate "default"
       from information_schema.column_privileges
      where grantee = 'authenticated' and table_schema = 'public' and privilege_type <> 'SELECT'
      order by 1, 2, 3 $$,
  $$ values ('application_notes', 'application_id', 'INSERT'),
            ('application_notes', 'body', 'INSERT'),
            ('applications', 'assigned_to', 'UPDATE'),
            ('applications', 'rating', 'UPDATE'),
            ('applications', 'rejection_notified_at', 'UPDATE'),
            ('applications', 'stage', 'UPDATE') $$,
  'authenticated darf genau diese Spalten schreiben'
);

select is(
  (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('v', 'm')),
  0::bigint,
  'keine Views in public (würden RLS umgehen)'
);

select is(
  (select count(*) from pg_tables t
    where t.schemaname = 'public'
      and not exists (
        select 1 from pg_policies p
        where p.schemaname = 'public' and p.tablename = t.tablename
          and p.permissive = 'RESTRICTIVE' and p.cmd = 'ALL'
          and p.roles = '{authenticated}' and p.qual like '%is_aal2%'
      )),
  0::bigint,
  'jede Tabelle in public hat die restriktive aal2-Policy'
);

select ok(
  not has_schema_privilege('anon', 'private', 'usage')
  and not has_schema_privilege('service_role', 'private', 'usage'),
  'anon und service_role haben kein USAGE auf private'
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
  (select array_agg(p.proname::text collate "default" order by p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'private' and has_function_privilege('authenticated', p.oid, 'execute')),
  array['is_aal2', 'is_staff', 'staff_role_at_least'],
  'authenticated darf in private nur die RLS-Helper ausführen'
);

select is(
  (select array_agg(p.proname::text collate "default" order by p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and has_function_privilege('service_role', p.oid, 'execute')),
  array['rpc_rate_limit_hit', 'rpc_submit_application', 'rpc_submit_follow_up'],
  'service_role darf in public genau die drei rpc_* ausführen'
);

select ok(
  has_function_privilege('supabase_auth_admin', 'private.hook_before_user_created(jsonb)', 'execute')
  and has_schema_privilege('supabase_auth_admin', 'private', 'usage')
  and has_table_privilege('supabase_auth_admin', 'private.staff_email_allowlist', 'select'),
  'supabase_auth_admin kann den Auth-Hook ausführen und die Allowlist lesen'
);

select results_eq(
  $$ select policyname::text collate "default", cmd::text collate "default", roles::text collate "default"
       from pg_policies where schemaname = 'private' order by 1 $$,
  $$ values ('auth_admin_reads_allowlist', 'SELECT', '{supabase_auth_admin}') $$,
  'in private gibt es genau eine Policy (Hook liest Allowlist)'
);

select is(
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'private') and p.prosecdef
      and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')),
  0::bigint,
  'alle SECURITY-DEFINER-Funktionen haben einen festen search_path'
);

select is(
  (select count(*) from pg_default_acl d, aclexplode(d.defaclacl) a
    where d.defaclrole = 'postgres'::regrole
      and d.defaclnamespace = 'public'::regnamespace
      and a.grantee in ('anon'::regrole, 'authenticated'::regrole, 'service_role'::regrole)),
  0::bigint,
  'keine Default-Privileges für API-Rollen auf neue Objekte in public'
);

select results_eq(
  $$ select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'application-files' $$,
  $$ values (false, 10485760::bigint,
             array['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp']::text[]) $$,
  'Bucket application-files (aus der Migration): privat, 10 MiB, nur PDF und Bilder'
);

select is(
  (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects'),
  0::bigint,
  'Storage: keine Policies auf storage.objects (Zugriff nur über Server und staff_*-RPC)'
);

select results_eq(
  $$ select policyname::text collate "default", cmd::text collate "default", roles::text collate "default"
       from pg_policies where schemaname = 'realtime' and tablename = 'messages' order by 1 $$,
  $$ values ('staff_receive_inbox', 'SELECT', '{authenticated}') $$,
  'Realtime: genau eine Lese-Policy auf realtime.messages'
);

select ok(
  (select qual like '%staff:inbox%' and qual like '%is_staff%' and qual like '%is_aal2%'
     from pg_policies where schemaname = 'realtime' and policyname = 'staff_receive_inbox'),
  'Realtime-Policy verlangt Topic staff:inbox, Staff und aal2'
);

select is(
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'private' and p.proname in ('protect_last_admin')
      and p.prosrc like '%pg_advisory_xact_lock%')
  + (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'rpc_submit_application'
      and p.prosrc like '%''intake:''%' and p.prosrc like '%''confirm:''%'),
  2::bigint,
  'Advisory-Locks für letzten Admin, Intake-Key und Bestätigungs-Obergrenze'
);

select * from finish();
rollback;
