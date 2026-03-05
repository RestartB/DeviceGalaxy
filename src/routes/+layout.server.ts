import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (!locals.user || !locals.session) {
    if (url.pathname.startsWith('/dash') && !url.pathname.startsWith('/dash/auth/')) {
      console.debug('No session found, redirecting to login');
      return redirect(302, '/dash/auth/login');
    }
    return { user: null, session: null };
  }

  return { user: locals.user, session: locals.session };
};
