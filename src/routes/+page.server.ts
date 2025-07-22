import { db } from '$lib/server/db';
import { user, userDevices } from '$lib/server/db/schema';
import { count } from 'drizzle-orm';

import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const load = async () => {
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
