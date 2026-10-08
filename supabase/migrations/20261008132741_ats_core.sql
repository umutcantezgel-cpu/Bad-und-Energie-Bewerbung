-- =============================================================================
-- ATS-Kernschema: Kandidaten, Bewerbungen, Ergänzungen, Dateien, Notizen,
-- Ereignisse, Attribution, Einwilligungen sowie Outbox/Zähler/Protokolle in private.
--
-- Wertelisten spiegeln den Vertrag in Session B (Phase-1-PR):
--   lib/applications/constants.ts  (APPLICATION_JOB_IDS, CONTACT_CHANNELS)
--   lib/applications/reference.ts  (REFERENCE_PATTERN)
--   lib/attribution/channel.ts     (ACQUISITION_CHANNELS)
--   lib/jobs/schema.ts             (QuestionSetSchema)
-- Neue Werte dort ⇒ CHECK-Constraint hier per neuer Migration erweitern.
-- =============================================================================

create type public.application_stage as enum (
  'neu',
  'kontaktiert',
  'gespraech',
  'kennenlernen',
  'angebot',
  'eingestellt',
  'abgesagt',
  'zurueckgezogen'
);

-- ---------------------------------------------------------------------------
-- Kandidaten (Dedupe über E.164-Telefonnummer bzw. E-Mail)
-- ---------------------------------------------------------------------------

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  full_name text not null
    check (char_length(btrim(full_name)) between 2 and 100),
  phone_raw text not null
    check (char_length(btrim(phone_raw)) between 1 and 40),
  phone_e164 text
    check (phone_e164 ~ '^\+[1-9][0-9]{5,14}$'),
  email text
    check (email = lower(btrim(email)) and char_length(email) between 3 and 254 and position('@' in email) > 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index candidates_phone_e164_idx on public.candidates (phone_e164) where phone_e164 is not null;
create index candidates_email_idx on public.candidates (email) where email is not null;

-- ---------------------------------------------------------------------------
-- Bewerbungen
-- ---------------------------------------------------------------------------

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique
    check (reference ~ '^BE-[0-9]{2}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4,6}$'),
  idempotency_key uuid not null unique,
  candidate_id uuid not null references public.candidates (id) on delete cascade,

  job_id text not null check (job_id in (
    'anlagenmechaniker-shk',
    'kundendiensttechniker-shk',
    'obermonteur-projektleiter-shk',
    'ausbildung-anlagenmechaniker-shk',
    'quereinsteiger-montagehelfer',
    'initiativ'
  )),
  job_title text not null check (char_length(job_title) between 1 and 200),
  job_reference_code text check (char_length(job_reference_code) <= 40),
  question_set text not null check (question_set in ('fachkraft', 'ausbildung', 'quereinstieg')),

  answers jsonb not null default '{}'::jsonb
    check (jsonb_typeof(answers) = 'object' and pg_column_size(answers) <= 4096),
  mappe jsonb
    check (mappe is null or (jsonb_typeof(mappe) = 'object' and pg_column_size(mappe) <= 65536)),

  contact_channel text not null check (contact_channel in ('whatsapp', 'phone', 'email')),
  acquisition_channel text not null check (acquisition_channel in (
    'google_jobs', 'indeed', 'arbeitsagentur', 'hwk', 'meta_ads', 'tiktok_ads', 'google_ads',
    'referral', 'talentpool_alert', 'jobboard', 'organic_search', 'social', 'direct', 'other'
  )),
  privacy_notice_version text not null check (char_length(privacy_notice_version) between 1 and 20),

  suspected_spam boolean not null default false,
  spam_signals text[] not null default '{}'
    check (spam_signals <@ array['honeypot', 'fast']::text[]),
  fill_duration_ms integer check (fill_duration_ms >= 0),

  stage public.application_stage not null default 'neu',
  stage_changed_at timestamptz not null default now(),
  assigned_to uuid references public.staff (user_id) on delete set null,
  rating smallint check (rating between 1 and 5),
  rejection_notified_at timestamptz,

  talent_pool_consent_at timestamptz,
  talent_pool_revoked_at timestamptz,
  erasure_requested_at timestamptz,
  legal_hold boolean not null default false,

  submitted_at timestamptz not null,
  last_activity_at timestamptz not null default now(),
  retention_until timestamptz not null default (now() + interval '12 months'),
  purge_state text not null default 'active' check (purge_state in ('active', 'purging')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.applications.retention_until is
  'Löschzeitpunkt, berechnet von private.compute_retention() (6/12/24 Monate, ROADMAP §8).';

create index applications_stage_submitted_idx on public.applications (stage, submitted_at desc);
create index applications_candidate_idx on public.applications (candidate_id);
create index applications_assigned_idx on public.applications (assigned_to) where assigned_to is not null;
create index applications_job_submitted_idx on public.applications (job_id, submitted_at desc);
create index applications_channel_submitted_idx on public.applications (acquisition_channel, submitted_at desc);
create index applications_retention_idx on public.applications (retention_until) where purge_state = 'active';

-- Ergänzungen nach dem Absenden (Danke-Seite / Mappe), idempotent je Hash aus Session B.
create table public.application_follow_ups (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  idempotency_key text not null unique check (char_length(idempotency_key) between 16 and 128),
  start_date text check (char_length(start_date) <= 100),
  postal_code text check (char_length(postal_code) <= 10),
  message text check (char_length(message) <= 3000),
  mappe jsonb check (mappe is null or (jsonb_typeof(mappe) = 'object' and pg_column_size(mappe) <= 65536)),
  received_at timestamptz not null default now()
);

create index application_follow_ups_application_idx on public.application_follow_ups (application_id);

-- Unterlagen (Uploads ab Phase 2b; Objekte im privaten Bucket application-files).
create table public.application_files (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  category text not null check (category in ('cv', 'certificate', 'photo', 'other')),
  storage_path text not null unique
    check (storage_path ~ '^applications/[0-9a-f-]{36}/[0-9a-f-]{36}\.(pdf|jpg|png|heic|webp)$'),
  original_filename text check (char_length(original_filename) <= 150),
  mime_type text not null check (mime_type in (
    'application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'
  )),
  size_bytes integer not null check (size_bytes between 1 and 10485760),
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  uploaded_by_staff uuid references public.staff (user_id) on delete set null,
  created_at timestamptz not null default now()
);

create index application_files_application_idx on public.application_files (application_id);
create index application_files_uploaded_by_idx on public.application_files (uploaded_by_staff) where uploaded_by_staff is not null;

-- Interne Notizen des Teams.
create table public.application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  author_id uuid references public.staff (user_id) on delete set null default auth.uid(),
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index application_notes_application_idx on public.application_notes (application_id, created_at desc);
create index application_notes_author_idx on public.application_notes (author_id) where author_id is not null;

-- Zeitleiste (append-only, ohne personenbezogene Inhalte: nur IDs, Stufen, Codes).
create table public.application_events (
  id bigint generated always as identity primary key,
  application_id uuid not null references public.applications (id) on delete cascade,
  event_type text not null check (event_type in (
    'submitted', 'follow_up', 'stage_changed', 'assigned', 'rated', 'note_added',
    'file_added', 'file_viewed', 'exported', 'consent_changed', 'email_queued', 'email_skipped'
  )),
  actor_id uuid references public.staff (user_id) on delete set null,
  data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(data) = 'object' and pg_column_size(data) <= 2048),
  created_at timestamptz not null default now()
);

create index application_events_application_idx on public.application_events (application_id, created_at desc);
create index application_events_actor_idx on public.application_events (actor_id) where actor_id is not null;

-- Herkunft der Bewerbung (UTM, Empfehlungscode, Referrer-Host).
create table public.application_attribution (
  application_id uuid primary key references public.applications (id) on delete cascade,
  utm_source text check (char_length(utm_source) <= 100),
  utm_medium text check (char_length(utm_medium) <= 100),
  utm_campaign text check (char_length(utm_campaign) <= 100),
  utm_content text check (char_length(utm_content) <= 100),
  utm_term text check (char_length(utm_term) <= 100),
  ref text check (char_length(ref) <= 32),
  referrer_host text check (char_length(referrer_host) <= 253),
  landing_path text check (char_length(landing_path) <= 300),
  funnel text check (char_length(funnel) <= 60)
);

-- Einwilligungen und Hinweise (Art. 7 Abs. 1 DSGVO: Nachweis).
create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  purpose text not null check (purpose in ('privacy_notice', 'talent_pool')),
  action text not null check (action in ('acknowledged', 'granted', 'revoked')),
  text_version text not null check (char_length(text_version) between 1 and 20),
  channel text not null check (channel in ('web_form', 'email_link', 'staff_recorded')),
  recorded_by uuid references public.staff (user_id) on delete set null,
  created_at timestamptz not null default now()
);

