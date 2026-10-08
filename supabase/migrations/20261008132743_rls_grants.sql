-- =============================================================================
-- Rechte und Row Level Security
--
-- Modell:
-- - anon: kein Zugriff auf irgendeine Tabelle.
-- - authenticated: nur aktive Staff-Mitglieder mit MFA (aal2) sehen Daten.
--   Lesen ab viewer; Stufe/Zuständigkeit/Bewertung/Absage-Zeitpunkt ändern und
--   Notizen schreiben ab recruiter. Alles Weitere über staff_*-RPCs (Phase 2d).
-- - service_role: keine Tabellenrechte; nur EXECUTE auf rpc_* (intake_rpc.sql).
--   Ein geleakter Secret-Key kann so keine Tabellen auslesen.
-- - Trigger und RPCs schreiben als Owner (postgres, bypassrls).
-- =============================================================================

-- RLS überall (public und private; private zusätzlich als Defense in Depth).
alter table public.staff enable row level security;
alter table public.candidates enable row level security;
alter table public.applications enable row level security;
alter table public.application_follow_ups enable row level security;
alter table public.application_files enable row level security;
alter table public.application_notes enable row level security;
alter table public.application_events enable row level security;
alter table public.application_attribution enable row level security;
alter table public.consent_records enable row level security;
alter table private.app_settings enable row level security;
alter table private.outbox enable row level security;
alter table private.rate_limit_counters enable row level security;
alter table private.audit_log enable row level security;

-- Ausgangslage: keine Rechte für API-Rollen (unabhängig von Default-Privileges).
revoke all on all tables in schema public from anon, authenticated, service_role;
revoke all on all sequences in schema public from anon, authenticated, service_role;
revoke all on all tables in schema private from anon, authenticated, service_role;
revoke all on all sequences in schema private from anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Grants für authenticated (Zeilen filtert RLS)
-- ---------------------------------------------------------------------------

grant select on table
  public.staff,
  public.candidates,
  public.applications,
  public.application_follow_ups,
  public.application_files,
  public.application_notes,
  public.application_events,
  public.application_attribution,
  public.consent_records
to authenticated;

grant update (stage, assigned_to, rating, rejection_notified_at) on table public.applications to authenticated;
grant insert (application_id, body) on table public.application_notes to authenticated;

-- ---------------------------------------------------------------------------
-- MFA-Pflicht: restriktive Policy auf allen Tabellen mit Bewerberdaten.
-- Restriktive Policies werden mit AND an die permissiven angehängt.
-- ---------------------------------------------------------------------------

create policy "require_aal2" on public.staff
  as restrictive for all to authenticated
  using ((select private.is_aal2())) with check ((select private.is_aal2()));
create policy "require_aal2" on public.candidates
  as restrictive for all to authenticated
  using ((select private.is_aal2())) with check ((select private.is_aal2()));
create policy "require_aal2" on public.applications
  as restrictive for all to authenticated
  using ((select private.is_aal2())) with check ((select private.is_aal2()));
create policy "require_aal2" on public.application_follow_ups
  as restrictive for all to authenticated
  using ((select private.is_aal2())) with check ((select private.is_aal2()));
create policy "require_aal2" on public.application_files
  as restrictive for all to authenticated
  using ((select private.is_aal2())) with check ((select private.is_aal2()));
create policy "require_aal2" on public.application_notes
  as restrictive for all to authenticated
  using ((select private.is_aal2())) with check ((select private.is_aal2()));
create policy "require_aal2" on public.application_events
  as restrictive for all to authenticated
  using ((select private.is_aal2())) with check ((select private.is_aal2()));
create policy "require_aal2" on public.application_attribution
  as restrictive for all to authenticated
  using ((select private.is_aal2())) with check ((select private.is_aal2()));
create policy "require_aal2" on public.consent_records
  as restrictive for all to authenticated
  using ((select private.is_aal2())) with check ((select private.is_aal2()));

-- ---------------------------------------------------------------------------
-- Lesen: aktive Staff-Mitglieder (ab viewer)
-- ---------------------------------------------------------------------------

create policy "staff_select" on public.staff
  for select to authenticated using ((select private.is_staff()));
create policy "staff_select" on public.candidates
  for select to authenticated using ((select private.is_staff()));
create policy "staff_select" on public.applications
  for select to authenticated using ((select private.is_staff()));
create policy "staff_select" on public.application_follow_ups
  for select to authenticated using ((select private.is_staff()));
create policy "staff_select" on public.application_files
  for select to authenticated using ((select private.is_staff()));
create policy "staff_select" on public.application_notes
  for select to authenticated using ((select private.is_staff()));
create policy "staff_select" on public.application_events
  for select to authenticated using ((select private.is_staff()));
create policy "staff_select" on public.application_attribution
  for select to authenticated using ((select private.is_staff()));
create policy "staff_select" on public.consent_records
  for select to authenticated using ((select private.is_staff()));

-- ---------------------------------------------------------------------------
-- Schreiben: ab recruiter
-- ---------------------------------------------------------------------------

create policy "recruiter_update" on public.applications
  for update to authenticated
  using ((select private.staff_role_at_least('recruiter')))
  with check ((select private.staff_role_at_least('recruiter')));

create policy "recruiter_insert_own_note" on public.application_notes
  for insert to authenticated
  with check (
    (select private.staff_role_at_least('recruiter'))
    and author_id = (select auth.uid())
  );
