import { z } from 'zod/v4';
import { PUBLIC_TURNSTILE_ENABLED } from '$env/static/public';

export const enterEmailSchema = z.object({
  email: z.email(),
  'cf-turnstile-response':
    PUBLIC_TURNSTILE_ENABLED.toLowerCase() === 'true'
      ? z.string().nonempty('Please complete the Captcha.')
      : z.string().optional()
});