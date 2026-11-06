import { redirect, error } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

import { auth } from '$lib/server/auth';
import { initializeDatabase } from '$lib/server/db';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';

import { passwordResetLimiter } from '$lib/server/limiters/passwordReset';
import { env } from '$env/dynamic/public';

initializeDatabase();

export const handle: Handle = async ({ event, resolve }) => {
  const baseDomain = env.PUBLIC_BASE_DOMAIN || 'devicegalaxy.me';
  const hostname = event.url.hostname;

  if (
    hostname !== baseDomain &&
    event.route.id !== '/' &&
    !event.route.id.startsWith('/api/') &&
    !event.route.id.startsWith('/.well-known/') &&
    event.route.id.split('/')[1] &&
    isNaN(Number(event.url.pathname.split('/')[1]))
  ) {
    const newUrl = new URL(event.url.toString());
    newUrl.hostname = baseDomain;
    return redirect(307, newUrl.toString());
  }

  if (event.route.id === '/api/auth/request-password-reset') {
    if (await passwordResetLimiter.isLimited(event)) {
      console.log('Rate limit exceeded');
      return error(429, 'Too Many Requests');
    }
  }

  const session = await auth.api.getSession({
    headers: event.request.headers
  });

  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
  }

  return svelteKitHandler({ event, resolve, auth, building });
};
