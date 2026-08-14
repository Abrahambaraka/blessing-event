-- Corrige les profils manquants si l'utilisateur Auth a été créé AVANT la migration 001
-- Exécuter dans Supabase SQL Editor si la table profiles est vide

insert into public.profiles (id, email, name, role, email_verified)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'name', split_part(coalesce(u.email, 'user'), '@', 1)),
  coalesce(u.raw_user_meta_data ->> 'role', 'client'),
  u.email_confirmed_at is not null
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- Promouvoir le compte admin Blessing Event
update public.profiles
set role = 'super_admin', updated_at = now()
where email = 'info@blessing-event.com';

-- Vérification
select id, email, role, created_at from public.profiles order by created_at;
