-- Supprime les événements de démonstration intégrés au projet
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
