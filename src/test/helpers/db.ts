import { db } from '@/lib/db';

export async function resetDatabase() {
  const tables = await db.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> '_prisma_migrations'
  `;

  if (!tables.length) return;

  const tableNames = tables.map(({ tablename }) => `"public"."${tablename}"`).join(', ');
  await db.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`);
}
