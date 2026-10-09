-- =============================================================================
-- Trigger: Zeitstempel, Löschfristen, Zeitleiste/Audit, Realtime-Hinweise.
--
-- Löschfristen (ROADMAP §8, Abstimmung 2026-10-08):
-- - Absage/Rückzug/Einstellung: 6 Monate nach Mitteilung bzw. Stufenwechsel
--   (Mitteilungszeitpunkt setzt bei API-Aufrufern die DB auf now(), nie der Client)
-- - ohne Entscheidung: 12 Monate nach letzter Aktivität (Sicherheitsobergrenze)
-- - aktive Talent-Pool-Einwilligung: mindestens 24 Monate ab Einwilligung
-- - Löschantrag (Art. 17): sofort fällig
-- Ausgeführt wird die Löschung in Phase 2c (pg_cron → Edge Function retention-purge);
-- legal_hold blockiert dort.
--
-- Realtime: realtime.send auf den privaten Topic 'staff:inbox', nur mit der Bewerbungs-ID.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated, service_role;

create trigger set_updated_at before update on public.staff
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.candidates
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.applications
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Bewerbung: Stufenwechsel-Zeitpunkt, Aktivität und Löschfrist
-- ---------------------------------------------------------------------------

create function private.compute_retention()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_base timestamptz;
begin
  if tg_op = 'UPDATE' then
    if new.stage is distinct from old.stage then
      new.stage_changed_at := now();
    end if;

    -- Absage-Mitteilung: Über die API (authenticated) bestimmt die DB den Zeitpunkt, und er
    -- wird je Absage nur einmal gesetzt. Ein frei wählbares, geleertes oder neu gestempeltes
    -- Datum würde die Löschfrist steuern (rückdatiert oder geleert ⇒ früher Purge, ständig neu
    -- gesetzt ⇒ Daten bleiben unbegrenzt). Erneut setzbar erst nach einer neuen Absage
    -- (Stufenwechsel nach der letzten Mitteilung); Korrekturen später über eine staff_*-RPC.
    if current_user = 'authenticated'
       and new.rejection_notified_at is distinct from old.rejection_notified_at then
      if new.rejection_notified_at is null
         or new.stage <> 'abgesagt'
         or (old.rejection_notified_at is not null
             and old.rejection_notified_at >= new.stage_changed_at) then
        raise exception 'validation_failed' using errcode = 'P0001';
      end if;
      new.rejection_notified_at := now();
    end if;

    -- Aktivität: nur Änderungen durch Menschen bzw. echte Zuweisungen. Das Nullsetzen der
    -- Zuständigkeit durch eine Kaskade (Staff gelöscht) verlängert keine Frist.
    if new.stage is distinct from old.stage
       or (new.assigned_to is distinct from old.assigned_to
           and (new.assigned_to is not null or (select auth.uid()) is not null))
       or new.rating is distinct from old.rating
       or new.rejection_notified_at is distinct from old.rejection_notified_at then
      new.last_activity_at := now();
    end if;
  end if;

  v_base := case
    -- Basis: Mitteilung, frühestens der letzte Stufenwechsel (erneute Absage nach Wiedereröffnung),
    -- höchstens jetzt.
    when new.stage = 'abgesagt' then
      least(greatest(coalesce(new.rejection_notified_at, new.stage_changed_at), new.stage_changed_at), now())
      + interval '6 months'
    when new.stage in ('zurueckgezogen', 'eingestellt') then new.stage_changed_at + interval '6 months'
    else new.last_activity_at + interval '12 months'
  end;

  if new.talent_pool_consent_at is not null and new.talent_pool_revoked_at is null then
    v_base := greatest(v_base, new.talent_pool_consent_at + interval '24 months');
  end if;

  if new.erasure_requested_at is not null then
    v_base := least(v_base, new.erasure_requested_at);
  end if;

  new.retention_until := v_base;
  return new;
end;
$$;

revoke all on function private.compute_retention() from public, anon, authenticated, service_role;

create trigger compute_retention before insert or update on public.applications
  for each row execute function private.compute_retention();

-- ---------------------------------------------------------------------------
-- Zeitleiste + Audit bei Änderungen durch das Team
-- (definer: authenticated hat keine Rechte auf application_events/audit_log)
-- ---------------------------------------------------------------------------

create function private.log_application_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_actor_staff uuid;
  v_fields text[] := '{}';
