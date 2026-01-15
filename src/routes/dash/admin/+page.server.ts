import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const session = await auth.api.getSession({
    headers: event.request.headers
  });

  if (!session || session.user.role !== 'admin') {
    throw redirect(302, '/dash');
  }
};