create index consent_records_application_idx on public.consent_records (application_id, created_at desc);
create index consent_records_recorded_by_idx on public.consent_records (recorded_by) where recorded_by is not null;

-- ---------------------------------------------------------------------------
-- private: Schalter, Outbox, Rate-Limit-Zähler, Audit
-- ---------------------------------------------------------------------------

-- Betriebsschalter. Alles aus, bis es bewusst eingeschaltet wird (auch auf Preview-Branches).
create table private.app_settings (
  key text primary key check (key ~ '^[a-z_]{3,60}$'),
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into private.app_settings (key, enabled) values
  ('outbound_email_enabled', false),
  ('retention_enabled', false),
  ('retention_dry_run', true),
  ('revalidate_enabled', false),
  ('sla_digest_enabled', false),
  ('ops_alert_enabled', false);

-- E-Mail-Outbox. Ohne Empfängeradresse und ohne Inhalt: Die Edge Function (2c) liest die
-- Bewerbung zur Sendezeit. recipient_hash = sha256(lower(email)) für die Obergrenze je Empfänger.
create table private.outbox (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in (
    'application_team', 'application_confirmation', 'follow_up_team', 'staff_digest', 'ops_alert'
  )),
  application_id uuid references public.applications (id) on delete cascade,
  follow_up_id uuid references public.application_follow_ups (id) on delete cascade,
  recipient_hash text check (recipient_hash ~ '^[0-9a-f]{64}$'),
  status text not null default 'pending'
    check (status in ('pending', 'sending', 'sent', 'failed', 'dead', 'skipped')),
  skip_reason text check (skip_reason in ('suspected_spam', 'recipient_cap', 'disabled')),
  attempts integer not null default 0 check (attempts >= 0),
  next_attempt_at timestamptz not null default now(),
  locked_until timestamptz,
  last_error_code text check (char_length(last_error_code) <= 80),
  provider_message_id text check (char_length(provider_message_id) <= 200),
  delivery_status text check (delivery_status in ('delivered', 'bounced', 'complained')),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  constraint outbox_skip_reason_consistent check ((status = 'skipped') = (skip_reason is not null))
);

