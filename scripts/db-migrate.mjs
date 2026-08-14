/**
 * Exécute supabase/migrations/*.sql dans l'ordre via SUPABASE_DB_URL
 * Usage : npm run db:migrate
 */
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const envPath = path.join(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] = val;
  }
}

loadEnvLocal();

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error('SUPABASE_DB_URL manquant dans .env.local');
  process.exit(1);
}

const migrationsDir = path.join(__dirname, '../supabase/migrations');
const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort();

if (files.length === 0) {
  console.error('Aucune migration trouvée.');
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await client.query(sql);
    console.log(`✓ ${file}`);
  }
  console.log('✓ Toutes les migrations appliquées.');
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error('✗ Erreur migration :', message);

  if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT/i.test(message)) {
    console.error(`
→ Connexion PostgreSQL directe impossible (souvent IPv6 / réseau local).

Solutions :
  1. Supabase Dashboard → Project Settings → Database
     → Connection string → onglet "Session pooler" (port 5432)
     → Copiez l'URI et mettez-la dans .env.local comme SUPABASE_DB_URL

     Format attendu :
     postgresql://postgres.apxxzwmowjgpdhuecdou:[MOT_DE_PASSE]@aws-0-[REGION].pooler.supabase.com:5432/postgres

  2. Ou exécutez les fichiers SQL manuellement :
     Supabase → SQL Editor → coller supabase/migrations/004_be_payments.sql
     puis 005_remove_demo_events.sql → Run
`);
  }

  process.exit(1);
} finally {
  await client.end();
}
