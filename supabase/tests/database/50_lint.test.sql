-- Statische Prüfung der Trigger-Funktionen mit plpgsql_check.
-- `supabase db lint` überspringt Funktionen mit Rückgabetyp trigger; hier werden sie je
-- Trigger mit ihrer Tabelle geprüft (Spalten von NEW/OLD, Typen, unbenutzte Variablen).
begin;
create extension if not exists pgtap with schema extensions;
create extension if not exists plpgsql_check with schema extensions;
select plan(1);

select is_empty(
  $$ select p.oid::regprocedure::text, t.tgrelid::regclass::text, c.level, c.message
       from pg_trigger t
       join pg_proc p on p.oid = t.tgfoid
       join pg_namespace n on n.oid = p.pronamespace
       join pg_language l on l.oid = p.prolang
       cross join lateral plpgsql_check_function_tb(p.oid, t.tgrelid) c
      where n.nspname = 'private' and l.lanname = 'plpgsql' and not t.tgisinternal
        and c.level in ('error', 'warning') $$,
  'plpgsql_check: Trigger-Funktionen ohne Fehler und Warnungen'
);

select * from finish();
rollback;
