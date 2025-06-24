import { betterAuth } from 'better-auth';

import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import {
	BETTER_AUTH_URL,
	BETTER_AUTH_SECRET,
} from '$env/static/private';

import { db } from '$lib/server/db/index';

export const auth = betterAuth({
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'sqlite'
	}),

	emailAndPassword: {
		enabled: true,
	},
});