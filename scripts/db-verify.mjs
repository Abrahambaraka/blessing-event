import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.SUPABASE_DB_URL ?? 'postgresql://postgres:Baraka%4020025@db.apxxzwmowjgpdhuecdou.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

const EXPECTED_TABLES = ['profiles', 'be_events', 'be_orders', 'be_tickets', 'be_checkins', 'be_votes'];

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
  console.log('EVENTS_SEEDED:', eventCount[0].n);

  const admin = profiles.find((p) => p.role === 'super_admin');
  console.log('ADMIN_OK:', admin ? `oui (${admin.email})` : 'non — exécuter 002_promote_admin.sql');
} catch (err) {
  console.error('ERREUR:', err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await client.end();
}