create index outbox_due_idx on private.outbox (next_attempt_at) where status in ('pending', 'failed');
create index outbox_application_idx on private.outbox (application_id) where application_id is not null;
create index outbox_follow_up_idx on private.outbox (follow_up_id) where follow_up_id is not null;
create index outbox_recipient_recent_idx on private.outbox (recipient_hash, created_at desc)
  where kind = 'application_confirmation' and recipient_hash is not null;

-- Rate-Limit (feste Zeitfenster). key_hash = HMAC(IP) aus Next, nie die IP selbst.
create table private.rate_limit_counters (
  key_hash text not null check (key_hash ~ '^[0-9a-f]{64}$'),
  action text not null check (action ~ '^[a-z0-9_:.-]{1,40}$'),
  window_start timestamptz not null,
  hits integer not null default 0 check (hits >= 0),
  primary key (key_hash, action, window_start)
);

create index rate_limit_counters_window_idx on private.rate_limit_counters (window_start);

-- Audit: wer hat wann was geändert (nur Feldnamen, keine Werte).
create table private.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null check (char_length(action) between 1 and 60),
  entity text not null check (char_length(entity) between 1 and 60),
  entity_id uuid,
  fields text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index audit_log_entity_idx on private.audit_log (entity, entity_id, created_at desc);
