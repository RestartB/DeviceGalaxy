import { redirect, error } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

import { passwordResetLimiter } from '$lib/server/limiters/passwordReset';
import { PUBLIC_BASE_DOMAIN } from '$env/static/public';

export const handle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname === '/api/auth/request-password-reset') {
    if (await passwordResetLimiter.isLimited(event)) {
      console.log('Rate limit exceeded');
      return error(429, 'Too Many Requests');
    }
  }

  const hostname = event.url.hostname;

  const baseDomain = PUBLIC_BASE_DOMAIN || 'devicegalaxy.me';
  const subdomain = hostname.replace(`.${baseDomain}`, '').replace(baseDomain, '');

  if (subdomain && subdomain !== hostname) {
    const pathParts = event.url.pathname.split('/').filter(Boolean);
    const firstPart = pathParts[0];

    if (
      event.url.pathname === '/' ||
      firstPart === 'api' ||
      (firstPart && !isNaN(Number(firstPart))) ||
      firstPart === '.well-known'
    ) {
      const response = await resolve(event);
      return response;
    } else {
      const newUrl = new URL(event.url.toString());
      newUrl.hostname = baseDomain;
      return redirect(307, newUrl.toString());
    }
  }

  const response = await resolve(event);
  return response;
};
