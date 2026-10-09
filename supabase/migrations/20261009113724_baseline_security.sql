-- =============================================================================
-- Baseline: nichts wird automatisch über die Data API freigegeben.
--
-- Jede spätere Migration vergibt Rechte ausdrücklich (GRANT) zusammen mit RLS.
-- Bewerberdaten sind für anon nie erreichbar; Schreibzugriffe von außen laufen
-- ausschließlich über SECURITY-DEFINER-RPCs, die nur service_role ausführen darf.
-- =============================================================================

-- Default-Grants für neue Objekte in public vollständig widerrufen (Supabase „Securing your API“).
-- „all“ statt einzelner Rechte: auch TRUNCATE, REFERENCES, TRIGGER und MAINTAIN.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke all on functions from anon, authenticated, service_role;

-- Funktionen in allen Schemas (auch private) sind standardmäßig nicht für PUBLIC ausführbar.
-- (Ein schemabezogenes „revoke … from public“ wäre wirkungslos: Das PUBLIC-Recht stammt aus
-- den globalen Defaults und lässt sich nur dort entziehen.)
alter default privileges for role postgres
  revoke execute on functions from public;

-- Extensions (ohne Versionsangabe; Supabase ignoriert sie ohnehin).
-- pg_net und pg_cron folgen erst mit Phase 2c (Outbox-Versand, Löschfristen).
create extension if not exists pgcrypto with schema extensions;

-- Nicht exponiertes Schema für Hilfsfunktionen, Outbox, Zähler und Protokolle.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated, service_role;
-- RLS-Policies rufen private.is_staff() & Co. mit der Rolle des Aufrufers auf.
grant usage on schema private to authenticated;
-- Der Auth-Hook (before_user_created) liest die Allowlist.
grant usage on schema private to supabase_auth_admin;

comment on schema private is
  'Nicht über die Data API erreichbar. Hilfsfunktionen für RLS, Outbox, Rate-Limits, Audit.';
