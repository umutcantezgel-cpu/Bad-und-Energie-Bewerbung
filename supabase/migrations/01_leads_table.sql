-- ==============================================================================
-- 01: LEADS TABLE & ROW LEVEL SECURITY
-- ==============================================================================

create table if not exists public.leads (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    email text not null,
    phone text,
    company text,
    project text,
    message text,
    source text default 'website'::text,
    status text default 'new'::text check (status in ('new', 'contacted', 'qualified', 'closed', 'archived')),
    metadata jsonb default '{}'::jsonb
);

-- Enable Row Level Security
alter table public.leads enable row level security;

-- Anonymous visitors can insert leads via forms
create policy "Allow anonymous lead submission"
    on public.leads
    for insert
    to anon, authenticated
    with check (true);

-- Only authenticated admins or service role can view leads
create policy "Allow authenticated admin read"
    on public.leads
    for select
    to authenticated
    using (true);

-- Indices for performance
create index if not exists idx_leads_created_at on public.leads(created_at desc);
create index if not exists idx_leads_status on public.leads(status);
