-- =============================================================================
-- Baseline: nichts wird automatisch über die Data API freigegeben.
--
-- Jede spätere Migration vergibt Rechte ausdrücklich (GRANT) zusammen mit RLS.
-- Bewerberdaten sind für anon nie erreichbar; Schreibzugriffe von außen laufen
-- ausschließlich über SECURITY-DEFINER-RPCs, die nur service_role ausführen darf.
-- =============================================================================

-- Default-Grants für neue Objekte in public widerrufen (Supabase „Securing your API“).
alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke execute on functions from public;

-- Funktionen in allen Schemas (auch private) sind standardmäßig nicht für PUBLIC ausführbar.
alter default privileges for role postgres
  revoke execute on functions from public;

-- Extensions (ohne Versionsangabe; Supabase ignoriert sie ohnehin).
create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- Nicht exponiertes Schema für Hilfsfunktionen, Outbox, Zähler und Protokolle.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated, service_role;
-- RLS-Policies rufen private.is_staff() & Co. mit der Rolle des Aufrufers auf.
grant usage on schema private to authenticated;
-- Der Auth-Hook (before_user_created) liest die Allowlist.
grant usage on schema private to supabase_auth_admin;

comment on schema private is
  'Nicht über die Data API erreichbar. Hilfsfunktionen für RLS, Outbox, Rate-Limits, Audit.';
