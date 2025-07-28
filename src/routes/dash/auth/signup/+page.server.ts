import { error } from '@sveltejs/kit';

import { superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { newUserSchema } from '$lib/schema/newUser';

import { auth } from '$lib/server/auth';

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

    // Create the new user
    const response = await auth.api.signUpEmail({
      body: {
        email: form.data.email,
        name: form.data.name,
        password: form.data.password,
        description: '',
        backgroundImage: '',
        backgroundImageBlurPx: 0
      },
      asResponse: true
    });

    if (!response.ok) {
      console.error('Error creating user:', response);
      return error(response.status, 'Failed to create user');
    } else {
      console.log('User created:', await response.json());

      // Return success
      return message(form, 'User created successfully');
    }
  }
};
