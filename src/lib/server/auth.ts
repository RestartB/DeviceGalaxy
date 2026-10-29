import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { twoFactor, admin } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { getRequestEvent } from '$app/server';

import { existsSync } from 'fs';
import { unlink, rm } from 'fs/promises';
import { join } from 'path';

import { db } from './db';
import { userDevices } from './db/schema';
import { eq } from 'drizzle-orm';

import { sendPasswordResetEmail } from './emails';

import { env } from '$env/dynamic/private';

export const auth = betterAuth({
  appName: 'DeviceGalaxy',
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  advanced: {
    ipAddress: {
      ipAddressHeaders: env.ADDRESS_HEADER ? [env.ADDRESS_HEADER] : []
    }
  },

  database: drizzleAdapter(db, {
    provider: 'sqlite'
  }),

  plugins: [twoFactor(), admin(), sveltekitCookies(getRequestEvent)],

  rateLimit: {
    enabled: true,
    customRules: {
      '/request-password-reset': {
        window: 60,
        max: 1
      }
    }
  },

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      void sendPasswordResetEmail(user.email, url);
    }
  },

  user: {
    additionalFields: {
      backgroundImage: {
        type: 'string',
        defaultValue: '',
        required: true,
        input: false
      },
      backgroundImageBlurPx: {
        type: 'number',
        defaultValue: 0,
        required: false,
        input: false
      },
      description: {
        type: 'string',
        defaultValue: '',
        required: false
      },
      subdomain: {
        type: 'string',
        required: false,
        input: false
      },
      subdomainShareId: {
        type: 'string',
        required: false,
        input: false
      },
      discordDomainVerifyToken: {
        type: 'string',
        required: false,
        input: false
      },
      suspended: {
        type: 'boolean',
        defaultValue: false,
        required: true,
        input: false
      },
      suspendReason: {
        type: 'string',
        required: false,
        input: false
      }
    },
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        console.log('Deleting user:', user.id);
        // Check for user PFP
        if (user.image) {
          try {
            const imageName = user.image.split('/').pop();
            const safeImageName = imageName ? imageName.split('?')[0] : '';

            if (existsSync(join(env.DATA_PATH, 'pfp', safeImageName + '.webp'))) {
              await unlink(join(env.DATA_PATH, 'pfp', safeImageName + '.webp'));
            }

            // Find all of user's devices and delete any images
            const devices = await db
              .select()
              .from(userDevices)
              .where(eq(userDevices.userId, user.id));

            for (const device of devices) {
              if (existsSync(join(env.DATA_PATH, 'device', device.id.toString()))) {
                await rm(join(env.DATA_PATH, 'device', device.id.toString()), {
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
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/sign-up/email' && ctx.path !== '/update-user') {
        return;
      }
      if (ctx.body?.image) {
        throw new APIError('BAD_REQUEST', {
          message: 'image is not allowed to be set',
          code: 'FIELD_NOT_ALLOWED'
        });
      }
    })
  }
});
