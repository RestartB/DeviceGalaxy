import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });

    if (!session && !event.url.pathname.startsWith('/auth')) {
        return redirect(302, '/auth/login');
    } else if (!session?.user.twoFactorEnabled) {
        return redirect(302, '/auth/setup-2fa');
    }

    return session;
};
