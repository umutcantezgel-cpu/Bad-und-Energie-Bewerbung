-- RLS-Matrix: anon, Nicht-Staff, aal1, viewer, deaktivierter viewer, recruiter, service_role.
begin;
create extension if not exists pgtap with schema extensions;

-- pgTAP-Funktionen auch für API-Rollen ausführbar machen (nur in dieser Test-Transaktion).
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

select plan(24);

-- Testdaten (als postgres). Eingeladene Nutzer ohne Passwort ⇒ Staff aus der Allowlist.
insert into private.staff_email_allowlist (email, role) values
  ('admin@test.local', 'admin'),
  ('recruiter@test.local', 'recruiter'),
  ('viewer@test.local', 'viewer'),
  ('former@test.local', 'viewer');

insert into auth.users (id, email, aud, role) values
  ('11111111-1111-4111-8111-111111111111', 'admin@test.local', 'authenticated', 'authenticated'),
  ('22222222-2222-4222-8222-222222222222', 'recruiter@test.local', 'authenticated', 'authenticated'),
  ('33333333-3333-4333-8333-333333333333', 'viewer@test.local', 'authenticated', 'authenticated'),
  ('44444444-4444-4444-8444-444444444444', 'outsider@test.local', 'authenticated', 'authenticated'),
  ('55555555-5555-4555-8555-555555555555', 'former@test.local', 'authenticated', 'authenticated');

update public.staff set is_active = false, deactivated_at = now()
where user_id = '55555555-5555-4555-8555-555555555555';

select lives_ok(
  $$ select public.rpc_submit_application($json${
    "reference": "BE-26-RQS234", "idempotency_key": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "submitted_at": "2026-10-08T12:00:00Z",
    "job": {"id": "anlagenmechaniker-shk", "title": "Anlagenmechaniker SHK (m/w/d)", "question_set": "fachkraft"},
    "answers": {"qualification": "geselle-2-5"}, "name": "Erika Muster",
    "phone": {"raw": "0170 1234567", "e164": "+491701234567"}, "email": "erika@example.com",
    "contact_channel": "whatsapp", "acquisition_channel": "direct", "attribution": {},
    "privacy_notice_version": "2026-10", "suspected_spam": false, "spam_signals": []
  }$json$::jsonb) $$,
  'Fixture: Bewerbung BE-26-RQS234'
);

-- anon --------------------------------------------------------------------
set local role anon;
select throws_ok('select count(*) from public.applications', '42501', null, 'anon: kein Lesezugriff auf applications');
select throws_ok('select count(*) from public.candidates', '42501', null, 'anon: kein Lesezugriff auf candidates');
select throws_ok($$ select public.rpc_submit_application('{}'::jsonb) $$, '42501', null, 'anon: RPC nicht ausführbar');
reset role;

-- authenticated, aber kein Staff ------------------------------------------
set local request.jwt.claims to '{"sub": "44444444-4444-4444-8444-444444444444", "role": "authenticated", "aal": "aal2"}';
set local role authenticated;
select is((select count(*) from public.applications where reference = 'BE-26-RQS234'), 0::bigint, 'Nicht-Staff (aal2) sieht keine Bewerbungen');
select throws_ok($$ select public.rpc_submit_application('{}'::jsonb) $$, '42501', null, 'authenticated: RPC nicht ausführbar');
reset role;

-- viewer mit aal1 ----------------------------------------------------------
set local request.jwt.claims to '{"sub": "33333333-3333-4333-8333-333333333333", "role": "authenticated", "aal": "aal1"}';
set local role authenticated;
select is((select count(*) from public.applications where reference = 'BE-26-RQS234'), 0::bigint, 'Staff ohne MFA (aal1) sieht keine Bewerbungen');
reset role;

-- deaktivierter viewer mit aal2 -------------------------------------------
set local request.jwt.claims to '{"sub": "55555555-5555-4555-8555-555555555555", "role": "authenticated", "aal": "aal2"}';
set local role authenticated;
select is((select count(*) from public.applications where reference = 'BE-26-RQS234'), 0::bigint, 'Deaktiviertes Staff-Mitglied sieht keine Bewerbungen');
select is((select count(*) from public.candidates), 0::bigint, 'Deaktiviertes Staff-Mitglied sieht keine Kandidaten');
reset role;

