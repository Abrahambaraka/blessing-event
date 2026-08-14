-- Exécuter APRÈS migration 001 et création du compte admin dans Auth
update public.profiles
set role = 'super_admin', updated_at = now()
where email = 'admin@blessing-event.com';
