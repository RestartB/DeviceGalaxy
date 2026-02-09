import { json } from '@sveltejs/kit';

import { existsSync } from 'fs';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path';

import { auth } from '$lib/server/auth';

import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { user } from '$lib/server/db/schema';

import { env } from '$env/dynamic/private';

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

  const imagePath = join(env.DATA_PATH, 'pfp', userData.id + '.webp');
  if (!existsSync(imagePath)) {
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

export async function DELETE(event) {
  // Check if the user is authenticated
  const session = await auth.api.getSession({
    headers: event.request.headers
  });

  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = event.params.userid;
  if (!userId) {
    return json({ message: 'User ID is required' }, { status: 400 });
  }

  if (userId !== session.user.id) {
    return json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!session.user.image) {
    return json({ error: 'No profile picture found' }, { status: 404 });
  }

  try {
    const imageName = session.user.image.split('/').pop();
    const safeImageName = imageName ? imageName.split('?')[0] : '';

    if (existsSync(join(env.DATA_PATH, 'pfp', safeImageName + '.webp'))) {
      await unlink(join(env.DATA_PATH, 'pfp', safeImageName + '.webp'));
    }

    return json({ message: 'Profile picture deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return json({ error: 'Failed to delete profile picture' }, { status: 500 });
  }
}
