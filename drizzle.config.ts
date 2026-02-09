import { defineConfig } from 'drizzle-kit';
import { join } from 'path';

if (!process.env.DATABASE_PATH) throw new Error('DATABASE_PATH is not set');

export default defineConfig({
  schema: './src/lib/server/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: { url: join(process.env.DATABASE_PATH, "data.db") },
  verbose: true,
  strict: true
});
