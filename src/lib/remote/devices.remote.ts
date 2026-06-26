import { error, redirect } from '@sveltejs/kit';
import { query, form, getRequestEvent } from '$app/server';
import { auth } from '$lib/server/auth';

import { z } from 'zod';
import { devices } from '$lib/server/db/schema';

const deviceSchema = z.object({
  name: z.string(),
  description: z.string(),
  images: z.array(z.file().mime('image/')).max(5, 'Please select up to 5 images.')
});

export const createDevice = form(deviceSchema, async ({ name, description, images }) => {
  return { success: true };
});
