-- =============================================================================
-- Intake-RPCs für den Server (SupabaseSink in Next.js, Secret-Key ⇒ service_role).
--
-- - SECURITY DEFINER mit leerem search_path; EXECUTE nur für service_role.
-- - Eine Transaktion je Bewerbung: Kandidat, Bewerbung, Attribution, Einwilligung,
--   Ereignis und Outbox-Zeilen entstehen gemeinsam oder gar nicht.
-- - Idempotent über idempotency_key (UUID des Clients): Wiederholung ⇒ gleiche Nummer.
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
-- Erwartete Nutzlast (vom SupabaseSink aus NormalizedApplication gebaut):
-- {
--   "reference": "BE-26-K7M4QX", "idempotency_key": "<uuid>", "submitted_at": "<iso>",
--   "job": { "id", "title", "reference_code"?, "question_set" },
--   "answers": {...}, "mappe": {...}?,
--   "name": "...", "phone": { "raw", "e164"? }, "email"?: "...",
--   "contact_channel": "whatsapp|phone|email", "acquisition_channel": "...",
--   "attribution": { "utm_source"?, ..., "funnel"? },
--   "privacy_notice_version": "2026-10",
--   "suspected_spam": false, "spam_signals": [], "fill_duration_ms"?: 12345
-- }
-- Antwort: { "application_id", "reference", "duplicate": bool }

