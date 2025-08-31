import { error } from '@sveltejs/kit';
import { PUBLIC_TURNSTILE_ENABLED } from '$env/static/public';

import { superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { newUserSchema } from '$lib/schema/newUser';

import { auth } from '$lib/server/auth';
import { verifyTurnstile } from '$lib/index';

export const load = async () => {
  const newUserForm = await superValidate(zod4(newUserSchema));
  return { newUserForm };
};

export const actions = {
  createAccount: async ({ request }) => {
    const form = await superValidate(request, zod4(newUserSchema));

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

    // Create the new user
    const response = await auth.api.signUpEmail({
      body: {
        email: form.data.email,
        name: form.data.name,
        password: form.data.password,
        description: '',
        backgroundImage: '',
        backgroundImageBlurPx: 0,
        banned: false,
      },
      asResponse: true
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating user:', errorData);
      return error(response.status, 'Failed to create user');
    } else {
      console.log('User created:', await response.json());

      // Return success
      return message(form, 'User created successfully');
    }
  }
};
