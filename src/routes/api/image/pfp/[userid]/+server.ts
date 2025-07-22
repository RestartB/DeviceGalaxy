import { json } from '@sveltejs/kit';

import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { user } from '$lib/server/db/schema';

export async function GET(event) {
  const userId = event.params.userid;
  if (!userId) {
    return json({ message: 'User ID is required' }, { status: 400 });
  }

  // Get user ID from DB
  const userData = await db.select().from(user).where(eq(user.id, userId)).get();

  if (!userData) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  const imagePath = join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    '..',
    '..',
    'user_uploads',
    'pfp',
    userData.id + '.webp'
  );
  if (!existsSync(imagePath)) {
    return json({ error: 'Image not found' }, { status: 404 });
  }

  const imageBuffer = await readFile(imagePath);
  return new Response(imageBuffer, {
    headers: {
      'Content-Type': 'image/webp',
      'Content-Length': imageBuffer.length.toString(),
      'Cache-Control': 'public, max-age=31536000'
    }
  });
}
