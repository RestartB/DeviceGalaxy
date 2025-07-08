import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	console.log(event.url.pathname);

	if (session === null) {
		if (!event.url.pathname.startsWith('/auth/')) {
			console.log('No session found, redirecting to login');
			return redirect(302, '/auth/login');
		}
		return { user: null, session: null };
	}

	// Only redirect to 2FA setup if not already on the 2FA setup page
	if (!session.user.twoFactorEnabled) {
		if (event.url.pathname !== '/auth/setup-2fa') {
			console.log('User does not have 2FA enabled, redirecting to setup');
			return redirect(302, '/auth/setup-2fa');
		}
		// If already on setup-2fa page and 2FA is not enabled, allow access
		return session;
	}

	return session;
};
