import { error } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

import { message, fail } from 'sveltekit-superforms';
import { superValidate } from 'sveltekit-superforms/server';
import { zod4 } from 'sveltekit-superforms/adapters';

import { updateNameSchema } from '$lib/schema/updateName';
import { updateEmailSchema } from '$lib/schema/updateEmail';

export const load = async () => {
  const updateNameForm = await superValidate(zod4(updateNameSchema));
  const updateEmailForm = await superValidate(zod4(updateEmailSchema));
  return { updateNameForm, updateEmailForm };
};

export const actions = {
  updateName: async ({ request, locals }) => {
    if (!locals.user) {
      return error(401, 'Unauthorized');
    }

    const form = await superValidate(request, zod4(updateNameSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Update user name
    await auth.api.updateUser({
      headers: request.headers,
      body: {
        name: form.data.name
      }
    });

    return message(form, 'Updated');
  },
  updateEmail: async ({ request, locals }) => {
    if (!locals.user) {
      return error(401, 'Unauthorized');
    }

    const form = await superValidate(request, zod4(updateEmailSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Update user email
    await auth.api.changeEmail({
      headers: request.headers,
      body: {
        newEmail: form.data.email
      }
    });
    return message(form, 'Updated');
  }
};
