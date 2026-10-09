-- Intake-RPCs: Idempotenz und erneute Einsendung, Validierung (fail-closed), Kontakt-Snapshot
-- je Bewerbung, Bestätigungs-Obergrenze, Spam, Versand aus, Ergänzungen mit Grenzen, Rate-Limit.
begin;
create extension if not exists pgtap with schema extensions;

-- Erforderlich: Die Baseline widerruft EXECUTE für PUBLIC auf neue Funktionen von postgres.
do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as fn
    from pg_proc p
    join pg_depend d on d.objid = p.oid and d.deptype = 'e'
    join pg_extension e on e.oid = d.refobjid and e.extname = 'pgtap'
  loop
    execute format('grant execute on function %s to public', r.fn);
  end loop;
end $$;

select plan(39);

-- Test-Payload als Funktion (nur in dieser Transaktion). NULL-Werte fallen weg.
create function pg_temp.app(
  p_ref text, p_key text, p_email text, p_phone text, p_spam boolean, p_name text, p_hash text
)
returns jsonb language sql as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'reference', p_ref, 'idempotency_key', p_key, 'content_hash', p_hash,
    'submitted_at', '2026-10-08T12:00:00Z',
    'job', jsonb_build_object('id', 'kundendiensttechniker-shk', 'title', 'Kundendiensttechniker SHK (m/w/d)', 'question_set', 'fachkraft'),
    'answers', jsonb_build_object('qualification', 'geselle-ueber-5', 'start', 'sofort'),
    'name', p_name,
    'phone', jsonb_build_object('raw', '0151 2345678', 'e164', p_phone),
    'email', p_email,
    'contact_channel', 'phone', 'acquisition_channel', 'google_jobs',
    'attribution', jsonb_build_object('utm_source', 'google', 'landing_path', '/jobs/kundendiensttechniker-shk-wetzlar'),
    'privacy_notice_version', '2026-10', 'suspected_spam', p_spam,
    'spam_signals', case when p_spam then '["fast"]'::jsonb else '[]'::jsonb end,
    'fill_duration_ms', 1500
  ));
$$;
grant execute on function pg_temp.app(text, text, text, text, boolean, text, text) to public;

-- Versand eingeschaltet, damit die Obergrenze greift (Standard: aus ⇒ 'disabled').
update private.app_settings set enabled = true where key = 'outbound_email_enabled';

set local role service_role;

-- Idempotenz und erneute Einsendung ------------------------------------------------
select is(
  public.rpc_submit_application(pg_temp.app('BE-26-AAAA22', '10000000-0000-4000-8000-000000000001', 'max@example.com', '+491512345678', false, 'Max Beispiel', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')) ->> 'duplicate',
  'false',
  'Erste Einsendung wird angelegt'
);
select is(
  public.rpc_submit_application(pg_temp.app('BE-26-AAAA22', '10000000-0000-4000-8000-000000000001', 'max@example.com', '+491512345678', false, 'Max Beispiel', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')) ->> 'reference',
  'BE-26-AAAA22',
  'Wiederholung mit gleichem Key und Inhalt liefert dieselbe Nummer'
);
select is(
  public.rpc_submit_application(pg_temp.app('BE-26-AAAA22', '10000000-0000-4000-8000-000000000001', 'max@example.com', '+491512345678', false, 'Max Beispiel', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')) ->> 'duplicate',
  'true',
  'Wiederholung ist als Duplikat markiert'
);
select is(
  public.rpc_submit_application(pg_temp.app('BE-26-AAAA22', '10000000-0000-4000-8000-000000000001', 'max@example.com', '+491512345678', false, 'Max Beispiel', 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')) ->> 'resubmitted',
  'true',
  'Gleicher Key mit geänderten Angaben aktualisiert die Bewerbung unter derselben Nummer'
);

-- Validierung ------------------------------------------------------------------------
select throws_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA22', '10000000-0000-4000-8000-000000000099', null, '+491512345678', false, 'Max Beispiel', null)) $$,
  'P0001', 'reference_conflict',
  'Gleiche Nummer mit anderem Key wird abgelehnt'
);
select throws_ok(
  $$ select public.rpc_submit_application(pg_temp.app('ungueltig', '10000000-0000-4000-8000-000000000002', null, null, false, 'Max Beispiel', null)) $$,
  'P0001', 'validation_failed',
  'Ungültige Nummer ergibt validation_failed ohne Details'
);
select throws_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA33', 'kein-uuid', null, null, false, 'Max Beispiel', null)) $$,
  'P0001', 'validation_failed',
  'Ungültiger Idempotency-Key ergibt validation_failed'
);
select throws_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA33', '10000000-0000-4000-8000-000000000003', null, null, false, 'Max Beispiel', null)
       || '{"job": {"id": "erfunden", "title": "x", "question_set": "fachkraft"}}'::jsonb) $$,
  'P0001', 'validation_failed',
  'Unbekannte Stellen-ID wird abgelehnt'
);
select throws_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA33', '10000000-0000-4000-8000-000000000003', null, null, false, 'Max Beispiel', null)
       - 'suspected_spam') $$,
  'P0001', 'validation_failed',
  'Fehlendes suspected_spam wird nicht still ergänzt'
);
select throws_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA33', '10000000-0000-4000-8000-000000000003', null, null, false, 'Max Beispiel', null)
       || '{"spam_signals": "fast"}'::jsonb) $$,
  'P0001', 'validation_failed',
  'spam_signals muss ein Array sein'
);
select throws_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA33', '10000000-0000-4000-8000-000000000003', null, null, false, 'Max Beispiel', 'XYZ')) $$,
  'P0001', 'validation_failed',
  'Ungültiger content_hash wird abgelehnt'
);

