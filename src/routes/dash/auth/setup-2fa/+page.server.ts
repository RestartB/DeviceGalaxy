import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const session = await auth.api.getSession({
    headers: event.request.headers
  });

  if (session === null) {
    return redirect(302, '/dash/auth/login');
  }

  return session;
};
