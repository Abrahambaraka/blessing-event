-- Profils Google OAuth : utiliser full_name depuis user_metadata
-- Exécuter dans Supabase Dashboard → SQL Editor → Run

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
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, 'user'), '@', 1)
    ),
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

-- Synchroniser les noms Google existants
update public.profiles p
set
  name = coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', p.name),
  email_verified = u.email_confirmed_at is not null,
  updated_at = now()
from auth.users u
where p.id = u.id
  and coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name') is not null;