-- Weitere Einsendungen -------------------------------------------------------------
select lives_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA33', '10000000-0000-4000-8000-000000000003', null, null, false, 'Max Beispiel', null)
       || '{"fill_duration_ms": 3000000000}'::jsonb) $$,
  'Ausfülldauer außerhalb von int4 lässt die Bewerbung nicht scheitern'
);
select lives_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA44', '10000000-0000-4000-8000-000000000004', 'mallory@example.com', '+491512345678', false, 'Mallory Muster', null)) $$,
  'Fremde Einsendung mit derselben Telefonnummer'
);
select lives_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA55', '10000000-0000-4000-8000-000000000005', 'max@example.com', null, false, 'Max Beispiel', null)) $$,
  'Zweite Bewerbung mit derselben E-Mail'
);
select lives_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA66', '10000000-0000-4000-8000-000000000006', 'max@example.com', null, false, 'Max Beispiel', null)) $$,
  'Dritte Bewerbung mit derselben E-Mail'
);
select lives_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA77', '10000000-0000-4000-8000-000000000007', 'max@example.com', null, false, 'Max Beispiel', null)) $$,
  'Vierte Bewerbung mit derselben E-Mail'
);
select lives_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA88', '10000000-0000-4000-8000-000000000008', 'spam@example.com', null, false, 'Max Beispiel', null)
       || '{"spam_signals": ["honeypot"]}'::jsonb) $$,
  'Bewerbung nur mit Spam-Signal wird gespeichert'
);
select lives_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA99', '10000000-0000-4000-8000-000000000009', null, '+491709999999', false, 'Max Beispiel', null)) $$,
  'Bewerbung ohne E-Mail wird gespeichert'
);

reset role;

select is(
  (select c.full_name || '|' || c.email from public.candidates c
     join public.applications a on a.candidate_id = c.id where a.reference = 'BE-26-AAAA22'),
  'Max Beispiel|max@example.com',
  'Fremde Einsendung mit gleicher Nummer ändert den Kontakt-Snapshot nicht'
);
select is(
  (select count(distinct candidate_id) from public.applications
    where reference in ('BE-26-AAAA22', 'BE-26-AAAA44', 'BE-26-AAAA55', 'BE-26-AAAA66', 'BE-26-AAAA77')),
  5::bigint,
  'Jede Bewerbung hat einen eigenen Kontakt-Snapshot'
);
select is(
  (select array_agg(coalesce(o.skip_reason, o.status) order by a.reference)
     from private.outbox o join public.applications a on a.id = o.application_id
    where o.kind = 'application_confirmation'
      and a.reference in ('BE-26-AAAA22', 'BE-26-AAAA55', 'BE-26-AAAA66', 'BE-26-AAAA77')),
  array['pending', 'pending', 'pending', 'recipient_cap'],
  'Höchstens 3 Eingangsbestätigungen je Empfänger in 24 h'
);
select is(
  (select a.suspected_spam::text || '|' || o.skip_reason
     from public.applications a
     join private.outbox o on o.application_id = a.id and o.kind = 'application_confirmation'
    where a.reference = 'BE-26-AAAA88'),
  'true|suspected_spam',
  'Ein Spam-Signal allein gilt als Spamverdacht: keine Bestätigung'
);
select is(
  (select count(*) from private.outbox o join public.applications a on a.id = o.application_id
    where o.kind = 'application_confirmation' and a.reference = 'BE-26-AAAA99'),
  0::bigint,
  'Ohne E-Mail keine Bestätigung'
);
select is(
  (select count(*) from private.outbox o join public.applications a on a.id = o.application_id
    where o.kind = 'application_team' and a.reference like 'BE-26-AAAA%'),
  9::bigint,
  'Teammail je neuer Bewerbung (8) und je erneuter Einsendung (1)'
);
select is(
  (select o.recipient_hash from private.outbox o join public.applications a on a.id = o.application_id
    where o.kind = 'application_confirmation' and a.reference = 'BE-26-AAAA22'),
  encode(extensions.digest('max@example.com', 'sha256'), 'hex'),
  'Outbox speichert nur den Hash der Empfängeradresse'
);
select is(
  (select fill_duration_ms from public.applications where reference = 'BE-26-AAAA33'),
  null::integer,
  'Unplausible Ausfülldauer wird verworfen'
);
select is(
  (select string_agg(e.event_type, ',' order by e.id) from public.application_events e
     join public.applications a on a.id = e.application_id where a.reference = 'BE-26-AAAA22'),
  'submitted,resubmitted',
  'Erneute Einsendung steht in der Zeitleiste'
);
select is(
  (select idempotency_key_hash from public.applications where reference = 'BE-26-AAAA22'),
  encode(extensions.digest('10000000-0000-4000-8000-000000000001', 'sha256'), 'hex'),
  'Idempotency-Key wird nur als Hash gespeichert'
);

