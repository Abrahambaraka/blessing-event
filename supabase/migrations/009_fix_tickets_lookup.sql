-- Corrige la récupération des billets : email acheteur + titulaire, casse insensible
-- Exécuter dans Supabase Dashboard → SQL Editor → Run

-- 1. Normaliser les emails existants
update public.be_tickets
set holder_email = lower(trim(holder_email))
where holder_email <> lower(trim(holder_email));

update public.be_orders
set buyer_email = lower(trim(buyer_email))
where buyer_email <> lower(trim(buyer_email));

-- 2. RLS billets : titulaire OU acheteur de la commande (insensible à la casse)
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

-- 3. RLS commandes : comparer emails en minuscules
drop policy if exists "be_orders_own_read" on public.be_orders;
create policy "be_orders_own_read" on public.be_orders
  for select to authenticated
  using (
    lower(buyer_email) = lower(auth.jwt() ->> 'email')
    or public.be_is_admin()
  );

drop policy if exists "be_orders_own_insert" on public.be_orders;
create policy "be_orders_own_insert" on public.be_orders
  for insert to authenticated
  with check (lower(buyer_email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "be_orders_own_update" on public.be_orders;
create policy "be_orders_own_update" on public.be_orders
  for update to authenticated
  using (
    lower(buyer_email) = lower(auth.jwt() ->> 'email')
    or public.be_is_admin()
  );

-- 4. Fonction RPC — recherche par email (titulaire ou acheteur), invité ou connecté
create or replace function public.be_tickets_by_email(p_email text)
returns jsonb[]
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text := lower(trim(p_email));
begin
  if normalized = '' or normalized !~ '^[^@]+@[^@]+\.[^@]+$' then
    return array[]::jsonb[];
  end if;

  return array(
    select distinct t.data
    from public.be_tickets t
    left join public.be_orders o on o.id = t.order_id
    where lower(t.holder_email) = normalized
       or lower(o.buyer_email) = normalized
    order by t.data ->> 'issuedAt' desc nulls last
  );
end;
$$;

revoke all on function public.be_tickets_by_email(text) from public;
grant execute on function public.be_tickets_by_email(text) to anon, authenticated;

-- 5. Vérification
select
  count(*) as total_billets,
  count(*) filter (where holder_email ~ '[A-Z]') as emails_majuscules_restants
from public.be_tickets;
