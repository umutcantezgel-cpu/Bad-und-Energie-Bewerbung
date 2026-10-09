-- Löschfristen (private.compute_retention), Audit-Felder, append-only-Zeitleiste,
-- Löschschutz der Kontakt-Snapshots und Standard-Schalter.
-- Läuft als Owner (postgres): Zeitpunkte dürfen hier gesetzt werden; für API-Aufrufer
-- erzwingt die DB now() (siehe 20_rls). now() ist innerhalb der Transaktion konstant.
begin;
create extension if not exists pgtap with schema extensions;
select plan(18);

create function pg_temp.app(p_ref text, p_key text)
returns jsonb language sql as $$
  select jsonb_build_object(
    'reference', p_ref, 'idempotency_key', p_key, 'submitted_at', '2026-10-08T12:00:00Z',
    'job', jsonb_build_object('id', 'ausbildung-anlagenmechaniker-shk', 'title', 'Ausbildung Anlagenmechaniker SHK (m/w/d)', 'question_set', 'ausbildung'),
    'answers', jsonb_build_object('schoolStatus', 'schule-fertig'), 'name', 'Lena Test',
    'phone', jsonb_build_object('raw', '0160 1112223', 'e164', '+491601112223'),
    'contact_channel', 'whatsapp', 'acquisition_channel', 'direct', 'attribution', '{}'::jsonb,
    'privacy_notice_version', '2026-10', 'suspected_spam', false, 'spam_signals', '[]'::jsonb
  );
$$;

