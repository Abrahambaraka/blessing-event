-- Exécuter dans Supabase SQL Editor
-- Étape 1 : créer le profil depuis Auth (si absent)
insert into public.profiles (id, email, name, role, email_verified)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'name', 'Blessing Event'),
  'client',
  u.email_confirmed_at is not null
from auth.users u
where u.email = 'info@blessing-event.com'
  and not exists (select 1 from public.profiles p where p.id = u.id);

-- Étape 2 : promouvoir super_admin
update public.profiles
set role = 'super_admin', updated_at = now()
where email = 'info@blessing-event.com';

-- Étape 3 : vérifier (doit afficher 1 ligne super_admin)
select id, email, role from public.profiles where email = 'info@blessing-event.com';
