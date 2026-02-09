import { redirect, error } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

import { passwordResetLimiter } from '$lib/server/limiters/passwordReset';
import { PUBLIC_BASE_DOMAIN } from '$env/static/public';

export const handle: Handle = async ({ event, resolve }) => {
  const baseDomain = PUBLIC_BASE_DOMAIN || 'devicegalaxy.me';
  const hostname = event.url.hostname;

  if (
    hostname !== baseDomain &&
    event.url.pathname !== '/' &&
    !event.url.pathname.startsWith('/api/') &&
    event.url.pathname.split('/')[1] &&
    isNaN(Number(event.url.pathname.split('/')[1]))
  ) {
    const newUrl = new URL(event.url.toString());
    newUrl.hostname = baseDomain;
    return redirect(307, newUrl.toString());
  }

  if (event.url.pathname === '/api/auth/request-password-reset') {
    if (await passwordResetLimiter.isLimited(event)) {
      console.log('Rate limit exceeded');
      return error(429, 'Too Many Requests');
    }
  }

  const response = await resolve(event);
  return response;
};
