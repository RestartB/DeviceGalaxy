import { z } from 'zod/v4';
import { env } from '$env/dynamic/public';

export const enterEmailSchema = z.object({
  email: z.email(),
  'cf-turnstile-response':
    env.PUBLIC_TURNSTILE_ENABLED.toLowerCase() === 'true'
      ? z.string().nonempty('Please complete the Captcha.')
      : z.string().optional()
});
