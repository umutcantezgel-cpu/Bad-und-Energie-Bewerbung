-- Intake-RPCs: Idempotenz, Kandidaten-Dedupe, Bestätigungs-Obergrenze, Spam, Ergänzungen, Rate-Limit.
begin;
create extension if not exists pgtap with schema extensions;

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

select plan(20);

-- Test-Payload als Funktion (nur in dieser Transaktion).
create function pg_temp.app(p_ref text, p_key text, p_email text, p_phone text, p_spam boolean)
returns jsonb language sql as $$
  select jsonb_build_object(
    'reference', p_ref, 'idempotency_key', p_key, 'submitted_at', '2026-10-08T12:00:00Z',
    'job', jsonb_build_object('id', 'kundendiensttechniker-shk', 'title', 'Kundendiensttechniker SHK (m/w/d)', 'question_set', 'fachkraft'),
    'answers', jsonb_build_object('qualification', 'geselle-ueber-5', 'start', 'sofort'),
    'name', 'Max Beispiel',
    'phone', jsonb_build_object('raw', '0151 2345678', 'e164', p_phone),
    'email', p_email,
    'contact_channel', 'phone', 'acquisition_channel', 'google_jobs',
    'attribution', jsonb_build_object('utm_source', 'google', 'landing_path', '/jobs/kundendiensttechniker-shk-wetzlar'),
    'privacy_notice_version', '2026-10', 'suspected_spam', p_spam,
    'spam_signals', case when p_spam then '["fast"]'::jsonb else '[]'::jsonb end,
    'fill_duration_ms', 1500
  );
$$;
grant execute on function pg_temp.app(text, text, text, text, boolean) to public;

set local role service_role;

select is(
  public.rpc_submit_application(pg_temp.app('BE-26-AAAA22', '10000000-0000-4000-8000-000000000001', 'max@example.com', '+491512345678', false)) ->> 'duplicate',
  'false',
  'Erste Einsendung wird angelegt'
);

select is(
  public.rpc_submit_application(pg_temp.app('BE-26-AAAA22', '10000000-0000-4000-8000-000000000001', 'max@example.com', '+491512345678', false)) ->> 'reference',
  'BE-26-AAAA22',
  'Wiederholung mit gleichem Key liefert dieselbe Nummer'
);

select is(
  public.rpc_submit_application(pg_temp.app('BE-26-AAAA22', '10000000-0000-4000-8000-000000000001', 'max@example.com', '+491512345678', false)) ->> 'duplicate',
  'true',
  'Wiederholung ist als Duplikat markiert'
);

select throws_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA22', '10000000-0000-4000-8000-000000000099', null, '+491512345678', false)) $$,
  'P0001', 'reference_conflict',
  'Gleiche Nummer mit anderem Key wird abgelehnt'
);

select throws_ok(
  $$ select public.rpc_submit_application(pg_temp.app('ungueltig', '10000000-0000-4000-8000-000000000002', null, null, false)) $$,
  'P0001', 'validation_failed',
  'Ungültige Nummer ergibt validation_failed ohne Details'
);

select throws_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA33', 'kein-uuid', null, null, false)) $$,
  'P0001', 'validation_failed',
  'Ungültiger Idempotency-Key ergibt validation_failed'
);

select throws_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA33', '10000000-0000-4000-8000-000000000003', null, null, false) || '{"job": {"id": "erfunden", "title": "x", "question_set": "fachkraft"}}'::jsonb) $$,
  'P0001', 'validation_failed',
  'Unbekannte Stellen-ID wird abgelehnt'
);

-- Zweite Bewerbung derselben Person (gleiche Telefonnummer) → gleicher Kandidat.
select lives_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA44', '10000000-0000-4000-8000-000000000004', 'max@example.com', '+491512345678', false)) $$,
  'Zweite Bewerbung derselben Person'
);

-- Dritte und vierte Bewerbung mit derselben E-Mail (ohne Telefon-E.164).
select lives_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA55', '10000000-0000-4000-8000-000000000005', 'max@example.com', null, false)) $$,
  'Dritte Bewerbung'
);
select lives_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA66', '10000000-0000-4000-8000-000000000006', 'max@example.com', null, false)) $$,
  'Vierte Bewerbung'
);

-- Spamverdacht und Bewerbung ohne E-Mail.
select lives_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA77', '10000000-0000-4000-8000-000000000007', 'spam@example.com', null, true)) $$,
  'Bewerbung mit Spamverdacht wird gespeichert'
);
select lives_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-AAAA88', '10000000-0000-4000-8000-000000000008', null, '+491709999999', false)) $$,
  'Bewerbung ohne E-Mail wird gespeichert'
);

reset role;

select is(
  (select count(distinct candidate_id) from public.applications where reference in ('BE-26-AAAA22', 'BE-26-AAAA44', 'BE-26-AAAA55', 'BE-26-AAAA66')),
  1::bigint,
  'Kandidat wird über Telefon bzw. E-Mail wiedererkannt'
);

select is(
  (select array_agg(coalesce(skip_reason, status) order by a.reference)
     from private.outbox o join public.applications a on a.id = o.application_id
    where o.kind = 'application_confirmation'
      and a.reference in ('BE-26-AAAA22', 'BE-26-AAAA44', 'BE-26-AAAA55', 'BE-26-AAAA66')),
  array['pending', 'pending', 'pending', 'recipient_cap'],
  'Höchstens 3 Eingangsbestätigungen je Empfänger in 24 h'
);

select is(
  (select skip_reason from private.outbox o join public.applications a on a.id = o.application_id
    where o.kind = 'application_confirmation' and a.reference = 'BE-26-AAAA77'),
  'suspected_spam',
  'Keine Bestätigung bei Spamverdacht'
);

select is(
  (select count(*) from private.outbox o join public.applications a on a.id = o.application_id
    where o.kind = 'application_confirmation' and a.reference = 'BE-26-AAAA88'),
  0::bigint,
  'Ohne E-Mail keine Bestätigung'
);

select is(
  (select count(*) from private.outbox where kind = 'application_team'),
  6::bigint,
  'Jede neue Bewerbung erzeugt genau eine Teammail'
);

-- Ergänzung (idempotent)
set local role service_role;
select is(
  public.rpc_submit_follow_up('{"reference": "be-26-aaaa22", "idempotency_key": "f0f0f0f0f0f0f0f0f0f0f0f0", "postal_code": "35578"}'::jsonb) ->> 'duplicate',
  'false',
  'Ergänzung wird angelegt (Nummer ohne Rücksicht auf Groß-/Kleinschreibung)'
);
select is(
  public.rpc_submit_follow_up('{"reference": "BE-26-AAAA22", "idempotency_key": "f0f0f0f0f0f0f0f0f0f0f0f0", "postal_code": "35578"}'::jsonb) ->> 'duplicate',
  'true',
  'Gleiche Ergänzung wird nur einmal gespeichert'
);

-- Rate-Limit: 2 erlaubt, der dritte Aufruf im selben Fenster nicht.
select is(
  (select array_agg((public.rpc_rate_limit_hit(repeat('ab', 32), 'apply', 2, 600)) ->> 'allowed') from generate_series(1, 3)),
  array['true', 'true', 'false'],
  'Rate-Limit greift nach dem Limit'
);
reset role;

select * from finish();
rollback;
