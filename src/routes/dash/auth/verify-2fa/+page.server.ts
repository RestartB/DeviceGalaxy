import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  // Check for Better Auth 2FA cookie
  const twoFactorCookie = event.request.headers.get('cookie')?.includes('better-auth.two_factor');

  if (!twoFactorCookie) {
    return redirect(302, '/dash');
  }
};
