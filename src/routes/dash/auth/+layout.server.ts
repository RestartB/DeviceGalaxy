import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (locals.user) {
    // Allow access to 2FA setup
    if (url.pathname === '/dash/auth/setup-2fa' && !locals.user.twoFactorEnabled) {
      return;
    }

    // No need to be here if you're already authed
    redirect(302, '/dash');
  } else if (url.pathname === '/dash/auth/setup-2fa') {
    return;
  }
};
