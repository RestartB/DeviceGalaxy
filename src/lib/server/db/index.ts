import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { exit } from 'process';

import { env } from '$env/dynamic/private';
import * as schema from './schema';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = new Database(env.DATABASE_URL);

export const db = drizzle(client, { schema });

export async function initializeDatabase() {
  try {
    console.log('Running database migrations...');
    await migrate(db, { migrationsFolder: 'drizzle' });

    console.log('Enabling WAL...');
    client.pragma('journal_mode = WAL');
    client.pragma('synchronous = NORMAL');
    client.pragma('cache_size = 1000000');
    client.pragma('foreign_keys = ON');
    client.pragma('temp_store = MEMORY');

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    exit(1);
  }
}
