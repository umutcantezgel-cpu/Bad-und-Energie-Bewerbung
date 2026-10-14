-- =============================================================================
-- Neue Stellen (Inhaber, 2026-10-14): Ausbildung 2027, Bürofachkraft und Schülerpraktikum,
-- dazu das Fragenset 'buero' der Bürofachkraft. Erweitert die CHECK-Listen von public.applications.
--
-- Wertelisten spiegeln den Vertrag wie in 20261009170454_ats_core.sql:
--   lib/applications/constants.ts  (APPLICATION_JOB_IDS = lib/jobs/ids.ts JOB_IDS + 'initiativ')
--   lib/jobs/schema.ts             (QuestionSetSchema)
-- Geprüft ohne Datenbank in lib/supabase/__tests__/db-contract.test.ts (die jüngste Liste je Spalte zählt).
--
-- Nur ergänzend: Jede bisher gültige Zeile bleibt gültig, kein Wert fällt weg.
-- Absprache mit der Phase-2-Session (E-012): docs/operations/fakten-abgleich.md S7. Eingespielt wird von
-- Hand (db.yml testet nur lokal). Bis dahin lehnt rpc_submit_application Bewerbungen auf die neuen Stellen
-- ab, und sie gehen vollständig als Not-E-Mail ans Team (lib/supabase/sink.ts).
-- =============================================================================

alter table public.applications drop constraint applications_job_id_check;
alter table public.applications add constraint applications_job_id_check check (job_id in (
    'anlagenmechaniker-shk',
    'kundendiensttechniker-shk',
    'obermonteur-projektleiter-shk',
    'ausbildung-anlagenmechaniker-shk',
    'ausbildung-anlagenmechaniker-shk-2027',
    'quereinsteiger-montagehelfer',
    'buerofachkraft',
    'schuelerpraktikum-shk',
    'initiativ'
  ));

alter table public.applications drop constraint applications_question_set_check;
alter table public.applications add constraint applications_question_set_check
  check (question_set in ('fachkraft', 'ausbildung', 'quereinstieg', 'buero'));
