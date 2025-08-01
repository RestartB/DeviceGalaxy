import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { tags, shares } from '$lib/server/db/schema';

export async function GET(event) {
  // Check if the user is authenticated
  const session = await auth.api.getSession({
    headers: event.request.headers
  });

  const shareId = event.url.searchParams.get('share');

  if (!session && !shareId) {
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
    } else if (session?.user) {
      userId = session.user.id;
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
