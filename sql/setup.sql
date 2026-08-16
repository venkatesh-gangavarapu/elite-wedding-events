-- Elite Wedding Events production setup
-- Run this entire script in Supabase SQL Editor.
-- 1) Create your owner in Authentication > Users first.
-- 2) Create a Storage bucket named "event-photos" and make it PUBLIC.
-- 3) Replace YOUR_OWNER_USER_UUID at the bottom.

create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  location text,
  event_date date,
  description text,
  published boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.event_photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
alter table public.events enable row level security;
alter table public.event_photos enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "public read published events" on public.events;
create policy "public read published events" on public.events
for select using (published = true or public.is_admin());

drop policy if exists "admins insert events" on public.events;
create policy "admins insert events" on public.events
for insert to authenticated
with check (public.is_admin() and created_by = auth.uid());

drop policy if exists "admins update events" on public.events;
create policy "admins update events" on public.events
for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete events" on public.events;
create policy "admins delete events" on public.events
for delete to authenticated using (public.is_admin());

drop policy if exists "public read event photos" on public.event_photos;
create policy "public read event photos" on public.event_photos
for select using (
  exists(select 1 from public.events e
         where e.id=event_id and (e.published=true or public.is_admin()))
);

drop policy if exists "admins insert event photos" on public.event_photos;
create policy "admins insert event photos" on public.event_photos
for insert to authenticated with check (public.is_admin());

drop policy if exists "admins delete event photos" on public.event_photos;
create policy "admins delete event photos" on public.event_photos
for delete to authenticated using (public.is_admin());

-- Storage:
-- Because the bucket is PUBLIC, visitor image delivery does not require an authenticated
-- Storage policy. Upload/delete remains protected by these policies.
drop policy if exists "admins upload event photos storage" on storage.objects;
create policy "admins upload event photos storage" on storage.objects
for insert to authenticated
with check (bucket_id='event-photos' and public.is_admin());

drop policy if exists "admins delete event photos storage" on storage.objects;
create policy "admins delete event photos storage" on storage.objects
for delete to authenticated
using (bucket_id='event-photos' and public.is_admin());

-- After creating the owner user:
-- insert into public.admins(user_id) values ('YOUR_OWNER_USER_UUID');
