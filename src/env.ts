import { defineEnvVars } from '@sveltejs/kit/env';
import z from 'zod';

export const variables = defineEnvVars({
  ORIGIN: {},

  TURNSTILE_ENABLED: { public: true, schema: z.stringbool() },
  TURNSTILE_SITE_KEY: { public: true, schema: (input: string | undefined) => input ?? '' },
  TURNSTILE_SECRET_KEY: { schema: (input: string | undefined) => input ?? '' },

  BETTER_AUTH_SECRET: {
    schema: (value: string | undefined) => {
      if (!value?.trim()) throw new Error('Better Auth secret not provided');
      return value;
    }
  },

  DATABASE_URL: {
    schema: (value: string | undefined) => {
      if (!value?.trim()) throw new Error('Database URL not provided');
      return value;
    }
  },
  MEDIA_PATH: {
    schema: (value: string | undefined) => {
      if (!value?.trim()) throw new Error('Media path not provided');
      return value;
    }
  }
});
