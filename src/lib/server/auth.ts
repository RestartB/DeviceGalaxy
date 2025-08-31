import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { BETTER_AUTH_SECRET } from '$env/static/private';

import { existsSync } from 'fs';
import { unlink, rm } from 'fs/promises';
import { join } from 'path';

import { db } from './db';
import { userDevices } from './db/schema';
import { eq } from 'drizzle-orm';

export const auth = betterAuth({
  appName: 'DeviceGalaxy',
  secret: BETTER_AUTH_SECRET,
  trustedOrigins: ['https://devicegalaxy.me', 'https://devices.restartb.xyz'],
  database: drizzleAdapter(db, {
    provider: 'sqlite'
  }),

  plugins: [twoFactor(), sveltekitCookies(getRequestEvent)],

  emailAndPassword: {
    enabled: true
  },

  user: {
    additionalFields: {
      backgroundImage: {
        type: 'string',
        label: 'Background Image',
        description: 'URL of the background image for the user profile',
        default: ''
      },
      backgroundImageBlurPx: {
        type: 'number',
        label: 'Background Image Blur',
        description: 'Blur level for the background image in pixels',
        default: 0
      },
      description: {
        type: 'string',
        label: 'Description',
        description: 'Description to show on share links',
        default: ''
      },
      banned: {
        type: 'boolean',
        defaultValue: false,
        input: false
      },
      banReason: {
        type: 'string',
        input: false
      }
    },
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
            if (
              existsSync(
                join(process.cwd(), 'user_uploads', 'pfp', user.image.split('/').pop() + '.webp')
              )
            ) {
              await unlink(
                join(process.cwd(), 'user_uploads', 'pfp', user.image.split('/').pop() + '.webp')
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
