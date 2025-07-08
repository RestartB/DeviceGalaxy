import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		// Allow access to 2FA setup
		if (event.url.pathname === '/auth/setup-2fa' && !session.user.twoFactorEnabled) {
			return;
		}

		// No need to be here if you're already authed
		redirect(302, '/');
	} else if (event.url.pathname === '/auth/setup-2fa') {
		return;
	}
};
