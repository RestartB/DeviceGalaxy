import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });

    if (session === null) {
        console.log('No session found, redirecting to login');
        return redirect(302, '/auth/login');
    }

    return session;
};
