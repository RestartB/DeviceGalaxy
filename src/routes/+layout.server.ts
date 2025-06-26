import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session === null) {
		if (!event.url.pathname.startsWith('/auth/')) {
			console.log('No session found, redirecting to login');
			return redirect(302, '/auth/login');
		}
		return { user: null, session: null };
	}

	if (!session.user.twoFactorEnabled && !event.url.pathname.startsWith('/auth/setup-2fa')) {
		console.log('Two-factor authentication not enabled');
		return redirect(302, '/auth/setup-2fa');
	}

	return session;
};
