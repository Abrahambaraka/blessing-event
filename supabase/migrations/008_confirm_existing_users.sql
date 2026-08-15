-- Confirme les emails des utilisateurs déjà inscrits (connexion bloquée sans confirmation)
-- Exécuter dans Supabase Dashboard → SQL Editor → Run

-- 1. Confirmer tous les comptes Auth en attente
update auth.users
set
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  updated_at = now()
where email_confirmed_at is null;

-- 2. Synchroniser profiles manquants (utilisateurs Auth sans ligne profiles)
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

-- 3. Marquer les profils comme vérifiés
update public.profiles p
set email_verified = true, updated_at = now()
from auth.users u
where p.id = u.id and u.email_confirmed_at is not null and p.email_verified = false;

-- 4. Vérification : Auth vs profiles
select
  u.email,
  u.email_confirmed_at is not null as email_confirme,
  p.id is not null as profil_existe,
  coalesce(p.role, '—') as role
from auth.users u
left join public.profiles p on p.id = u.id
order by u.created_at;