-- viewer mit aal2 ----------------------------------------------------------
set local request.jwt.claims to '{"sub": "33333333-3333-4333-8333-333333333333", "role": "authenticated", "aal": "aal2"}';
set local role authenticated;
select is((select count(*) from public.applications where reference = 'BE-26-RQS234'), 1::bigint, 'viewer (aal2) sieht die Bewerbung');
select is(
  (select count(*) from public.candidates c
    where c.id = (select a.candidate_id from public.applications a where a.reference = 'BE-26-RQS234')),
  1::bigint,
  'viewer (aal2) sieht den Kontakt-Snapshot'
);
update public.applications set stage = 'kontaktiert' where reference = 'BE-26-RQS234';
select throws_ok(
  $$ insert into public.application_notes (application_id, body)
     select id, 'x' from public.applications where reference = 'BE-26-RQS234' $$,
  '42501', null, 'viewer kann keine Notiz anlegen'
);
reset role;
select is((select stage::text from public.applications where reference = 'BE-26-RQS234'), 'neu', 'viewer kann die Stufe nicht ändern');

-- recruiter mit aal2 -------------------------------------------------------
set local request.jwt.claims to '{"sub": "22222222-2222-4222-8222-222222222222", "role": "authenticated", "aal": "aal2"}';
set local role authenticated;
update public.applications set stage = 'kontaktiert', rating = 4 where reference = 'BE-26-RQS234';
select throws_ok(
  $$ update public.applications set job_title = 'x' where reference = 'BE-26-RQS234' $$,
  '42501', null, 'recruiter darf job_title nicht ändern (Spaltenrecht)'
);
select lives_ok(
  $$ insert into public.application_notes (application_id, body)
     select id, 'Rückruf vereinbart' from public.applications where reference = 'BE-26-RQS234' $$,
  'recruiter kann eine eigene Notiz anlegen'
);
select throws_ok(
  $$ insert into public.application_notes (application_id, body, author_id)
     select id, 'x', '11111111-1111-4111-8111-111111111111' from public.applications where reference = 'BE-26-RQS234' $$,
  '42501', null, 'recruiter kann keine Notiz im Namen anderer anlegen'
);
select throws_ok(
  $$ delete from public.applications where reference = 'BE-26-RQS234' $$,
  '42501', null, 'recruiter darf nicht löschen'
);
select throws_ok(
  $$ update public.applications set rejection_notified_at = now() where reference = 'BE-26-RQS234' $$,
  'P0001', 'validation_failed', 'Absage-Mitteilung nur in der Stufe abgesagt'
);
-- Rückdatierte und zukünftige Mitteilung: Die DB setzt jeweils den aktuellen Zeitpunkt.
update public.applications set stage = 'abgesagt', rejection_notified_at = '2000-01-01T00:00:00Z'
where reference = 'BE-26-RQS234';
reset role;
select is(
  (select rejection_notified_at from public.applications where reference = 'BE-26-RQS234'),
  now(),
  'rückdatierte Absage-Mitteilung wird auf jetzt gesetzt'
);
set local role authenticated;
update public.applications set rejection_notified_at = '2999-01-01T00:00:00Z'
where reference = 'BE-26-RQS234';
reset role;
select is(
  (select retention_until from public.applications where reference = 'BE-26-RQS234'),
  now() + interval '6 months',
  'zukünftige Absage-Mitteilung verlängert die Löschfrist nicht'
);

select is(
  (select count(*) from public.application_events e join public.applications a on a.id = e.application_id
    where a.reference = 'BE-26-RQS234'
      and e.event_type in ('stage_changed', 'rated', 'note_added')
      and e.actor_id = '22222222-2222-4222-8222-222222222222'),
  4::bigint,
  'Zwei Stufenwechsel, Bewertung und Notiz stehen mit Akteur in der Zeitleiste'
);

select results_eq(
  $$ select fields from private.audit_log
      where entity = 'applications' and actor_id = '22222222-2222-4222-8222-222222222222'
      order by id $$,
  $$ values (array['stage', 'rating']), (array['stage', 'rejection_notified_at']) $$,
  'Audit-Einträge für die Änderungen des recruiters (nur Feldnamen)'
);

-- service_role -------------------------------------------------------------
set local role service_role;
select throws_ok('select count(*) from public.applications', '42501', null, 'service_role: kein direkter Tabellenzugriff');
reset role;

-- Staff wird deaktiviert, nicht gelöscht: Akteure der Zeitleiste sind geschützt.
select throws_ok(
  $$ delete from auth.users where id = '22222222-2222-4222-8222-222222222222' $$,
  '23503', null,
  'Auth-Nutzer mit Einträgen in der Zeitleiste lässt sich nicht löschen'
);

select * from finish();
rollback;
