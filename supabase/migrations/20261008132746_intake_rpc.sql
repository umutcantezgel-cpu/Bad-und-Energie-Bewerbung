-- =============================================================================
-- Intake-RPCs für den Server (SupabaseSink in Next.js, Secret-Key ⇒ service_role).
--
-- - SECURITY DEFINER mit leerem search_path; EXECUTE nur für service_role.
-- - Eine Transaktion je Bewerbung: Kontakt-Snapshot, Bewerbung, Attribution, Einwilligung,
--   Ereignis und Outbox-Zeilen entstehen gemeinsam oder gar nicht.
-- - Idempotent über idempotency_key (UUID des Clients, gespeichert nur als sha256):
--   gleicher Key + gleicher content_hash ⇒ gleiche Nummer, nichts Neues;
--   gleicher Key + anderer content_hash ⇒ Angaben aktualisieren, Teammail erneut,
--   gleiche Nummer (wie der EmailSink in lib/applications/sink.ts).
-- - Der öffentliche Pfad ändert nie Kontaktdaten anderer Bewerbungen (kein Dedupe-Update).
-- - Fehler in den Daten werden als 'validation_failed' gemeldet, ohne Zeileninhalte
--   (kein „Failing row contains …“ mit personenbezogenen Daten im Log).
-- =============================================================================

-- Obergrenze für Eingangsbestätigungen je Empfänger und 24 Stunden.
create function private.confirmation_cap()
returns integer
language sql
immutable
set search_path = ''
as $$ select 3 $$;

revoke all on function private.confirmation_cap() from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- rpc_submit_application
-- ---------------------------------------------------------------------------
--
-- Erwartete Nutzlast (vom SupabaseSink aus ReferencedApplication gebaut; „?“ = optional.
-- Fehlt ein Pflichtfeld oder hat es den falschen JSON-Typ ⇒ validation_failed):
-- {
--   "reference": "BE-26-K7M4QX", "idempotency_key": "<uuid>", "content_hash": "<32 hex>"?,
--   "submitted_at": "<iso>",
--   "job": { "id", "title", "reference_code"?, "question_set" },
--   "answers": {...}, "mappe": {...}|null?,
--   "name": "...", "phone": { "raw", "e164"? }, "email"?: "...",
--   "contact_channel": "whatsapp|phone|email", "acquisition_channel": "...",
--   "attribution": { "utm_source"?, ..., "funnel"? }?,
--   "privacy_notice_version": "2026-10",
--   "suspected_spam": false, "spam_signals": [], "fill_duration_ms"?: 12345
-- }
-- Antwort: { "application_id", "reference", "duplicate": bool, "resubmitted": bool }

