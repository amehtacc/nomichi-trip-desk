create extension if not exists "pgcrypto";

create type trip_status as enum ('OPEN', 'CLOSED');
create type lead_status as enum (
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'VIBE_CHECK',
  'SENT',
  'CONFIRMED',
  'NOT_A_FIT'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  role text default 'associate',
  created_at timestamptz not null default now()
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  price integer not null check (price > 0),
  total_seats integer not null check (total_seats > 0),
  status trip_status not null default 'OPEN',
  description text not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  trip_id uuid not null references public.trips(id),
  group_type text not null,
  preferred_month text not null,
  expectation text not null,
  status lead_status not null default 'NEW',
  owner_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  content text not null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  notification_id text not null,
  title text not null,
  body text not null,
  href text,
  dismissed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, notification_id)
);

create index leads_trip_id_idx on public.leads(trip_id);
create index leads_owner_id_idx on public.leads(owner_id);
create index leads_status_idx on public.leads(status);
create index notes_lead_id_idx on public.notes(lead_id);
create index notifications_user_id_idx on public.notifications(user_id);
create index notifications_dismissed_idx on public.notifications(dismissed);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trips_set_updated_at
before update on public.trips
for each row execute function public.set_updated_at();

create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

create trigger notifications_set_updated_at
before update on public.notifications
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.create_new_lead_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  trip_name text;
begin
  select name into trip_name
  from public.trips
  where id = new.trip_id;

  insert into public.notifications (
    user_id,
    notification_id,
    title,
    body,
    href,
    dismissed
  )
  select
    profiles.id,
    'lead-' || new.id::text,
    'New enquiry from ' || new.name,
    coalesce(trip_name, 'A traveller') || ' enquiry. Review the lead and decide who should call next.',
    '/admin/leads/' || new.id::text,
    false
  from public.profiles
  on conflict (user_id, notification_id) do nothing;

  return new;
end;
$$;

create trigger leads_create_new_lead_notifications
after insert on public.leads
for each row execute function public.create_new_lead_notifications();

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.leads enable row level security;
alter table public.notes enable row level security;
alter table public.notifications enable row level security;

create policy "Public can read open trips"
on public.trips for select
using (status = 'OPEN' or auth.role() = 'authenticated');

create policy "Associates manage trips"
on public.trips for all
to authenticated
using (true)
with check (true);

create policy "Associates read profiles"
on public.profiles for select
to authenticated
using (true);

create policy "Users update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Public can create leads"
on public.leads for insert
to anon
with check (status = 'NEW' and owner_id is null);

create policy "Associates manage leads"
on public.leads for all
to authenticated
using (true)
with check (true);

create policy "Associates manage notes"
on public.notes for all
to authenticated
using (true)
with check (author_id = auth.uid());

create policy "Users manage own notifications"
on public.notifications for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant usage on schema public to anon, authenticated;

grant select on public.trips to anon;
grant insert on public.leads to anon;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.trips to authenticated;
grant select, insert, update, delete on public.leads to authenticated;
grant select, insert, update, delete on public.notes to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;

insert into storage.buckets (id, name, public)
values ('trip-images', 'trip-images', true)
on conflict (id) do nothing;

create policy "Public can read trip images"
on storage.objects for select
using (bucket_id = 'trip-images');

create policy "Associates upload trip images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'trip-images');

create policy "Associates update trip images"
on storage.objects for update
to authenticated
using (bucket_id = 'trip-images')
with check (bucket_id = 'trip-images');
