import { error } from '@sveltejs/kit';

import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user, session, account, verification } from '$lib/server/db/schema';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || locals.user.role !== 'admin') {
    throw error(404, 'Not Found');
  }
};

export const actions = {
  migrate: async ({ locals }) => {
    if (!locals.user || locals.user.role !== 'admin') {
      throw error(403, 'Unauthorized');
    }

    const threshold = 1_000_000_000_000;
    const tables = [user, session, account, verification] as const;

    await db.transaction(async (tx) => {
      for (const table of tables) {
        await tx
          .update(table)
          .set({ createdAt: sql`created_at * 1000` })
          .where(sql`created_at < ${threshold}`);

        await tx
          .update(table)
          .set({ updatedAt: sql`updated_at * 1000` })
          .where(sql`updated_at < ${threshold}`);
      }
    });

    return {
      success: true,
      message: 'Timestamp migration complete.'
    };
  }
};
