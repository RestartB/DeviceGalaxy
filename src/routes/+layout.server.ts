import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session === null) {
		if (!event.url.pathname.startsWith('/auth/') && !event.url.pathname.startsWith('/share/')) {
			console.debug('No session found, redirecting to login');
			return redirect(302, '/auth/login');
		}
		return { user: null, session: null };
	}

	return session;
};
