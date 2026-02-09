import { error } from '@sveltejs/kit';

import { superValidate, fail, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { enterEmailSchema } from '$lib/schema/resetPassword';

import { auth } from '$lib/server/auth';
import { verifyTurnstile } from '$lib/index';

import { passwordResetLimiter } from '$lib/server/limiters/passwordReset';

import { env } from '$env/dynamic/public';

export const load = async () => {
  const enterEmailForm = await superValidate(zod4(enterEmailSchema));
  return { enterEmailForm };
};

export const actions = {
  sendEmail: async (event) => {
    if (await passwordResetLimiter.isLimited(event)) {
      console.log('Rate limit exceeded');
      return error(429);
    }

    const form = await superValidate(event.request, zod4(enterEmailSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    if (env.PUBLIC_TURNSTILE_ENABLED.toLowerCase() === 'true') {
      if (form.data['cf-turnstile-response']) {
        // Verify Turnstile token
        const isValid = await verifyTurnstile(
          form.data['cf-turnstile-response'],
          event.request.headers.get('cf-connecting-ip') || ''
        );
        if (!isValid) {
          return error(400, 'Invalid Turnstile token. Please try again.');
        }
      } else {
        return error(400, 'Turnstile token is required.');
      }
    }

    await auth.api.requestPasswordReset({
      body: {
        email: form.data.email,
        redirectTo: env.PUBLIC_BETTER_AUTH_URL + '/dash/auth/password-reset/finish'
      }
    });

    return message(form, 'Done! If an account with this email exists, a reset link has been sent.');
  }
};
