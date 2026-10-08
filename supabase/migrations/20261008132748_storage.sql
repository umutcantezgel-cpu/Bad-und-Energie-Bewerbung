-- =============================================================================
-- Privater Bucket für Bewerbungsunterlagen.
--
-- - Hochladen nur über signierte Upload-URLs, die der Server (Secret-Key) ausstellt
--   (Phase 2b). Darum gibt es keine INSERT/UPDATE/DELETE-Policies.
-- - Lesen: aktive Staff-Mitglieder mit MFA (aal2); das Cockpit erzeugt kurzlebige
--   signierte Download-URLs.
-- - Löschen: nur über die Storage-API (Edge Function retention-purge, Phase 2c),
--   nie per SQL auf storage.objects.
-- Spiegel in supabase/config.toml: [storage.buckets.application-files].
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'application-files',
  'application-files',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "staff_read_application_files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'application-files'
    and (select private.is_staff())
    and (select private.is_aal2())
  );
