-- Corrige be_tickets_by_email : ORDER BY incompatible avec SELECT DISTINCT
-- Exécuter dans Supabase Dashboard → SQL Editor → Run

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
    select x.data
    from (
      select distinct on (t.id) t.data, t.data ->> 'issuedAt' as issued_at
      from public.be_tickets t
      left join public.be_orders o on o.id = t.order_id
      where lower(t.holder_email) = normalized
         or lower(o.buyer_email) = normalized
      order by t.id, t.data ->> 'issuedAt' desc nulls last
    ) x
    order by x.issued_at desc nulls last
  );
end;
$$;

revoke all on function public.be_tickets_by_email(text) from public;
grant execute on function public.be_tickets_by_email(text) to anon, authenticated;

-- Test rapide (doit retourner un tableau, pas d'erreur)
select public.be_tickets_by_email('test@example.com');
