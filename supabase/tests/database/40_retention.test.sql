-- Löschfristen (private.compute_retention) und append-only-Zeitleiste.
begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

select public.rpc_submit_application($json${
  "reference": "BE-26-RET234", "idempotency_key": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  "submitted_at": "2026-10-08T12:00:00Z",
  "job": {"id": "ausbildung-anlagenmechaniker-shk", "title": "Ausbildung Anlagenmechaniker SHK (m/w/d)", "question_set": "ausbildung"},
  "answers": {"schoolStatus": "schule-fertig"}, "name": "Lena Test",
  "phone": {"raw": "0160 1112223", "e164": "+491601112223"},
  "contact_channel": "whatsapp", "acquisition_channel": "direct", "attribution": {},
  "privacy_notice_version": "2026-10", "suspected_spam": false, "spam_signals": []
}$json$::jsonb);

select ok(
  (select retention_until between last_activity_at + interval '12 months' - interval '1 minute'
                               and last_activity_at + interval '12 months' + interval '1 minute'
     from public.applications where reference = 'BE-26-RET234'),
  'Offene Bewerbung: 12 Monate ab letzter Aktivität'
);

update public.applications
set stage = 'abgesagt', rejection_notified_at = '2026-10-10T09:00:00Z'
where reference = 'BE-26-RET234';

select is(
  (select retention_until from public.applications where reference = 'BE-26-RET234'),
  '2026-10-10T09:00:00Z'::timestamptz + interval '6 months',
  'Absage: 6 Monate ab Mitteilung'
);

update public.applications
set talent_pool_consent_at = '2026-10-11T09:00:00Z'
where reference = 'BE-26-RET234';

select is(
  (select retention_until from public.applications where reference = 'BE-26-RET234'),
  '2026-10-11T09:00:00Z'::timestamptz + interval '24 months',
  'Talent-Pool-Einwilligung: 24 Monate ab Einwilligung'
);

update public.applications
set talent_pool_revoked_at = '2026-10-12T09:00:00Z'
where reference = 'BE-26-RET234';

select is(
  (select retention_until from public.applications where reference = 'BE-26-RET234'),
  '2026-10-10T09:00:00Z'::timestamptz + interval '6 months',
  'Widerruf der Talent-Pool-Einwilligung: zurück auf die Regel-Frist'
);

update public.applications
set erasure_requested_at = '2026-10-13T09:00:00Z'
where reference = 'BE-26-RET234';

select is(
  (select retention_until from public.applications where reference = 'BE-26-RET234'),
  '2026-10-13T09:00:00Z'::timestamptz,
  'Löschantrag: sofort fällig'
);

select throws_ok(
  $$ update public.application_events set event_type = 'exported' $$,
  'P0001',
  'application_events is append-only',
  'Zeitleiste ist append-only'
);

select is(
  (select count(*) from public.application_events e join public.applications a on a.id = e.application_id
    where a.reference = 'BE-26-RET234' and e.event_type in ('stage_changed', 'consent_changed')),
  3::bigint,
  'Stufenwechsel und zwei Einwilligungsänderungen stehen in der Zeitleiste'
);

select * from finish();
rollback;