begin
  select s.user_id into v_actor_staff from public.staff s where s.user_id = v_actor;

  if new.stage is distinct from old.stage then
    v_fields := array_append(v_fields, 'stage');
    insert into public.application_events (application_id, event_type, actor_id, data)
    values (new.id, 'stage_changed', v_actor_staff,
            jsonb_build_object('from', old.stage, 'to', new.stage));
  end if;

  if new.assigned_to is distinct from old.assigned_to then
    v_fields := array_append(v_fields, 'assigned_to');
    insert into public.application_events (application_id, event_type, actor_id, data)
    values (new.id, 'assigned', v_actor_staff,
            jsonb_build_object('to', new.assigned_to));
  end if;

  if new.rating is distinct from old.rating then
    v_fields := array_append(v_fields, 'rating');
    insert into public.application_events (application_id, event_type, actor_id, data)
    values (new.id, 'rated', v_actor_staff, jsonb_build_object('to', new.rating));
  end if;

  if new.rejection_notified_at is distinct from old.rejection_notified_at then
    v_fields := array_append(v_fields, 'rejection_notified_at');
  end if;

  if new.talent_pool_consent_at is distinct from old.talent_pool_consent_at
     or new.talent_pool_revoked_at is distinct from old.talent_pool_revoked_at then
    v_fields := array_append(v_fields, 'talent_pool');
    insert into public.application_events (application_id, event_type, actor_id, data)
    values (new.id, 'consent_changed', v_actor_staff,
            jsonb_build_object('talent_pool', new.talent_pool_consent_at is not null and new.talent_pool_revoked_at is null));
  end if;

  -- Nur Audit (keine Zeitleisten-Einträge): Löschantrag, Sperre, Löschstatus, Angaben.
  if new.erasure_requested_at is distinct from old.erasure_requested_at then
    v_fields := array_append(v_fields, 'erasure_requested_at');
  end if;
  if new.legal_hold is distinct from old.legal_hold then
    v_fields := array_append(v_fields, 'legal_hold');
  end if;
  if new.purge_state is distinct from old.purge_state then
    v_fields := array_append(v_fields, 'purge_state');
  end if;
  if new.content_hash is distinct from old.content_hash then
    v_fields := array_append(v_fields, 'content');
  end if;
  if new.candidate_id is distinct from old.candidate_id then
    v_fields := array_append(v_fields, 'candidate_id');
  end if;

  if cardinality(v_fields) > 0 then
    insert into private.audit_log (actor_id, action, entity, entity_id, fields)
    values (v_actor, 'update', 'applications', new.id, v_fields);
  end if;

  return null;
end;
$$;

revoke all on function private.log_application_change() from public, anon, authenticated, service_role;

create trigger log_application_change after update on public.applications
  for each row execute function private.log_application_change();

create function private.log_note_added()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.application_events (application_id, event_type, actor_id, data)
  values (new.application_id, 'note_added', new.author_id, jsonb_build_object('note_id', new.id));

  update public.applications
  set last_activity_at = now()
  where id = new.application_id;

  return null;
end;
$$;

revoke all on function private.log_note_added() from public, anon, authenticated, service_role;

create trigger log_note_added after insert on public.application_notes
  for each row execute function private.log_note_added();

-- Zeitleiste ist append-only (Löschen nur per Kaskade beim Purge; actor_id ist restrict).
create function private.forbid_event_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'application_events is append-only' using errcode = 'P0001';
end;
$$;

revoke all on function private.forbid_event_update() from public, anon, authenticated, service_role;

create trigger forbid_event_update before update on public.application_events
  for each row execute function private.forbid_event_update();

-- ---------------------------------------------------------------------------
-- Realtime: Hinweis an das Cockpit (nur die ID; das Cockpit lädt per RLS nach).
-- realtime.messages hält Nachrichten einige Tage; deshalb weder Nummer noch Stufe.
-- ---------------------------------------------------------------------------

create function private.broadcast_application()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform realtime.send(
    jsonb_build_object('application_id', new.id),
    case when tg_op = 'INSERT' then 'application_created' else 'application_updated' end,
    'staff:inbox',
    true
  );
  return null;
end;
$$;

revoke all on function private.broadcast_application() from public, anon, authenticated, service_role;

create trigger broadcast_application_insert after insert on public.applications
  for each row execute function private.broadcast_application();

-- Nur bei echten Änderungen melden (WHEN sieht die Zeile nach den BEFORE-Triggern), auch bei
-- Korrekturen (content_hash) und neuer Aktivität (Ergänzung, Notiz, Bewertung). Ein leeres
-- UPDATE (SET stage = stage) erzeugt keine Nachricht.
create trigger broadcast_application_update
  after update on public.applications
  for each row
  when (old.stage is distinct from new.stage
        or old.assigned_to is distinct from new.assigned_to
        or old.rating is distinct from new.rating
        or old.rejection_notified_at is distinct from new.rejection_notified_at
        or old.content_hash is distinct from new.content_hash
        or old.last_activity_at is distinct from new.last_activity_at)
  execute function private.broadcast_application();

-- Nur aktive Staff-Mitglieder mit MFA dürfen den privaten Kanal empfangen.
create policy "staff_receive_inbox"
  on realtime.messages
  for select
  to authenticated
  using (
    (select realtime.topic()) = 'staff:inbox'
    and realtime.messages.extension = 'broadcast'
    and (select private.is_staff())
    and (select private.is_aal2())
  );
