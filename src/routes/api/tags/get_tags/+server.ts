import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { tags, shares } from '$lib/server/db/schema';

export async function GET({ locals, url }) {
  const shareId = url.searchParams.get('share');

  if (!locals.user && !shareId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check for share in database
  let share;
  if (shareId) {
    share = await db.select().from(shares).where(eq(shares.id, shareId)).get();

    if (!share) {
      return json({ error: 'Share not found' }, { status: 404 });
    }

    if (share.type !== 0) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    let userId = '';

    if (share) {
      userId = share.userId;
    } else if (locals?.user) {
      userId = locals.user.id;
    }

    const tagsResult = await db.select().from(tags).where(eq(tags.userId, userId));

    return json({
      tags: tagsResult,
      total: tagsResult.length
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
