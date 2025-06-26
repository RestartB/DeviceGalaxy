import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { eq} from 'drizzle-orm';
import { tags } from '$lib/server/db/schema';

export async function GET(event) {
    // Check if the user is authenticated
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });

    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tagsResult = await db
            .select()
            .from(tags)
            .where(eq(tags.userId, session.user.id))

        return json({
            tagsResult,
            total: tagsResult.length,
        });
    } catch (error) {
        console.error('Error fetching tags:', error);
        return json({ error: 'Failed to fetch tags' }, { status: 500 });
    }
}