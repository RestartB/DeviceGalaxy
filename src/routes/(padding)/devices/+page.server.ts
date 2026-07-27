import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;

  if (!user) {
    return { specFields: [] };
  }

  const specFields = await db.query.specificationField.findMany({
    where: (field, { eq }) => eq(field.userId, user.id),
    with: {
      values: true
    }
  });

  return { specFields };
};
