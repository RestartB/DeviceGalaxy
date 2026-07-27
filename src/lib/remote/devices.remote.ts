import { error } from '@sveltejs/kit';
import { form, getRequestEvent } from '$app/server';

import { deviceSchema } from '$lib/schema/device';

export const createDevice = form(deviceSchema, async ({ name, description, specs, images }) => {
  const event = getRequestEvent();
  if (!event.locals.user) {
    return error(401, 'Not logged in');
  }

  return { success: true };
});
