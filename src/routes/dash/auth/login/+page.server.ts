import { error, redirect } from '@sveltejs/kit';
import { PUBLIC_TURNSTILE_ENABLED } from '$env/static/public';

import { superValidate, message, setError, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { logInSchema } from '$lib/schema/logIn';

import { auth } from '$lib/server/auth';
import { verifyTurnstile } from '$lib/index';

export const load = async () => {
  const logInForm = await superValidate(zod4(logInSchema));
  return { logInForm };
};

export const actions = {
  logIn: async ({ request }) => {
    const form = await superValidate(request, zod4(logInSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    if (PUBLIC_TURNSTILE_ENABLED.toLowerCase() === 'true') {
      if (form.data['cf-turnstile-response']) {
        // Verify Turnstile token
        const isValid = await verifyTurnstile(
          form.data['cf-turnstile-response'],
          request.headers.get('cf-connecting-ip') || ''
        );
        if (!isValid) {
          return error(400, 'Invalid Turnstile token. Please try again.');
        }
      } else {
        return error(400, 'Turnstile token is required.');
      }
    }

    // Log in
    const response = await auth.api.signInEmail({
      body: {
        email: form.data.email,
        password: form.data.password
      },
      asResponse: true
    });
    const json = await response.json();

    if (!response.ok) {
      console.error('Error logging in:', json);
      if (json.code === 'INVALID_EMAIL_OR_PASSWORD') {
        return setError(form, 'password', 'Incorrect email or password.');
      } else {
        return error(response.status, 'Failed to log in');
      }
    } else {
      if (json.twoFactorRedirect) {
        return redirect(302, '/dash/auth/verify-2fa');
      }

      return message(form, 'User logged in successfully');
    }
  }
};
