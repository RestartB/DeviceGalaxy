import { error } from '@sveltejs/kit';

import { db } from '$lib/server/db';
import { user, userDevices, shares } from '$lib/server/db/schema';
import { count, eq, and } from 'drizzle-orm';

import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

import { PUBLIC_BASE_DOMAIN } from '$env/static/public';

export const load = async ({ url }) => {
  const hostname = url.hostname;

  const baseDomain = PUBLIC_BASE_DOMAIN || 'devicegalaxy.me';
  const subdomain = hostname.replace(`.${baseDomain}`, '').replace(baseDomain, '');

  if (subdomain && subdomain !== hostname) {
    const shareUser = await db
      .select({ id: user.id, name: user.name, description: user.description, image: user.image })
      .from(user)
      .where(eq(user.subdomain, subdomain))
      .get();

    if (!shareUser) {
      return error(404, 'Share not found');
    }

    // Get share info
    const share = await db
      .select()
      .from(shares)
      .where(and(eq(shares.userId, shareUser.id), eq(shares.internal, true)))
      .get();

    return { share, shareUser, baseURL: url.hostname };
  }

  // Get counts from db
  const totalUsers = await db.select({ count: count() }).from(user).get();
  const totalDevices = await db.select({ count: count() }).from(userDevices).get();

  // Get total amount of files in image directory
  const imageDirectory = 'user_uploads/device';
  let totalImages = 0;

  try {
    if (existsSync(imageDirectory)) {
      // get folders
      const deviceFolders = await readdir(imageDirectory);

      for (const folder of deviceFolders) {
        const folderPath = join(imageDirectory, folder);

        // check if it's a folder
        const folderStat = await stat(folderPath);
        if (folderStat.isDirectory()) {
          const files = await readdir(folderPath);

          // only count files
          for (const file of files) {
            const filePath = join(folderPath, file);
            const fileStat = await stat(filePath);
            if (fileStat.isFile()) {
              totalImages++;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error counting images:', error);
    totalImages = 0;
  }

  return {
    totalUsers: totalUsers?.count || 0,
    totalDevices: totalDevices?.count || 0,
    totalImages
  };
};
