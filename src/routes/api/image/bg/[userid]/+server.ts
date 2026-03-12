import { json } from '@sveltejs/kit';

import { existsSync } from 'fs';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path';

import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { user } from '$lib/server/db/schema';

import { env } from '$env/dynamic/private';

export async function GET({ params }) {
  const userId = params.userid;
  if (!userId) {
    return json({ message: 'User ID is required' }, { status: 400 });
  }

  // Get user ID from DB
  const userData = await db.select().from(user).where(eq(user.id, userId)).get();

  if (!userData) {
    return json({ error: 'Image not found' }, { status: 404 });
  }

  const imagePath = join(env.DATA_PATH, 'bg', userData.id + '.webp');
  if (!userData.backgroundImage || !existsSync(imagePath)) {
    return json({ error: 'Image not found' }, { status: 404 });
  }

  const imageBuffer = await readFile(imagePath);
  const imageUint8Array = new Uint8Array(imageBuffer);

  return new Response(imageUint8Array, {
    headers: {
      'Content-Type': 'image/webp',
      'Content-Length': imageUint8Array.length.toString(),
      'Cache-Control': 'public, max-age=31536000'
    }
  });
}

export async function DELETE({ locals, params }) {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = params.userid;
  if (!userId) {
    return json({ message: 'User ID is required' }, { status: 400 });
  }

  if (userId !== locals.user.id) {
    return json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!locals.user.backgroundImage) {
    return json({ error: 'No background found' }, { status: 404 });
  }

  await db.update(user).set({ backgroundImage: '' }).where(eq(user.id, userId));

  try {
    if (existsSync(join(env.DATA_PATH, 'bg', locals.user.id + '.webp'))) {
      await unlink(join(env.DATA_PATH, 'bg', locals.user.id + '.webp'));
    } else {
      return json({ error: 'No background found' }, { status: 404 });
    }

    return json({ message: 'Background deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting background:', error);
    return json({ error: 'Failed to delete background' }, { status: 500 });
  }
}
