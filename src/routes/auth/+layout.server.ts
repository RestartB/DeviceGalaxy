import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });

    if (session) {
        redirect(302, '/');
    }
};
