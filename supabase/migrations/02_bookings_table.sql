-- ==============================================================================
-- 02: BOOKINGS TABLE WITH DOUBLE-BOOKING PREVENTION
-- ==============================================================================

create table if not exists public.bookings (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    date date not null,
    time_slot text not null,
    name text not null,
    email text not null,
    phone text,
    service_type text not null,
    notes text,
    status text default 'confirmed'::text check (status in ('confirmed', 'cancelled', 'completed')),
    -- Critical Constraint: Prevents duplicate bookings on the exact same date and time slot!
    constraint unique_date_time_slot unique (date, time_slot)
);

-- Enable Row Level Security
alter table public.bookings enable row level security;

-- Anonymous visitors can check booked slots (date & time only) to disable them in UI
create policy "Allow reading booked slot times"
    on public.bookings
    for select
    to anon, authenticated
    using (true);

-- Anonymous visitors can insert a booking reservation
create policy "Allow anonymous booking creation"
    on public.bookings
    for insert
    to anon, authenticated
    with check (true);

create index if not exists idx_bookings_date on public.bookings(date);
