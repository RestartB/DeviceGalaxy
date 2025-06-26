import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { svelteCookies } from './svelte-cookies';
import { twoFactor } from 'better-auth/plugins';

import { BETTER_AUTH_URL, BETTER_AUTH_SECRET } from '$env/static/private';
import { db } from './db';

export const auth = betterAuth({
	appName: 'myDevices',
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'sqlite'
	}),

	plugins: [svelteCookies(), twoFactor()],

	emailAndPassword: {
		enabled: true
	}
});
