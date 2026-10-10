-- =============================================================================
-- Privater Bucket für Bewerbungsunterlagen.
--
-- - Keine einzige Policy auf storage.objects für diesen Bucket: Für API-Rollen ist er
--   weder les- noch beschreibbar.
-- - Hochladen nur über signierte Upload-URLs, die der Server (Secret-Key) ausstellt (2b).
-- - Lesen nur über eine staff_*-RPC (2d): prüft is_staff und aal2, schreibt 'file_viewed'
--   in die Zeitleiste und erst dann stellt der Server eine 60-s-URL aus. Eine direkte
--   Lese-Policy würde Liste, Download und beliebig lange signierte URLs ohne Protokoll erlauben.
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
