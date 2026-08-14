import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.SUPABASE_DB_URL ?? 'postgresql://postgres:Baraka%4020025@db.apxxzwmowjgpdhuecdou.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

const EXPECTED_TABLES = ['profiles', 'be_events', 'be_orders', 'be_tickets', 'be_checkins', 'be_votes', 'be_payments'];

try {
  await client.connect();

  const { rows: tables } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = ANY($1)
    ORDER BY table_name
  `, [EXPECTED_TABLES]);

  console.log('TABLES:', tables.map((r) => r.table_name).join(', ') || 'AUCUNE');
  const missing = EXPECTED_TABLES.filter((t) => !tables.some((r) => r.table_name === t));
  if (missing.length) console.log('MANQUANTES:', missing.join(', '));

  const { rows: funcs } = await client.query(`
    SELECT routine_name FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name IN ('be_user_role', 'be_is_admin', 'handle_new_user')
  `);
  console.log('FONCTIONS:', funcs.map((r) => r.routine_name).join(', '));

  const { rows: profiles } = await client.query(
    'SELECT id, email, name, role, email_verified, created_at FROM public.profiles ORDER BY created_at'
  );
  console.log('PROFILES:', JSON.stringify(profiles, null, 2));

  const { rows: authUsers } = await client.query(
    'SELECT id, email, email_confirmed_at IS NOT NULL AS confirmed, created_at FROM auth.users ORDER BY created_at'
  );
  console.log('AUTH_USERS:', JSON.stringify(authUsers, null, 2));

  const { rows: eventCount } = await client.query('SELECT count(*)::int AS n FROM public.be_events');
  console.log('EVENTS_TOTAL:', eventCount[0].n);

  const DEMO_IDS = [
    'evt-miss-rdc-2026',
    'evt-gala-des-amours-2026',
    'evt-ad-plenitudinem-2026',
    'evt-concert-2026',
    'evt-mariage-demo',
    'evt-gala-2026',
    'evt-summit-2026',
  ];
  const { rows: demoLeft } = await client.query(
    'SELECT id, slug, status FROM public.be_events WHERE id = ANY($1)',
    [DEMO_IDS]
  );
  console.log('DEMO_EVENTS_RESTANTS:', demoLeft.length === 0 ? 'aucun (ok)' : JSON.stringify(demoLeft));

  const { rows: published } = await client.query(
    "SELECT id, slug, data->>'title' AS title FROM public.be_events WHERE status = 'published' ORDER BY updated_at DESC"
  );
  console.log('EVENTS_PUBLIES:', JSON.stringify(published));

  const { rows: buckets } = await client.query(
    "SELECT id, public FROM storage.buckets WHERE id = 'event-images'"
  );
  console.log('STORAGE_EVENT_IMAGES:', buckets.length ? 'ok' : 'MANQUANT — exécuter 007');

  const { rows: paymentCount } = await client.query(
    "SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'be_payments'"
  );
  console.log('BE_PAYMENTS:', paymentCount[0].n === 1 ? 'ok' : 'MANQUANTE — exécuter npm run db:migrate');

  if (paymentCount[0].n === 1) {
    const { rows: payments } = await client.query(
      'SELECT id, order_id, transaction_id, provider, status, email_sent_at, created_at FROM public.be_payments ORDER BY created_at DESC LIMIT 5'
    );
    console.log('DERNIERS_PAIEMENTS:', JSON.stringify(payments, null, 2));
  }

  const admin = profiles.find((p) => p.role === 'super_admin');
  console.log('ADMIN_OK:', admin ? `oui (${admin.email})` : 'non — exécuter 002_promote_admin.sql');
} catch (err) {
  console.error('ERREUR:', err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await client.end();
}
