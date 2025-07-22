import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Import DATABASE_URL directly from the environment
import { DATABASE_URL } from '$env/static/private';
import path from 'path';
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

let dbUrl = DATABASE_URL;
if (!dbUrl.startsWith('file:') && !dbUrl.startsWith('http')) {
  const absolutePath = path.resolve(dbUrl);
  dbUrl = `file://${absolutePath}`;
}

const client = createClient({ url: dbUrl, concurrency: 0 });
await client.execute('PRAGMA journal_mode = WAL');

async function initializeDatabase() {
  try {
    await client.execute('PRAGMA journal_mode = WAL');
    await client.execute('PRAGMA synchronous = NORMAL');
    await client.execute('PRAGMA cache_size = 1000000');
    await client.execute('PRAGMA foreign_keys = true');
    await client.execute('PRAGMA temp_store = memory');

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

initializeDatabase();
export const db = drizzle(client, { schema });
