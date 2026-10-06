-- ==============================================================================
-- 03: ANONYMOUS FIRST-PARTY CONVERSION EVENTS TELEMETRY
-- ==============================================================================

create table if not exists public.conversion_events (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    event text not null, -- e.g. 'cta_click', 'form_start', 'booking_step'
    path text not null,
    locale text default 'de'::text,
    cta_position text,
    session_hash text not null -- Daily rotating salt hash (No IP, No Cookies, 100% GDPR compliant)
);

-- Enable Row Level Security
alter table public.conversion_events enable row level security;

-- Public can log telemetry events
create policy "Allow logging conversion events"
    on public.conversion_events
    for insert
    to anon, authenticated
    with check (true);

create index if not exists idx_conversion_events_created_at on public.conversion_events(created_at desc);
create index if not exists idx_conversion_events_event on public.conversion_events(event);
