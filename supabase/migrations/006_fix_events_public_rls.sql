-- Permettre à tout le monde (visiteurs inclus) de lire les événements publiés
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