select lives_ok(
  $$ select public.rpc_submit_application(pg_temp.app('BE-26-RET234', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')),
            public.rpc_submit_application(pg_temp.app('BE-26-RET235', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbc')),
            public.rpc_submit_application(pg_temp.app('BE-26-RET236', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbd')),
            public.rpc_submit_application(pg_temp.app('BE-26-RET237', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbe')) $$,
  'Fixtures: vier Bewerbungen'
);

select is(
  (select retention_until from public.applications where reference = 'BE-26-RET234'),
  now() + interval '12 months',
  'Offene Bewerbung: 12 Monate ab letzter Aktivität'
);

-- Mitteilung vor dem Stufenwechsel: maßgeblich ist der Stufenwechsel (jetzt).
update public.applications
set stage = 'abgesagt', rejection_notified_at = now() - interval '1 day'
where reference = 'BE-26-RET234';

select is(
  (select retention_until from public.applications where reference = 'BE-26-RET234'),
  now() + interval '6 months',
  'Absage: 6 Monate ab Mitteilung, frühestens ab dem Stufenwechsel'
);

select is(
  (select fields from private.audit_log a join public.applications p on p.id = a.entity_id
    where p.reference = 'BE-26-RET234' order by a.id limit 1),
  array['stage', 'rejection_notified_at'],
  'Audit nennt die geänderten Felder'
);

-- Mitteilung in der Zukunft: Basis höchstens jetzt.
update public.applications
set rejection_notified_at = now() + interval '30 days'
where reference = 'BE-26-RET234';

select is(
  (select retention_until from public.applications where reference = 'BE-26-RET234'),
  now() + interval '6 months',
  'Absage-Mitteilung in der Zukunft verlängert die Frist nicht'
);

update public.applications
set talent_pool_consent_at = now()
where reference = 'BE-26-RET234';

select is(
  (select retention_until from public.applications where reference = 'BE-26-RET234'),
  now() + interval '24 months',
  'Talent-Pool-Einwilligung: 24 Monate ab Einwilligung'
);

update public.applications
set talent_pool_revoked_at = now()
where reference = 'BE-26-RET234';

select is(
  (select retention_until from public.applications where reference = 'BE-26-RET234'),
  now() + interval '6 months',
  'Widerruf der Talent-Pool-Einwilligung: zurück auf die Regel-Frist'
);

update public.applications
set erasure_requested_at = now()
where reference = 'BE-26-RET234';

select is(
  (select retention_until from public.applications where reference = 'BE-26-RET234'),
  now(),
  'Löschantrag: sofort fällig'
);

select ok(
  (select bool_or('erasure_requested_at' = any (a.fields)) from private.audit_log a
     join public.applications p on p.id = a.entity_id where p.reference = 'BE-26-RET234'),
  'Löschantrag steht im Audit'
);

select is(
  (select count(*) from public.application_events e join public.applications a on a.id = e.application_id
    where a.reference = 'BE-26-RET234' and e.event_type in ('stage_changed', 'consent_changed')),
  3::bigint,
  'Stufenwechsel und zwei Einwilligungsänderungen stehen in der Zeitleiste'
);

select throws_ok(
  $$ update public.application_events set event_type = 'exported'
     where application_id = (select id from public.applications where reference = 'BE-26-RET234') $$,
  'P0001',
  'application_events is append-only',
  'Zeitleiste ist append-only'
);

update public.applications set stage = 'zurueckgezogen' where reference = 'BE-26-RET235';
update public.applications set stage = 'eingestellt' where reference = 'BE-26-RET236';

select is(
  (select array_agg(retention_until order by reference) from public.applications
    where reference in ('BE-26-RET235', 'BE-26-RET236')),
  array[now() + interval '6 months', now() + interval '6 months'],
  'Rückzug und Einstellung: 6 Monate ab Stufenwechsel'
);

-- Abmelden durch Kaskade (Staff-Mitglied ohne Zeitleisten-Einträge gelöscht) verlängert nichts.
insert into private.staff_email_allowlist (email, role) values ('assignee@test.local', 'viewer');
insert into auth.users (id, email, aud, role) values
  ('77777777-7777-4777-8777-777777777777', 'assignee@test.local', 'authenticated', 'authenticated');
update public.applications
set assigned_to = '77777777-7777-4777-8777-777777777777'
where reference = 'BE-26-RET237';
update public.applications
set last_activity_at = now() - interval '30 days'
where reference = 'BE-26-RET237';
delete from auth.users where id = '77777777-7777-4777-8777-777777777777';

select is(
  (select last_activity_at from public.applications where reference = 'BE-26-RET237'),
  now() - interval '30 days',
  'Abmelden durch Kaskade zählt nicht als Aktivität'
);

-- Basis unterscheidbar von now(): Die Frist hängt an der Aktivität bzw. am Stufenwechsel,
-- nicht am Zeitpunkt der letzten Änderung.
select is(
  (select retention_until from public.applications where reference = 'BE-26-RET237'),
  now() - interval '30 days' + interval '12 months',
  'Offene Bewerbung: 12 Monate ab letzter Aktivität, nicht ab der letzten Änderung'
);

update public.applications set stage_changed_at = now() - interval '2 months' where reference = 'BE-26-RET236';
update public.applications set rating = 2 where reference = 'BE-26-RET236';
select lives_ok(
  $$ select public.rpc_submit_follow_up('{"reference": "BE-26-RET236", "idempotency_key": "7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a", "message": "Nachtrag"}'::jsonb) $$,
  'Ergänzung nach der Einstellung'
);
select is(
  (select retention_until from public.applications where reference = 'BE-26-RET236'),
  now() - interval '2 months' + interval '6 months',
  'Einstellung: 6 Monate ab Stufenwechsel, spätere Aktivität verlängert nicht'
);

select throws_ok(
  $$ delete from public.candidates
     where id = (select candidate_id from public.applications where reference = 'BE-26-RET235') $$,
  '23503', null,
  'Kontakt-Snapshot lässt sich nicht vor seiner Bewerbung löschen'
);

select results_eq(
  $$ select key, enabled from private.app_settings order by key $$,
  $$ values ('ops_alert_enabled', false), ('outbound_email_enabled', false), ('retention_dry_run', true),
            ('retention_enabled', false), ('revalidate_enabled', false), ('sla_digest_enabled', false) $$,
  'Alle Schalter stehen standardmäßig auf aus (Löschung nur im Dry-Run)'
);

select * from finish();
rollback;
