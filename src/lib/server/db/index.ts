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

const client = createClient({ url: dbUrl });

export const db = drizzle(client, { schema });