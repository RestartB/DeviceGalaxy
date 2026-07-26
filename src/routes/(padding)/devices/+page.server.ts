import { eq } from 'drizzle-orm';

import { device, specificationField } from '$lib/server/db/schema';
import { db } from '$lib/server/db';

import type { InferSelectModel } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  let devices: InferSelectModel<typeof device>[] = [];
  let specFields: InferSelectModel<typeof specificationField>[] = [];

  if (!locals.user) {
    return { devices, specFields };
  }

  devices = await db.select().from(device).where(eq(device.userId, locals.user.id));
  specFields = await db
    .select()
    .from(specificationField)
    .where(eq(specificationField.userId, locals.user.id));

  return { devices, specFields };
};