create function public.rpc_submit_application(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key uuid;
  v_existing record;
  v_candidate_id uuid;
  v_application_id uuid;
  v_reference text;
  v_name text;
  v_phone_raw text;
  v_phone_e164 text;
  v_email text;
  v_recipient_hash text;
  v_spam boolean;
  v_recent_confirmations integer;
  v_attr jsonb;
begin
  if payload is null or jsonb_typeof(payload) <> 'object' then
    raise exception 'validation_failed' using errcode = 'P0001';
  end if;

  begin
    v_key := (payload ->> 'idempotency_key')::uuid;
  exception when invalid_text_representation then
    raise exception 'validation_failed' using errcode = 'P0001';
  end;

  if v_key is null then
    raise exception 'validation_failed' using errcode = 'P0001';
  end if;

  -- Wiederholung: bestehende Bewerbung zurückgeben, nichts erneut anlegen.
  select a.id, a.reference into v_existing
  from public.applications a
  where a.idempotency_key = v_key;

  if found then
    return jsonb_build_object(
      'application_id', v_existing.id,
      'reference', v_existing.reference,
      'duplicate', true
    );
  end if;

  v_name := btrim(payload ->> 'name');
  v_phone_raw := btrim(payload -> 'phone' ->> 'raw');
  v_phone_e164 := nullif(btrim(payload -> 'phone' ->> 'e164'), '');
  v_email := nullif(lower(btrim(payload ->> 'email')), '');
  v_spam := coalesce((payload ->> 'suspected_spam')::boolean, false);
  v_attr := coalesce(payload -> 'attribution', '{}'::jsonb);

  begin
    -- Kandidat wiederverwenden (gleiche gültige Telefonnummer, sonst gleiche E-Mail).
    if v_phone_e164 is not null then
      select c.id into v_candidate_id
      from public.candidates c
      where c.phone_e164 = v_phone_e164
      order by c.created_at desc
      limit 1;
    end if;

    if v_candidate_id is null and v_email is not null then
      select c.id into v_candidate_id
      from public.candidates c
      where c.email = v_email
      order by c.created_at desc
      limit 1;
    end if;

    if v_candidate_id is null then
      insert into public.candidates (full_name, phone_raw, phone_e164, email)
      values (v_name, v_phone_raw, v_phone_e164, v_email)
      returning id into v_candidate_id;
    else
      update public.candidates c
      set full_name = v_name,
          phone_raw = v_phone_raw,
          phone_e164 = coalesce(v_phone_e164, c.phone_e164),
          email = coalesce(v_email, c.email)
      where c.id = v_candidate_id;
    end if;

    insert into public.applications (
      reference, idempotency_key, candidate_id,
      job_id, job_title, job_reference_code, question_set,
      answers, mappe, contact_channel, acquisition_channel, privacy_notice_version,
      suspected_spam, spam_signals, fill_duration_ms, submitted_at
    )
    values (
      payload ->> 'reference',
      v_key,
      v_candidate_id,
      payload -> 'job' ->> 'id',
      payload -> 'job' ->> 'title',
      nullif(payload -> 'job' ->> 'reference_code', ''),
      payload -> 'job' ->> 'question_set',
      coalesce(payload -> 'answers', '{}'::jsonb),
      case when jsonb_typeof(payload -> 'mappe') = 'object' then payload -> 'mappe' end,
      payload ->> 'contact_channel',
      payload ->> 'acquisition_channel',
      payload ->> 'privacy_notice_version',
      v_spam,
      coalesce(
        array(select jsonb_array_elements_text(
          case when jsonb_typeof(payload -> 'spam_signals') = 'array' then payload -> 'spam_signals' else '[]'::jsonb end
        )),
        '{}'::text[]
      ),
      (payload ->> 'fill_duration_ms')::numeric::integer,
      coalesce((payload ->> 'submitted_at')::timestamptz, now())
    )
    on conflict (idempotency_key) do nothing
    returning id, reference into v_application_id, v_reference;

    -- Gleichzeitige Wiederholung hat gewonnen: deren Ergebnis zurückgeben.
    if v_application_id is null then
      select a.id, a.reference into v_existing
      from public.applications a
      where a.idempotency_key = v_key;

      return jsonb_build_object(
        'application_id', v_existing.id,
        'reference', v_existing.reference,
        'duplicate', true
      );
    end if;

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

    -- Eingangsbestätigung nur mit E-Mail, nie bei Spamverdacht, höchstens N je Empfänger in 24 h.
    if v_email is not null then
      v_recipient_hash := encode(extensions.digest(v_email, 'sha256'), 'hex');

      if v_spam then
        insert into private.outbox (kind, application_id, recipient_hash, status, skip_reason)
        values ('application_confirmation', v_application_id, v_recipient_hash, 'skipped', 'suspected_spam');
      else
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
    when check_violation or not_null_violation or string_data_right_truncation
      or invalid_text_representation or invalid_datetime_format or datetime_field_overflow
      or numeric_value_out_of_range or foreign_key_violation or invalid_parameter_value then
      raise exception 'validation_failed' using errcode = 'P0001';
    when unique_violation then
      -- Referenz-Kollision (anderer Key, gleiche Nummer): Next erzeugt die Nummer per HMAC,
      -- eine Kollision ist praktisch ausgeschlossen. Ohne Details melden.
      raise exception 'reference_conflict' using errcode = 'P0001';
  end;

  return jsonb_build_object(
    'application_id', v_application_id,
    'reference', v_reference,
    'duplicate', false
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
-- Antwort:  { "ok": true, "duplicate": bool } oder Fehler 'not_found' / 'validation_failed'.

create function public.rpc_submit_follow_up(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_application_id uuid;
  v_follow_up_id uuid;
begin
  if payload is null or jsonb_typeof(payload) <> 'object' then
    raise exception 'validation_failed' using errcode = 'P0001';
  end if;

  select a.id into v_application_id
  from public.applications a
  where a.reference = upper(btrim(payload ->> 'reference'))
    and a.purge_state = 'active';

  if v_application_id is null then
    raise exception 'not_found' using errcode = 'P0001';
  end if;

  begin
    insert into public.application_follow_ups (
      application_id, idempotency_key, start_date, postal_code, message, mappe, received_at
    )
    values (
      v_application_id,
      payload ->> 'idempotency_key',
      nullif(btrim(payload ->> 'start_date'), ''),
      nullif(btrim(payload ->> 'postal_code'), ''),
      nullif(btrim(payload ->> 'message'), ''),
      case when jsonb_typeof(payload -> 'mappe') = 'object' then payload -> 'mappe' end,
      coalesce((payload ->> 'received_at')::timestamptz, now())
    )
    on conflict (idempotency_key) do nothing
    returning id into v_follow_up_id;
  exception
    when check_violation or not_null_violation or string_data_right_truncation
      or invalid_text_representation or invalid_datetime_format or datetime_field_overflow then
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
-- Feste Zeitfenster. p_key_hash = HMAC-SHA256(IP) als Hex aus Next; die IP selbst
-- erreicht die Datenbank nie. Antwort: { "allowed", "remaining", "retry_after_sec" }.

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

  insert into private.rate_limit_counters as c (key_hash, action, window_start, hits)
  values (p_key_hash, p_action, v_window_start, 1)
  on conflict (key_hash, action, window_start)
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
