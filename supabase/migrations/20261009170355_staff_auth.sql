-- =============================================================================
-- Cockpit-Zugang: Staff, Allowlist, Auth-Hook und RLS-Hilfsfunktionen.
--
-- - Registrierung ist aus (config.toml lokal; remote im Dashboard, siehe Plan §8).
--   Über Signup, Einladung, Magic Link, OAuth/SSO entstehen Auth-Nutzer nur für Adressen auf
--   private.staff_email_allowlist (Hook before_user_created). auth.admin.createUser (Secret-Key)
--   umgeht den Hook; solche Nutzer werden aber nie Staff (siehe unten).
-- - Onboarding nur per Einladung (auth.admin.inviteUserByEmail bzw. generateLink 'invite'):
--   Nur diese Wege legen den Nutzer ohne Passwort an, und nur dann entsteht automatisch eine
--   Staff-Zeile aus der Allowlist. Signup, admin.createUser und generateLink 'magiclink'/'signup'
--   setzen immer ein (ggf. generiertes) Passwort und ergeben nie Staff – Schutz vor einer
--   Vorab-Registrierung fremder Adressen. Solche Konten löschen und neu einladen.
-- - Rollen: viewer < recruiter < admin (Reihenfolge des Enums = Rangfolge).
-- - Der letzte aktive Admin kann weder herabgestuft, deaktiviert noch gelöscht werden.
-- =============================================================================

create type public.staff_role as enum ('viewer', 'recruiter', 'admin');

create table public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null
    check (char_length(btrim(display_name)) between 1 and 80),
  role public.staff_role not null default 'viewer',
  is_active boolean not null default true,
  deactivated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_deactivated_consistent
    check ((is_active and deactivated_at is null) or (not is_active and deactivated_at is not null))
);

comment on table public.staff is 'Cockpit-Nutzer. Deaktivieren statt löschen, damit die Historie erhalten bleibt.';

create table private.staff_email_allowlist (
  email text primary key
    check (email = lower(btrim(email)) and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' and char_length(email) <= 254),
  role public.staff_role not null default 'viewer',
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index staff_email_allowlist_invited_by_idx on private.staff_email_allowlist (invited_by)
  where invited_by is not null;

comment on table private.staff_email_allowlist is
  'Nur diese Adressen dürfen einen Auth-Nutzer bekommen (Hook before_user_created).';

alter table private.staff_email_allowlist enable row level security;

-- ---------------------------------------------------------------------------
-- RLS-Hilfsfunktionen (in RLS-Policies immer als (select private.fn()) aufrufen)
-- ---------------------------------------------------------------------------

create function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff s
    where s.user_id = (select auth.uid())
      and s.is_active
  );
$$;

create function private.staff_role_at_least(min_role public.staff_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select s.role >= min_role
      from public.staff s
      where s.user_id = (select auth.uid())
        and s.is_active
    ),
    false
  );
$$;

create function private.is_aal2()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select auth.jwt() ->> 'aal') = 'aal2', false);
$$;

revoke all on function private.is_staff() from public, anon, authenticated, service_role;
revoke all on function private.staff_role_at_least(public.staff_role) from public, anon, authenticated, service_role;
revoke all on function private.is_aal2() from public, anon, authenticated, service_role;
grant execute on function private.is_staff() to authenticated;
grant execute on function private.staff_role_at_least(public.staff_role) to authenticated;
grant execute on function private.is_aal2() to authenticated;

-- ---------------------------------------------------------------------------
-- Auth-Hook: before_user_created (config.toml [auth.hook.before_user_created])
-- ---------------------------------------------------------------------------

create function private.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  v_email text := lower(btrim(coalesce(event -> 'user' ->> 'email', '')));
begin
  if v_email <> '' and exists (
    select 1 from private.staff_email_allowlist a where a.email = v_email
  ) then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'Für diese Adresse ist kein Zugang vorgesehen.'
    )
  );
end;
$$;

revoke all on function private.hook_before_user_created(jsonb) from public, anon, authenticated, service_role;
grant execute on function private.hook_before_user_created(jsonb) to supabase_auth_admin;
grant select on table private.staff_email_allowlist to supabase_auth_admin;

create policy "auth_admin_reads_allowlist"
  on private.staff_email_allowlist
  for select
  to supabase_auth_admin
  using (true);

-- ---------------------------------------------------------------------------
-- Staff-Zeile für neue Auth-Nutzer aus der Allowlist anlegen
-- ---------------------------------------------------------------------------
--
-- Nur Konten ohne Passwort, also aus einer Einladung. Eine öffentliche Registrierung legt das
-- Konto immer mit Passwort an; bestätigt die echte Person später per Einladung oder OTP,
-- bliebe das fremde Passwort gültig. Solche Konten bekommen deshalb keine Staff-Zeile und
-- müssen gelöscht und neu eingeladen werden.

create function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.staff_role;
begin
  if coalesce(new.encrypted_password, '') <> '' then
    return new;
  end if;

  select a.role into v_role
  from private.staff_email_allowlist a
  where a.email = lower(btrim(coalesce(new.email, '')));

  if v_role is not null then
    insert into public.staff (user_id, display_name, role)
    values (new.id, left(split_part(new.email, '@', 1), 80), v_role)
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated, service_role;

create trigger on_auth_user_created_staff
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- Letzten aktiven Admin schützen
-- ---------------------------------------------------------------------------

create function private.protect_last_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_other_admins integer;
begin
  -- Betroffen sind nur Änderungen an einem aktiven Admin, die ihn als Admin entfernen.
  if old.role <> 'admin' or not old.is_active then
    return case when tg_op = 'DELETE' then old else new end;
  end if;

  if tg_op = 'UPDATE' and new.role = 'admin' and new.is_active then
    return new;
  end if;

  -- Serialisiert gleichzeitige Herabstufungen zweier Admins (sonst sehen beide den anderen).
  perform pg_advisory_xact_lock(hashtextextended('public.staff:admin_set', 0));

  select count(*) into v_other_admins
  from public.staff s
  where s.role = 'admin'
    and s.is_active
    and s.user_id <> old.user_id;

  if v_other_admins = 0 then
    raise exception 'last_admin_protected'
      using errcode = 'P0001',
            hint = 'Mindestens ein aktiver Admin muss bestehen bleiben.';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke all on function private.protect_last_admin() from public, anon, authenticated, service_role;

create trigger staff_protect_last_admin
  before update or delete on public.staff
  for each row execute function private.protect_last_admin();
