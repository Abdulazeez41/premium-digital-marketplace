import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

function ensureDatabaseUrl() {
  process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5432/premium_digital_marketplace_test?schema=public';
}

function ensurePostgresDatabase(databaseUrl: string) {
  const parsedUrl = new URL(databaseUrl);
  if (!['postgres:', 'postgresql:'].includes(parsedUrl.protocol)) return;

  const databaseName = parsedUrl.pathname.replace(/^\//, '').split('?')[0];
  if (!databaseName) return;

  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = '/postgres';
  adminUrl.search = '';

  const env = {
    ...process.env,
    PGPASSWORD: decodeURIComponent(parsedUrl.password),
  };

  const exists = execFileSync(
    'psql',
    [adminUrl.toString(), '-tAc', `SELECT 1 FROM pg_database WHERE datname = '${databaseName.replace(/'/g, "''")}'`],
    { cwd: projectRoot, env, encoding: 'utf8' },
  )
    .trim()
    .startsWith('1');

  if (!exists) {
    execFileSync('psql', [adminUrl.toString(), '-c', `CREATE DATABASE "${databaseName.replace(/"/g, '""')}"`], {
      cwd: projectRoot,
      env,
      stdio: 'inherit',
    });
  }
}

export default async function globalSetup() {
  ensureDatabaseUrl();
  ensurePostgresDatabase(process.env.DATABASE_URL!);

  execFileSync('npx', ['prisma', 'db', 'push', '--skip-generate'], {
    cwd: projectRoot,
    env: process.env,
    stdio: 'inherit',
  });
}
