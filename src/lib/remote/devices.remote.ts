import { error } from '@sveltejs/kit';
import { query, form, getRequestEvent } from '$app/server';
import { auth } from '$lib/server/auth';

import { z } from 'zod';
import { device } from '$lib/server/db/schema';

const deviceSchema = z.object({
  name: z.string(),
  description: z.string(),
  specs: z.array(z.object({ id: z.uuidv4(), value: z.uuidv4() }).required()).default([]),
  images: z.array(z.file().mime('image/')).max(5, 'Please select up to 5 images.')
});

export const createDevice = form(deviceSchema, async ({ name, description, specs, images }) => {
  const event = getRequestEvent();
  if (!event.locals.user) {
    return error(401, 'Not logged in');
  }

  return { success: true };
});
