import { error } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.js';
import z from 'zod';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) {
    return error(401, 'Not logged in');
  }

  const uuid = z.uuid().safeParse(params.deviceID);
  const classicId = Number(params.deviceID);
  if (!uuid.success && isNaN(classicId)) {
    return error(400, 'Invalid device ID');
  }

  const deviceData = await db.query.device.findFirst({
    where: (device, { and, or, eq }) =>
      and(
        or(
          uuid.success ? eq(device.id, uuid.data) : undefined,
          Number.isSafeInteger(classicId) ? eq(device.classicId, classicId) : undefined
        ),
        eq(device.userId, user.id)
      ),
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
