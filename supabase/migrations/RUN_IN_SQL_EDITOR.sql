-- =============================================================================
-- À exécuter dans Supabase Dashboard → SQL Editor → Run
-- Si npm run db:migrate échoue (ENOTFOUND db.xxx.supabase.co)
-- =============================================================================

-- 004 — table paiements (ignore si déjà créée)
create table if not exists public.be_payments (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.be_orders(id) on delete cascade,
  transaction_id text unique not null,
  provider text not null check (provider in ('cinetpay', 'mock', 'free')),
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed')),
  amount numeric(12, 2),
  currency text,
  webhook_payload jsonb,
  email_sent_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists be_payments_order_id_idx on public.be_payments(order_id);
create index if not exists be_payments_status_idx on public.be_payments(status);
create index if not exists be_payments_order_status_idx on public.be_payments(order_id, status);

alter table public.be_payments enable row level security;

drop policy if exists "be_payments_admin" on public.be_payments;
create policy "be_payments_admin" on public.be_payments
  for all to authenticated
  using (public.be_is_admin())
  with check (public.be_is_admin());

-- 005 — supprimer événements mock
delete from public.be_events
where id in (
  'evt-miss-rdc-2026',
  'evt-gala-des-amours-2026',
  'evt-ad-plenitudinem-2026',
  'evt-concert-2026',
  'evt-mariage-demo',
  'evt-gala-2026',
  'evt-summit-2026'
);

-- 006 — lecture publique des événements publiés
drop policy if exists "be_events_read_published" on public.be_events;
drop policy if exists "be_events_anon_read_published" on public.be_events;

create policy "be_events_read_published" on public.be_events
  for select
  using (
    status = 'published'
    or (
      auth.role() = 'authenticated'
      and (public.be_is_admin() or public.be_is_staff())
    )
  );

-- Vérification
select count(*) as events_restants from public.be_events;
select count(*) as table_payments from information_schema.tables
where table_schema = 'public' and table_name = 'be_payments';

-- 007 — bucket images événements
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-images',
  'event-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "event_images_public_read" on storage.objects;
create policy "event_images_public_read" on storage.objects
  for select using (bucket_id = 'event-images');

drop policy if exists "event_images_admin_insert" on storage.objects;
create policy "event_images_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'event-images' and public.be_is_admin());

drop policy if exists "event_images_admin_update" on storage.objects;
create policy "event_images_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'event-images' and public.be_is_admin())
  with check (bucket_id = 'event-images' and public.be_is_admin());

drop policy if exists "event_images_admin_delete" on storage.objects;
create policy "event_images_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'event-images' and public.be_is_admin());

-- 008 — confirmer les emails existants + synchroniser profiles
-- (nécessaire si "Confirm email" est activé dans Authentication → Providers → Email)
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now()), updated_at = now()
where email_confirmed_at is null;

insert into public.profiles (id, email, name, role, phone, email_verified)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'name', split_part(coalesce(u.email, 'user'), '@', 1)),
  coalesce(u.raw_user_meta_data ->> 'role', 'client'),
  u.raw_user_meta_data ->> 'phone',
  u.email_confirmed_at is not null
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

update public.profiles p
set email_verified = true, updated_at = now()
from auth.users u
where p.id = u.id and u.email_confirmed_at is not null and p.email_verified = false;

select u.email, u.email_confirmed_at is not null as confirme, p.role
from auth.users u
left join public.profiles p on p.id = u.id
order by u.created_at;

-- 009 — billets : recherche par email acheteur ou titulaire
update public.be_tickets set holder_email = lower(trim(holder_email))
where holder_email <> lower(trim(holder_email));
update public.be_orders set buyer_email = lower(trim(buyer_email))
where buyer_email <> lower(trim(buyer_email));

drop policy if exists "be_tickets_own_read" on public.be_tickets;
create policy "be_tickets_own_read" on public.be_tickets
  for select to authenticated
  using (
    lower(holder_email) = lower(auth.jwt() ->> 'email')
    or exists (
      select 1 from public.be_orders o
      where o.id = be_tickets.order_id
        and lower(o.buyer_email) = lower(auth.jwt() ->> 'email')
    )
    or public.be_is_staff()
  );

drop policy if exists "be_orders_own_read" on public.be_orders;
create policy "be_orders_own_read" on public.be_orders
  for select to authenticated
  using (lower(buyer_email) = lower(auth.jwt() ->> 'email') or public.be_is_admin());

drop policy if exists "be_orders_own_insert" on public.be_orders;
create policy "be_orders_own_insert" on public.be_orders
  for insert to authenticated
  with check (lower(buyer_email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "be_orders_own_update" on public.be_orders;
create policy "be_orders_own_update" on public.be_orders
  for update to authenticated
  using (lower(buyer_email) = lower(auth.jwt() ->> 'email') or public.be_is_admin());

create or replace function public.be_tickets_by_email(p_email text)
returns jsonb[]
language plpgsql security definer set search_path = public
as $$
declare normalized text := lower(trim(p_email));
begin
  if normalized = '' or normalized !~ '^[^@]+@[^@]+\.[^@]+$' then return array[]::jsonb[]; end if;
  return array(
    select distinct t.data from public.be_tickets t
    left join public.be_orders o on o.id = t.order_id
    where lower(t.holder_email) = normalized or lower(o.buyer_email) = normalized
    order by t.data ->> 'issuedAt' desc nulls last
  );
end;
$$;
revoke all on function public.be_tickets_by_email(text) from public;
grant execute on function public.be_tickets_by_email(text) to anon, authenticated;

select count(*) as total_billets from public.be_tickets;
