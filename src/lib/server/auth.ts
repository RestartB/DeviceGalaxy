import { env } from '$env/dynamic/private';

import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { captcha } from 'better-auth/plugins';

import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';

export const auth = betterAuth({
  baseURL: env.ORIGIN,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  plugins: [
    captcha({
      provider: 'cloudflare-turnstile',
      secretKey: process.env.TURNSTILE_SECRET_KEY!
    }),
    sveltekitCookies(getRequestEvent)
  ]
});
