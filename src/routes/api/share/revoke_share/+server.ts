import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { shares } from '$lib/server/db/schema';

export async function DELETE({ locals, url }) {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const shareId = url.searchParams.get('id');
  if (!shareId) {
    return json({ message: 'Share ID is required' }, { status: 400 });
  }

  // Check the share exists and that it belongs to the user
  const shareExists = await db
    .select()
    .from(shares)
    .where(
      and(eq(shares.id, shareId), eq(shares.userId, locals.user.id), eq(shares.internal, false))
    )
    .get();

  if (!shareExists) {
    return json({ error: 'Share not found' }, { status: 404 });
  }

  try {
    await db
      .delete(shares)
      .where(
        and(eq(shares.id, shareId), eq(shares.userId, locals.user.id), eq(shares.internal, false))
      );

    return json({ message: 'Share deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting share:', error);
    return json({ error: 'Failed to delete share' }, { status: 500 });
  }
}
