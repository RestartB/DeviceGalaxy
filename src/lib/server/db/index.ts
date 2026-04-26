import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from './schema';

import { join, resolve } from 'path';
import { env } from '$env/dynamic/private';
import { exit } from 'process';

// Import DATABASE_PATH directly from the environment
if (!env.DATABASE_PATH) throw new Error('DATABASE_PATH is not set');

let dbUrl = join(env.DATABASE_PATH, 'data.db');
if (!dbUrl.startsWith('file:') && !dbUrl.startsWith('http')) {
  const absolutePath = resolve(dbUrl);
  dbUrl = `file://${absolutePath}`;
}

const client = createClient({ url: dbUrl, concurrency: 0 });

export const db = drizzle(client, { schema });
export async function initializeDatabase() {
  try {
    console.log("Running database migrations...")
    await migrate(db, { migrationsFolder: 'drizzle' });

    console.log("Enabling WAL...")
    await client.execute('PRAGMA journal_mode = WAL');
    await client.execute('PRAGMA synchronous = NORMAL');
    await client.execute('PRAGMA cache_size = 1000000');
    await client.execute('PRAGMA foreign_keys = true');
    await client.execute('PRAGMA temp_store = memory');

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    exit(1)
  }
}
