-- Blessing Event — schéma billetterie Phase 3
-- Exécuter dans Supabase SQL Editor

create table if not exists public.be_events (
  id text primary key,
  slug text unique not null,
  status text not null default 'draft',
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.be_orders (
  id text primary key,
  event_id text not null references public.be_events(id) on delete cascade,
  buyer_email text not null,
  status text not null default 'pending',
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.be_tickets (
  id text primary key,
  code text unique not null,
  order_id text not null references public.be_orders(id) on delete cascade,
  event_id text not null references public.be_events(id) on delete cascade,
  holder_email text not null,
  status text not null default 'issued',
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.be_checkins (
  id text primary key,
  ticket_id text not null references public.be_tickets(id) on delete cascade,
  event_id text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists be_events_status_idx on public.be_events(status);
create index if not exists be_orders_buyer_email_idx on public.be_orders(buyer_email);
create index if not exists be_tickets_code_idx on public.be_tickets(code);
create index if not exists be_tickets_holder_email_idx on public.be_tickets(holder_email);

alter table public.be_events enable row level security;
alter table public.be_orders enable row level security;
alter table public.be_tickets enable row level security;
alter table public.be_checkins enable row level security;

-- Événements publiés visibles par tous les utilisateurs authentifiés
create policy "be_events_read_published" on public.be_events
  for select to authenticated
  using (status = 'published');

-- Super admin : accès complet (role dans JWT user_metadata)
create policy "be_events_admin_all" on public.be_events
  for all to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

-- Commandes : lecture propre email ou admin
create policy "be_orders_own_read" on public.be_orders
  for select to authenticated
  using (
    buyer_email = auth.jwt() ->> 'email'
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

create policy "be_orders_insert" on public.be_orders
  for insert to authenticated
  with check (buyer_email = auth.jwt() ->> 'email');

create policy "be_orders_admin" on public.be_orders
  for all to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

-- Billets
create policy "be_tickets_own_read" on public.be_tickets
  for select to authenticated
  using (
    holder_email = auth.jwt() ->> 'email'
    or (auth.jwt() -> 'user_metadata' ->> 'role') in ('super_admin', 'staff')
  );

create policy "be_tickets_insert" on public.be_tickets
  for insert to authenticated
  with check (true);

create policy "be_tickets_staff_update" on public.be_tickets
  for update to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') in ('super_admin', 'staff'));

-- Check-ins staff/admin
create policy "be_checkins_staff" on public.be_checkins
  for all to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') in ('super_admin', 'staff'));
