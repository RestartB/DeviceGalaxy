import { building } from '$app/env';
import { auth } from '#lib/server/auth.js';
import { svelteKitHandler } from 'better-auth/svelte-kit';

import type { Handle } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';

const handleBetterAuth: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({ headers: event.request.headers });

  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
  } else if (!session && event.url.pathname.startsWith('/dash/')) {
    return redirect(303, '/auth/login');
  }

  return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
