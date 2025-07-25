import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { eq, and, sql } from 'drizzle-orm';
import { userDevices, tags, lastActionTimes } from '$lib/server/db/schema';

export async function DELETE(event) {
  // Check if the user is authenticated
  const session = await auth.api.getSession({
    headers: event.request.headers
  });

  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get last deleted time
  const lastTagDeletedTime = await db
    .select({ lastTagDeletedTime: lastActionTimes.lastTagDeletedTime })
    .from(lastActionTimes)
    .where(eq(lastActionTimes.userId, session.user.id))
    .get();

  if (lastTagDeletedTime && lastTagDeletedTime.lastTagDeletedTime) {
    const lastDeleted = new Date(lastTagDeletedTime.lastTagDeletedTime);
    const currentTime = new Date();

    // 10 second cooldown
    if (currentTime.getTime() - lastDeleted.getTime() < 10000) {
      return json(
        { error: 'Slow down! Please wait a few seconds before deleting a tag.' },
        { status: 429 }
      );
    }

    // Update last deleted time
    await db
      .update(lastActionTimes)
      .set({ lastTagDeletedTime: currentTime })
      .where(eq(lastActionTimes.userId, session.user.id));
  } else {
    await db.insert(lastActionTimes).values({ userId: session.user.id }).onConflictDoNothing();
  }

  const tagId = event.url.searchParams.get('id');
  if (!tagId) {
    return json({ message: 'Tag ID is required' }, { status: 400 });
  }

  // Validate tagId is a number
  const tagIdInt = parseInt(tagId, 10);
  if (isNaN(tagIdInt)) {
    return json({ error: 'Invalid tag ID' }, { status: 400 });
  }

  // Check the tag exists and that it belongs to the user
  const tagExists = await db
    .select()
    .from(tags)
    .where(and(eq(tags.id, tagIdInt), eq(tags.userId, session.user.id)))
    .get();

  if (!tagExists) {
    return json({ error: 'Tag not found' }, { status: 404 });
  }

  try {
    await db.transaction(async (tx) => {
      // Get all devices with id
      const devicesWithTag = await tx
        .select()
        .from(userDevices)
        .where(
          and(
            eq(userDevices.userId, session.user.id),
            sql`EXISTS (SELECT 1 FROM json_each(${userDevices.tags}) WHERE json_each.value = ${tagIdInt})`
          )
        )
        .all();

      for (const device of devicesWithTag) {
        if (device.tags && Array.isArray(device.tags)) {
          // Remove the tag
          const updatedTags = device.tags.filter((tag) => tag !== tagIdInt);

          // Update the device with new tags
          await tx
            .update(userDevices)
            .set({ tags: updatedTags })
            .where(eq(userDevices.id, device.id));
        }
      }

      // Delete the tag
      await tx.delete(tags).where(eq(tags.id, tagIdInt));
    });

    return json({ message: 'Tag deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}
