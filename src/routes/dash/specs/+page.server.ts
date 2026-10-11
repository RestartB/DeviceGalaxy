import { error } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.js';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return error(401, 'Not logged in');
  }

  return {
    specs: await db.query.specificationField.findMany({
      where: (spec, { eq }) => eq(spec.userId, user.id),
      with: {
        values: true
      }
    })
  };
};
