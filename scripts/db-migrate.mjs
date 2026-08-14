/**
 * Exécute supabase/migrations/001_ticketing.sql via SUPABASE_DB_URL
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

const sqlPath = path.join(__dirname, '../supabase/migrations/001_ticketing.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log('✓ Migration 001_ticketing.sql appliquée avec succès.');
} catch (err) {
  console.error('✗ Erreur migration :', err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await client.end();
}
