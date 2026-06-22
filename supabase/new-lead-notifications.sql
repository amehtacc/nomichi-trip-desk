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

drop trigger if exists leads_create_new_lead_notifications on public.leads;

create trigger leads_create_new_lead_notifications
after insert on public.leads
for each row execute function public.create_new_lead_notifications();

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;
