import { error } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

import { message, fail } from 'sveltekit-superforms';
import { superValidate } from 'sveltekit-superforms/server';
import { zod4 } from 'sveltekit-superforms/adapters';
import { editDescriptionSchema } from '$lib/schema/editDescription';

export const load = async () => {
  const descriptionForm = await superValidate(zod4(editDescriptionSchema));

  return { descriptionForm };
};

export const actions = {
  updateDescription: async ({ request }) => {
    // Check if the user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session || !session.user) {
      return error(401, 'Unauthorized');
    }

    const form = await superValidate(request, zod4(editDescriptionSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Update description
    await auth.api.updateUser({
      headers: request.headers,
      body: {
        description: form.data.description
      }
    });

    return message(form, 'Description updated successfully!');
  }
};
