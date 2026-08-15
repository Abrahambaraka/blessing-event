/**
 * Bundle les routes /api pour Vercel (Node ESM exige des imports résolus).
 * Produit des fichiers .js CJS auto-contenus à partir des sources TypeScript.
 */
import * as esbuild from 'esbuild';
import { globSync } from 'glob';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const entries = globSync('api/**/*.ts', {
  cwd: root,
  ignore: ['api/_lib/**'],
  posix: true,
});

if (entries.length === 0) {
  console.warn('[build-api] Aucune route API trouvée.');
  process.exit(0);
}

for (const entry of entries) {
  const infile = path.join(root, entry);
  const outfile = path.join(root, entry.replace(/\.ts$/, '.js'));
  rmSync(outfile, { force: true });

  await esbuild.build({
    entryPoints: [infile],
    outfile,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    logLevel: 'warning',
    sourcemap: false,
  });
}

console.log(`[build-api] ${entries.length} fonction(s) API bundlée(s).`);

/** Sur Vercel : ne garder que les .js pour éviter le conflit TS + ESM non résolu */
if (process.env.VERCEL) {
  for (const entry of entries) {
    rmSync(path.join(root, entry), { force: true });
  }
  rmSync(path.join(root, 'api/_lib'), { recursive: true, force: true });
  console.log('[build-api] Sources TS retirées du déploiement Vercel.');
}
