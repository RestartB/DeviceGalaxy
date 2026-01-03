import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  const session = await auth.api.getSession({
    headers: event.request.headers
  });

  if (!session || session.user.role !== 'admin') {
    throw redirect(302, '/dash');
  }
};
