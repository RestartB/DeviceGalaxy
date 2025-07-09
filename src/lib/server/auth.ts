import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor } from 'better-auth/plugins';
import { BETTER_AUTH_SECRET } from '$env/static/private';

import { svelteCookies } from './svelte-cookies';

import { existsSync } from 'fs';
import { unlink, rm } from 'fs/promises';
import { join } from 'path';

import { db } from './db';
import { userDevices } from './db/schema';
import { eq } from 'drizzle-orm';

export const auth = betterAuth({
	appName: 'DeviceGalaxy',
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'sqlite'
	}),

	plugins: [twoFactor(), svelteCookies()],

	emailAndPassword: {
		enabled: true
	},

	user: {
		changeEmail: {
			enabled: true
		},
		deleteUser: {
			enabled: true,
			beforeDelete: async (user) => {
				console.log('Deleting user:', user.id);
				// Check for user PFP
				if (user.image) {
					try {
						const url = new URL(user.image);
						if (
							existsSync(
								join(
									process.cwd(),
									'static',
									'public',
									'pfp',
									user.image.replaceAll(`${url.origin}/public/pfp/`, '') + '.webp'
								)
							)
						) {
							await unlink(
								join(
									process.cwd(),
									'static',
									'public',
									'pfp',
									user.image.replaceAll(`${url.origin}/public/pfp/`, '') + '.webp'
								)
							);
						}

						// Find all of user's devices and delete any images
						const devices = await db
							.select()
							.from(userDevices)
							.where(eq(userDevices.userId, user.id));

						for (const device of devices) {
							if (existsSync(join(process.cwd(), 'user_uploads', 'device', device.id.toString()))) {
								await rm(join(process.cwd(), 'user_uploads', 'device', device.id.toString()), {
									recursive: true,
									force: true
								});
							}
						}
					} catch (error) {
						console.error('Failed to delete user images:', error);
					}
				}
			}
		}
	}
});