-- Versand aus ⇒ Bestätigung wird nicht später nachgeholt -------------------------------
update private.app_settings set enabled = false where key = 'outbound_email_enabled';
set local role service_role;
select lives_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAAB2', '10000000-0000-4000-8000-000000000010', 'neu@example.com', null, false, 'Max Beispiel', null)) $$,
  'Bewerbung bei ausgeschaltetem Versand'
);
reset role;
select is(
  (select o.skip_reason from private.outbox o join public.applications a on a.id = o.application_id
    where o.kind = 'application_confirmation' and a.reference = 'BE-26-AAAAB2'),
  'disabled',
  'Bei ausgeschaltetem Versand wird die Bestätigung als disabled übersprungen'
);

-- Ergänzungen --------------------------------------------------------------------------
set local role service_role;
select is(
  public.rpc_submit_follow_up('{"reference": "be-26-aaaa22", "idempotency_key": "f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0", "postal_code": "35578"}'::jsonb) ->> 'duplicate',
  'false',
  'Ergänzung wird angelegt (Nummer ohne Rücksicht auf Groß-/Kleinschreibung)'
);
select is(
  public.rpc_submit_follow_up('{"reference": "BE-26-AAAA22", "idempotency_key": "f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0", "postal_code": "35578"}'::jsonb) ->> 'duplicate',
  'true',
  'Gleiche Ergänzung wird nur einmal gespeichert'
);
select lives_ok(
  $$ select count(*) from generate_series(1, 4) i,
       lateral public.rpc_submit_follow_up(jsonb_build_object(
         'reference', 'BE-26-AAAA22', 'idempotency_key', 'e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e' || i)) $$,
  'Vier weitere Ergänzungen (5 in 24 h)'
);
select throws_ok(
  $$ select public.rpc_submit_follow_up('{"reference": "BE-26-AAAA22", "idempotency_key": "d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0"}'::jsonb) $$,
  'P0001', 'follow_up_limit',
  'Die sechste Ergänzung in 24 h wird abgelehnt'
);
select throws_ok(
  $$ select public.rpc_submit_follow_up('{"reference": "BE-26-ZZZZ22", "idempotency_key": "c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0"}'::jsonb) $$,
  'P0001', 'not_found',
  'Ergänzung zu unbekannter Nummer'
);
reset role;
update public.applications set erasure_requested_at = now() where reference = 'BE-26-AAAA55';
set local role service_role;
select throws_ok(
  $$ select public.rpc_submit_follow_up('{"reference": "BE-26-AAAA55", "idempotency_key": "b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0"}'::jsonb) $$,
  'P0001', 'not_found',
  'Keine Ergänzung nach einem Löschantrag'
);

-- Rate-Limit ---------------------------------------------------------------------------
select is(
  (select array_agg((public.rpc_rate_limit_hit(repeat('ab', 32), 'apply', 2, 600)) ->> 'allowed') from generate_series(1, 3)),
  array['true', 'true', 'false'],
  'Rate-Limit greift nach dem Limit'
);
select is(
  public.rpc_rate_limit_hit(repeat('ab', 32), 'apply', 2, 86400) ->> 'allowed',
  'true',
  'Eine Regel mit anderem Fenster zählt getrennt'
);
select throws_ok(
  $$ select public.rpc_rate_limit_hit('192.168.0.1', 'apply', 2, 600) $$,
  'P0001', 'validation_failed',
  'Nur Hashes als Schlüssel, nie Klartext'
);
reset role;

select * from finish();
rollback;
