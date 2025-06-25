import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, RequestEvent } from './$types';

export const load: PageServerLoad = async (event: RequestEvent) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (!session) {
		return redirect(302, '/auth/login');
	} else if (!session.user.twoFactorEnabled) {
		return redirect(302, '/auth/two-factor-setup');
	}

	return session;
};
