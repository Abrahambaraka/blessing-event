-- =============================================================================
-- Blessing Event — Schéma complet Supabase
-- Projet : apxxzwmowjgpdhuecdou
-- Exécuter dans : Supabase Dashboard → SQL Editor → Run
-- =============================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. PROFILS & RBAC (lié à auth.users)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  role text not null default 'client'
    check (role in ('client', 'staff', 'super_admin')),
  phone text,
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists profiles_role_idx on public.profiles(role);

-- Rôle effectif : table profiles > JWT metadata > client
create or replace function public.be_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    auth.jwt() -> 'user_metadata' ->> 'role',
    auth.jwt() -> 'app_metadata' ->> 'role',
    'client'
  );
$$;

create or replace function public.be_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.be_user_role() = 'super_admin';
$$;

create or replace function public.be_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.be_user_role() in ('super_admin', 'staff');
$$;

-- Auto-création profil à l'inscription Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role, phone, email_verified)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, 'user'), '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'client'),
    new.raw_user_meta_data ->> 'phone',
    new.email_confirmed_at is not null
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    phone = excluded.phone,
    email_verified = excluded.email_verified,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. BILLETTERIE — événements, commandes, billets, check-ins
-- -----------------------------------------------------------------------------
create table if not exists public.be_events (
  id text primary key,
  slug text unique not null,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'closed')),
  organizer_id uuid references public.profiles(id) on delete set null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.be_orders (
  id text primary key,
  event_id text not null references public.be_events(id) on delete cascade,
  buyer_id uuid references public.profiles(id) on delete set null,
  buyer_email text not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'expired', 'cancelled', 'refunded')),
  total_amount numeric(12, 2),
  currency text default 'USD',
  data jsonb not null,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.be_tickets (
  id text primary key,
  code text unique not null,
  order_id text not null references public.be_orders(id) on delete cascade,
  event_id text not null references public.be_events(id) on delete cascade,
  holder_email text not null,
  status text not null default 'issued'
    check (status in ('issued', 'checked_in', 'cancelled', 'refunded')),
  data jsonb not null,
  created_at timestamptz not null default now(),
  checked_in_at timestamptz
);

create table if not exists public.be_checkins (
  id text primary key,
  ticket_id text not null references public.be_tickets(id) on delete cascade,
  event_id text not null,
  scanned_by uuid references public.profiles(id) on delete set null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- Votes payants (Miss RDC, galas…)
create table if not exists public.be_votes (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.be_events(id) on delete cascade,
  participant_id text not null,
  voter_id uuid references public.profiles(id) on delete set null,
  voter_email text not null,
  vote_count integer not null default 1 check (vote_count > 0),
  amount_paid numeric(12, 2) not null default 0,
  currency text default 'USD',
  created_at timestamptz not null default now()
);

-- Index performance
create index if not exists be_events_status_idx on public.be_events(status);
create index if not exists be_events_slug_idx on public.be_events(slug);
create index if not exists be_orders_buyer_email_idx on public.be_orders(buyer_email);
create index if not exists be_orders_event_id_idx on public.be_orders(event_id);
create index if not exists be_orders_status_idx on public.be_orders(status);
create index if not exists be_tickets_code_idx on public.be_tickets(code);
create index if not exists be_tickets_holder_email_idx on public.be_tickets(holder_email);
create index if not exists be_tickets_event_id_idx on public.be_tickets(event_id);
create index if not exists be_votes_event_id_idx on public.be_votes(event_id);

-- Trigger updated_at sur profiles et events
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists be_events_updated_at on public.be_events;
create trigger be_events_updated_at
  before update on public.be_events
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.be_events enable row level security;
alter table public.be_orders enable row level security;
alter table public.be_tickets enable row level security;
alter table public.be_checkins enable row level security;
alter table public.be_votes enable row level security;

-- Profiles
drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.be_is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.be_is_admin())
  with check (id = auth.uid() or public.be_is_admin());

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all to authenticated
  using (public.be_is_admin())
  with check (public.be_is_admin());

-- Events : publiés = lecture client | admin = tout
drop policy if exists "be_events_read_published" on public.be_events;
create policy "be_events_read_published" on public.be_events
  for select to authenticated
  using (status = 'published' or public.be_is_admin() or public.be_is_staff());

drop policy if exists "be_events_admin_write" on public.be_events;
create policy "be_events_admin_write" on public.be_events
  for all to authenticated
  using (public.be_is_admin())
  with check (public.be_is_admin());

-- Orders
drop policy if exists "be_orders_own_read" on public.be_orders;
create policy "be_orders_own_read" on public.be_orders
  for select to authenticated
  using (buyer_email = auth.jwt() ->> 'email' or public.be_is_admin());

drop policy if exists "be_orders_own_insert" on public.be_orders;
create policy "be_orders_own_insert" on public.be_orders
  for insert to authenticated
  with check (buyer_email = auth.jwt() ->> 'email');

drop policy if exists "be_orders_own_update" on public.be_orders;
create policy "be_orders_own_update" on public.be_orders
  for update to authenticated
  using (buyer_email = auth.jwt() ->> 'email' or public.be_is_admin());

drop policy if exists "be_orders_admin" on public.be_orders;
create policy "be_orders_admin" on public.be_orders
  for all to authenticated
  using (public.be_is_admin());

-- Tickets
drop policy if exists "be_tickets_own_read" on public.be_tickets;
create policy "be_tickets_own_read" on public.be_tickets
  for select to authenticated
  using (holder_email = auth.jwt() ->> 'email' or public.be_is_staff());

drop policy if exists "be_tickets_insert" on public.be_tickets;
create policy "be_tickets_insert" on public.be_tickets
  for insert to authenticated
  with check (true);

drop policy if exists "be_tickets_staff_update" on public.be_tickets;
create policy "be_tickets_staff_update" on public.be_tickets
  for update to authenticated
  using (public.be_is_staff());

-- Check-ins
drop policy if exists "be_checkins_staff" on public.be_checkins;
create policy "be_checkins_staff" on public.be_checkins
  for all to authenticated
  using (public.be_is_staff());

-- Votes
drop policy if exists "be_votes_own_read" on public.be_votes;
create policy "be_votes_own_read" on public.be_votes
  for select to authenticated
  using (voter_email = auth.jwt() ->> 'email' or public.be_is_admin());

drop policy if exists "be_votes_insert" on public.be_votes;
create policy "be_votes_insert" on public.be_votes
  for insert to authenticated
  with check (voter_email = auth.jwt() ->> 'email');

-- -----------------------------------------------------------------------------
-- 4. PROMOUVOIR LE SUPER ADMIN (après création du compte Auth)
-- Remplacer l'email ci-dessous puis exécuter une 2e fois si besoin :
-- update public.profiles set role = 'super_admin' where email = 'admin@blessing-event.com';
-- -----------------------------------------------------------------------------

comment on table public.profiles is 'Profils utilisateurs Blessing Event — RBAC client/staff/super_admin';
comment on table public.be_events is 'Événements billetterie (payload JSON = modèle Event frontend)';
comment on table public.be_orders is 'Commandes billets';
comment on table public.be_tickets is 'E-billets avec QR code';
comment on table public.be_votes is 'Votes payants par événement';
