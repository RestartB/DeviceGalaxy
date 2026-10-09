import { db } from '#lib/server/db/index.js';
import { device } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;

  if (!user) {
    return { specFields: [] };
  }

  const devices = await db.select().from(device).where(eq(device.userId, user.id));
  const specFields = await db.query.specificationField.findMany({
    where: (field, { eq }) => eq(field.userId, user.id),
    with: {
      values: true
    }
  });

  return { devices, specFields };
};