create function public.rpc_submit_application(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key uuid;
  v_key_hash text;
  v_content_hash text;
  v_existing record;
  v_candidate_id uuid;
  v_application_id uuid;
  v_reference text;
  v_name text;
  v_phone_raw text;
  v_phone_e164 text;
  v_email text;
  v_recipient_hash text;
  v_signals text[];
  v_spam boolean;
  v_fill integer;
  v_answers jsonb;
  v_mappe jsonb;
  v_attr jsonb;
  v_mail_enabled boolean;
  v_recent_confirmations integer;
  v_constraint text;
begin
  -- Form der Nutzlast: fehlende Pflichtfelder oder falsche Typen nie still ergänzen.
  if payload is null or jsonb_typeof(payload) <> 'object'
     or jsonb_typeof(payload -> 'idempotency_key') is distinct from 'string'
     or jsonb_typeof(payload -> 'job') is distinct from 'object'
     or jsonb_typeof(payload -> 'phone') is distinct from 'object'
     or jsonb_typeof(payload -> 'answers') is distinct from 'object'
     or jsonb_typeof(payload -> 'suspected_spam') is distinct from 'boolean'
     or jsonb_typeof(payload -> 'spam_signals') is distinct from 'array'
     or coalesce(jsonb_typeof(payload -> 'attribution'), 'object') <> 'object'
     or coalesce(jsonb_typeof(payload -> 'mappe'), 'null') not in ('object', 'null')
     or coalesce(jsonb_typeof(payload -> 'email'), 'null') not in ('string', 'null')
     or coalesce(jsonb_typeof(payload -> 'content_hash'), 'null') not in ('string', 'null') then
    raise exception 'validation_failed' using errcode = 'P0001';
  end if;

  begin
    v_key := (payload ->> 'idempotency_key')::uuid;
  exception when invalid_text_representation then
    raise exception 'validation_failed' using errcode = 'P0001';
  end;

  v_key_hash := encode(extensions.digest(v_key::text, 'sha256'), 'hex');
  v_content_hash := payload ->> 'content_hash';
  if v_content_hash is not null and v_content_hash !~ '^[0-9a-f]{32}$' then
    raise exception 'validation_failed' using errcode = 'P0001';
  end if;

  -- Gleichzeitige Einsendungen mit demselben Key nacheinander abarbeiten.
  perform pg_advisory_xact_lock(hashtextextended('intake:' || v_key_hash, 0));

  begin
    v_name := btrim(payload ->> 'name');
    v_phone_raw := btrim(payload -> 'phone' ->> 'raw');
    v_phone_e164 := nullif(btrim(payload -> 'phone' ->> 'e164'), '');
    v_email := nullif(lower(btrim(payload ->> 'email')), '');
    v_signals := array(select jsonb_array_elements_text(payload -> 'spam_signals'));
    -- Spamverdacht auch dann, wenn nur Signale gesetzt sind (fail-closed für die Bestätigung).
    v_spam := (payload ->> 'suspected_spam')::boolean or cardinality(v_signals) > 0;
    -- Nur ein Hinweis: unplausible Werte fallen weg, statt die Bewerbung abzulehnen (wie zod).
    v_fill := case
      when jsonb_typeof(payload -> 'fill_duration_ms') = 'number'
       and (payload ->> 'fill_duration_ms')::numeric between 0 and 2147483647
      then trunc((payload ->> 'fill_duration_ms')::numeric)::integer
    end;
    v_answers := payload -> 'answers';
    v_mappe := case when jsonb_typeof(payload -> 'mappe') = 'object' then payload -> 'mappe' end;
    v_attr := coalesce(payload -> 'attribution', '{}'::jsonb);

    select a.id, a.reference, a.content_hash, a.candidate_id, a.privacy_notice_version
    into v_existing
    from public.applications a
    where a.idempotency_key_hash = v_key_hash;

    if found then
      -- Wiederholung mit gleichen Angaben (oder ohne Hash): bestehende Nummer zurückgeben.
      if v_content_hash is null or v_existing.content_hash is not distinct from v_content_hash then
        return jsonb_build_object(
          'application_id', v_existing.id,
          'reference', v_existing.reference,
          'duplicate', true,
          'resubmitted', false
        );
      end if;

      -- Gleicher Key, geänderte Angaben (z. B. nach einem Netzwerkfehler korrigiert):
      -- Wer den Key hat, hat diese Bewerbung abgeschickt. Der Kontakt-Snapshot wird nur
      -- geändert, wenn keine andere Bewerbung daran hängt (z. B. nach einer Zusammenführung).
      if exists (
        select 1 from public.applications a
        where a.candidate_id = v_existing.candidate_id and a.id <> v_existing.id
      ) then
        insert into public.candidates (full_name, phone_raw, phone_e164, email)
        values (v_name, v_phone_raw, v_phone_e164, v_email)
        returning id into v_candidate_id;
      else
        update public.candidates c
        set full_name = v_name,
            phone_raw = v_phone_raw,
            phone_e164 = v_phone_e164,
            email = v_email
        where c.id = v_existing.candidate_id;
        v_candidate_id := v_existing.candidate_id;
      end if;

      update public.applications a
      set candidate_id = v_candidate_id,
          content_hash = v_content_hash,
          job_id = payload -> 'job' ->> 'id',
          job_title = payload -> 'job' ->> 'title',
          job_reference_code = nullif(payload -> 'job' ->> 'reference_code', ''),
          question_set = payload -> 'job' ->> 'question_set',
          answers = v_answers,
          mappe = v_mappe,
          contact_channel = payload ->> 'contact_channel',
          acquisition_channel = payload ->> 'acquisition_channel',
          privacy_notice_version = payload ->> 'privacy_notice_version',
          suspected_spam = v_spam,
          spam_signals = v_signals,
          fill_duration_ms = v_fill,
          last_activity_at = now()
      where a.id = v_existing.id;

      insert into public.application_attribution as t (
        application_id, utm_source, utm_medium, utm_campaign, utm_content, utm_term,
        ref, referrer_host, landing_path, funnel
      )
      values (
        v_existing.id,
        nullif(v_attr ->> 'utm_source', ''),
        nullif(v_attr ->> 'utm_medium', ''),
        nullif(v_attr ->> 'utm_campaign', ''),
        nullif(v_attr ->> 'utm_content', ''),
        nullif(v_attr ->> 'utm_term', ''),
        nullif(v_attr ->> 'ref', ''),
        nullif(v_attr ->> 'referrer_host', ''),
        nullif(v_attr ->> 'landing_path', ''),
        nullif(v_attr ->> 'funnel', '')
      )
      on conflict (application_id) do update
      set utm_source = excluded.utm_source,
          utm_medium = excluded.utm_medium,
          utm_campaign = excluded.utm_campaign,
          utm_content = excluded.utm_content,
          utm_term = excluded.utm_term,
          ref = excluded.ref,
          referrer_host = excluded.referrer_host,
          landing_path = excluded.landing_path,
          funnel = excluded.funnel;

      if (payload ->> 'privacy_notice_version') is distinct from v_existing.privacy_notice_version then
        insert into public.consent_records (application_id, purpose, action, text_version, channel)
        values (v_existing.id, 'privacy_notice', 'acknowledged', payload ->> 'privacy_notice_version', 'web_form');
      end if;

      insert into public.application_events (application_id, event_type, data)
      values (
        v_existing.id,
        'resubmitted',
        jsonb_build_object('job_id', payload -> 'job' ->> 'id', 'suspected_spam', v_spam)
      );

      -- Teammail erneut (gleiche Nummer, neue Angaben). Keine zweite Eingangsbestätigung.
      insert into private.outbox (kind, application_id)
      values ('application_team', v_existing.id);

      return jsonb_build_object(
        'application_id', v_existing.id,
        'reference', v_existing.reference,
        'duplicate', false,
        'resubmitted', true
      );
    end if;

    -- Neue Bewerbung: immer ein eigener Kontakt-Snapshot.
    insert into public.candidates (full_name, phone_raw, phone_e164, email)
    values (v_name, v_phone_raw, v_phone_e164, v_email)
    returning id into v_candidate_id;

    insert into public.applications (
      reference, idempotency_key_hash, content_hash, candidate_id,
      job_id, job_title, job_reference_code, question_set,
      answers, mappe, contact_channel, acquisition_channel, privacy_notice_version,
      suspected_spam, spam_signals, fill_duration_ms, submitted_at
    )
    values (
      payload ->> 'reference',
      v_key_hash,
      v_content_hash,
      v_candidate_id,
      payload -> 'job' ->> 'id',
      payload -> 'job' ->> 'title',
      nullif(payload -> 'job' ->> 'reference_code', ''),
      payload -> 'job' ->> 'question_set',
      v_answers,
      v_mappe,
      payload ->> 'contact_channel',
      payload ->> 'acquisition_channel',
      payload ->> 'privacy_notice_version',
      v_spam,
      v_signals,
      v_fill,
      coalesce((payload ->> 'submitted_at')::timestamptz, now())
    )
    returning id, reference into v_application_id, v_reference;

    insert into public.application_attribution (
      application_id, utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      ref, referrer_host, landing_path, funnel
    )
    values (
      v_application_id,
      nullif(v_attr ->> 'utm_source', ''),
      nullif(v_attr ->> 'utm_medium', ''),
      nullif(v_attr ->> 'utm_campaign', ''),
      nullif(v_attr ->> 'utm_content', ''),
      nullif(v_attr ->> 'utm_term', ''),
      nullif(v_attr ->> 'ref', ''),
      nullif(v_attr ->> 'referrer_host', ''),
      nullif(v_attr ->> 'landing_path', ''),
      nullif(v_attr ->> 'funnel', '')
    );

    insert into public.consent_records (application_id, purpose, action, text_version, channel)
    values (v_application_id, 'privacy_notice', 'acknowledged', payload ->> 'privacy_notice_version', 'web_form');

    insert into public.application_events (application_id, event_type, data)
    values (
      v_application_id,
      'submitted',
      jsonb_build_object('job_id', payload -> 'job' ->> 'id', 'suspected_spam', v_spam)
    );

    -- Teammail immer.
    insert into private.outbox (kind, application_id)
    values ('application_team', v_application_id);

    -- Eingangsbestätigung nur mit E-Mail; nie bei Spamverdacht; nicht nachträglich, wenn der
    -- Versand gerade aus ist; höchstens N je Empfänger in 24 h.
    if v_email is not null then
      v_recipient_hash := encode(extensions.digest(v_email, 'sha256'), 'hex');

      select s.enabled into v_mail_enabled
      from private.app_settings s
      where s.key = 'outbound_email_enabled';

      if v_spam then
        insert into private.outbox (kind, application_id, recipient_hash, status, skip_reason)
        values ('application_confirmation', v_application_id, v_recipient_hash, 'skipped', 'suspected_spam');
      elsif not coalesce(v_mail_enabled, false) then
        insert into private.outbox (kind, application_id, recipient_hash, status, skip_reason)
        values ('application_confirmation', v_application_id, v_recipient_hash, 'skipped', 'disabled');
      else
        -- Zählen und Einfügen je Empfänger serialisieren, sonst überholen sich parallele Einsendungen.
        perform pg_advisory_xact_lock(hashtextextended('confirm:' || v_recipient_hash, 0));

        select count(*) into v_recent_confirmations
        from private.outbox o
        where o.kind = 'application_confirmation'
          and o.recipient_hash = v_recipient_hash
          and o.status <> 'skipped'
          and o.created_at > now() - interval '24 hours';

        if v_recent_confirmations >= private.confirmation_cap() then
          insert into private.outbox (kind, application_id, recipient_hash, status, skip_reason)
          values ('application_confirmation', v_application_id, v_recipient_hash, 'skipped', 'recipient_cap');
        else
          insert into private.outbox (kind, application_id, recipient_hash)
          values ('application_confirmation', v_application_id, v_recipient_hash);
        end if;
      end if;
    end if;

  exception
    when unique_violation then
      get stacked diagnostics v_constraint = constraint_name;
      -- Referenz-Kollision (anderer Key, gleiche Nummer): Next erzeugt die Nummer per HMAC,
      -- eine Kollision ist praktisch ausgeschlossen; Next versucht es einmal mit neuer Nummer.
      if v_constraint = 'applications_reference_key' then
        raise exception 'reference_conflict' using errcode = 'P0001';
      end if;
      raise exception 'validation_failed' using errcode = 'P0001';
    when integrity_constraint_violation or data_exception then
      raise exception 'validation_failed' using errcode = 'P0001';
  end;

  return jsonb_build_object(
    'application_id', v_application_id,
    'reference', v_reference,
    'duplicate', false,
    'resubmitted', false
  );
end;
$$;

revoke all on function public.rpc_submit_application(jsonb) from public, anon, authenticated, service_role;
grant execute on function public.rpc_submit_application(jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- rpc_submit_follow_up (Ergänzungen von der Danke-Seite; Token prüft Next per HMAC)
-- ---------------------------------------------------------------------------
--
-- Nutzlast: { "reference", "idempotency_key", "received_at"?, "start_date"?, "postal_code"?,
--             "message"?, "mappe"? }
-- Antwort:  { "ok": true, "duplicate": bool }
-- Fehler:   'not_found' (unbekannt, Löschantrag, Löschung läuft), 'follow_up_limit',
--           'validation_failed'.

create function public.rpc_submit_follow_up(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text;
  v_application_id uuid;
  v_follow_up_id uuid;
  v_total integer;
  v_recent integer;
begin
  if payload is null or jsonb_typeof(payload) <> 'object'
     or jsonb_typeof(payload -> 'reference') is distinct from 'string'
     or jsonb_typeof(payload -> 'idempotency_key') is distinct from 'string'
     or coalesce(jsonb_typeof(payload -> 'mappe'), 'null') not in ('object', 'null') then
    raise exception 'validation_failed' using errcode = 'P0001';
  end if;

  v_key := payload ->> 'idempotency_key';

  -- Wiederholung derselben Ergänzung vor allen Grenzen beantworten.
  if exists (select 1 from public.application_follow_ups f where f.idempotency_key = v_key) then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;

  -- Zeile sperren: Zählen und Einfügen je Bewerbung serialisieren.
  select a.id into v_application_id
  from public.applications a
  where a.reference = upper(btrim(payload ->> 'reference'))
    and a.purge_state = 'active'
    and a.erasure_requested_at is null
  for update;

  if v_application_id is null then
    raise exception 'not_found' using errcode = 'P0001';
  end if;

  select count(*), count(*) filter (where f.created_at > now() - interval '24 hours')
  into v_total, v_recent
  from public.application_follow_ups f
  where f.application_id = v_application_id;

  -- Schutz vor Speicher- und Mail-Flut über ein einmal ausgegebenes Ergänzungs-Token.
  if v_total >= 20 or v_recent >= 5 then
    raise exception 'follow_up_limit' using errcode = 'P0001';
  end if;

  begin
    insert into public.application_follow_ups (
      application_id, idempotency_key, start_date, postal_code, message, mappe, received_at
    )
    values (
      v_application_id,
      v_key,
      nullif(btrim(payload ->> 'start_date'), ''),
      nullif(btrim(payload ->> 'postal_code'), ''),
      nullif(btrim(payload ->> 'message'), ''),
      case when jsonb_typeof(payload -> 'mappe') = 'object' then payload -> 'mappe' end,
      coalesce((payload ->> 'received_at')::timestamptz, now())
    )
    on conflict (idempotency_key) do nothing
    returning id into v_follow_up_id;
  exception
    when integrity_constraint_violation or data_exception then
      raise exception 'validation_failed' using errcode = 'P0001';
  end;

  if v_follow_up_id is null then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;

  update public.applications
  set last_activity_at = now()
  where id = v_application_id;

  insert into public.application_events (application_id, event_type, data)
  values (v_application_id, 'follow_up', jsonb_build_object('follow_up_id', v_follow_up_id));

  insert into private.outbox (kind, application_id, follow_up_id)
  values ('follow_up_team', v_application_id, v_follow_up_id);

  return jsonb_build_object('ok', true, 'duplicate', false);
end;
$$;

revoke all on function public.rpc_submit_follow_up(jsonb) from public, anon, authenticated, service_role;
grant execute on function public.rpc_submit_follow_up(jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- rpc_rate_limit_hit (für SupabaseRateLimiter hinter dem RateLimiter-Interface)
-- ---------------------------------------------------------------------------
--
-- Feste Zeitfenster. p_key_hash = sha256 des Limiter-Schlüssels („<scope>:<HMAC(IP)>“) als
-- Hex aus Next; die IP selbst erreicht die Datenbank nie. Jede Regel (Fenster) zählt getrennt.
-- Antwort: { "allowed", "remaining", "retry_after_sec" }.

create function public.rpc_rate_limit_hit(
  p_key_hash text,
  p_action text,
  p_limit integer,
  p_window_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window_start timestamptz;
  v_hits integer;
  v_retry integer;
begin
  if p_key_hash is null or p_key_hash !~ '^[0-9a-f]{64}$'
     or p_action is null or p_action !~ '^[a-z0-9_:.-]{1,40}$'
     or p_limit is null or p_limit < 1 or p_limit > 10000
     or p_window_seconds is null or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'validation_failed' using errcode = 'P0001';
  end if;

  v_window_start := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  insert into private.rate_limit_counters as c (key_hash, action, window_seconds, window_start, hits)
  values (p_key_hash, p_action, p_window_seconds, v_window_start, 1)
  on conflict (key_hash, action, window_seconds, window_start)
  do update set hits = c.hits + 1
  returning c.hits into v_hits;

  v_retry := greatest(0, ceil(extract(epoch from (v_window_start + make_interval(secs => p_window_seconds) - now())))::integer);

  return jsonb_build_object(
    'allowed', v_hits <= p_limit,
    'remaining', greatest(0, p_limit - v_hits),
    'retry_after_sec', case when v_hits <= p_limit then 0 else v_retry end
  );
end;
$$;

revoke all on function public.rpc_rate_limit_hit(text, text, integer, integer) from public, anon, authenticated, service_role;
grant execute on function public.rpc_rate_limit_hit(text, text, integer, integer) to service_role;
