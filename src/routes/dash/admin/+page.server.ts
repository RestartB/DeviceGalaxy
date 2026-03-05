import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || locals.user.role !== 'admin') {
    throw redirect(302, '/dash');
  }
};
