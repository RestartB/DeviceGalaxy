import { json } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { shares } from '$lib/server/db/schema';

export async function DELETE(event) {
	// Check if the user is authenticated
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		await db.delete(shares).where(eq(shares.userId, session.user.id));

		return json({ message: 'Shares deleted successfully' }, { status: 200 });
	} catch (error) {
		console.error('Error deleting all shares:', error);
		return json({ error: 'Failed to delete shares' }, { status: 500 });
	}
}
