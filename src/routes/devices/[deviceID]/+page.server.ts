import { error } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.js';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) {
    return error(401, 'Not logged in');
  }

  const deviceData = await db.query.device.findFirst({
    where: (device, { and, eq }) => and(eq(device.id, params.deviceID), eq(device.userId, user.id)),
    with: {
      specifications: {
        with: {
          field: true,
          value: true
        }
      }
    }
  });

  if (!deviceData) {
    return error(404, 'Device not found');
  }
  return { device: deviceData };
};
