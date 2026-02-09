import { z } from 'zod/v4';
import { env } from '$env/dynamic/public';

export const logInSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or less'),
  'cf-turnstile-response':
    env.PUBLIC_TURNSTILE_ENABLED.toLowerCase() === 'true'
      ? z.string().nonempty('Please complete the Captcha.')
      : z.string().optional()
});
