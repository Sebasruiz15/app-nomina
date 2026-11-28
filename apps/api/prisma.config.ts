// archivo: apps/api/prisma.config.ts
import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ path: '../../.env' });

const migrationUrl = process.env['MIGRATION_DATABASE_URL'];
if (!migrationUrl) {
  throw new Error('Falta MIGRATION_DATABASE_URL en el .env de la raíz');
}

// Solo se usa en desarrollo (migrate dev). En producción (migrate deploy) no hace falta.
const shadowUrl = process.env['SHADOW_DATABASE_URL'];

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    url: migrationUrl,
    ...(shadowUrl ? { shadowDatabaseUrl: shadowUrl } : {}),
  },
});