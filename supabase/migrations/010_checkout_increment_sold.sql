-- Permet aux clients d'acheter des billets sans droits super_admin
-- Met à jour uniquement les compteurs "sold" sur un événement publié
-- Exécuter dans Supabase Dashboard → SQL Editor → Run

create or replace function public.be_increment_sold_counts(
  p_event_id text,
  p_items jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  event_data jsonb;
  ticket_types jsonb;
  new_ticket_types jsonb := '[]'::jsonb;
  tt jsonb;
  tt_updated jsonb;
  item jsonb;
  tid text;
  add_qty int;
  current_sold int;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    return;
  end if;

  select data into event_data
  from public.be_events
  where id = p_event_id and status = 'published'
  for update;

  if event_data is null then
    raise exception 'Événement introuvable ou non publié';
  end if;

  ticket_types := coalesce(event_data -> 'ticketTypes', '[]'::jsonb);

  for tt in select value from jsonb_array_elements(ticket_types) as t(value)
  loop
    tid := tt ->> 'id';
    add_qty := 0;

    for item in select value from jsonb_array_elements(p_items) as i(value)
    loop
      if (item ->> 'ticketTypeId') = tid then
        add_qty := add_qty + greatest((item ->> 'quantity')::int, 0);
      end if;
    end loop;

    if add_qty > 0 then
      current_sold := coalesce((tt ->> 'sold')::int, 0);
      tt_updated := jsonb_set(tt, '{sold}', to_jsonb(current_sold + add_qty));
    else
      tt_updated := tt;
    end if;

    new_ticket_types := new_ticket_types || jsonb_build_array(tt_updated);
  end loop;

  event_data := jsonb_set(event_data, '{ticketTypes}', new_ticket_types);
  event_data := jsonb_set(event_data, '{updatedAt}', to_jsonb(timezone('utc', now())::text));

  update public.be_events
  set data = event_data, updated_at = timezone('utc', now())
  where id = p_event_id;
end;
$$;

revoke all on function public.be_increment_sold_counts(text, jsonb) from public;
grant execute on function public.be_increment_sold_counts(text, jsonb) to authenticated;
