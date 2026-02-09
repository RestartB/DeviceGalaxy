import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';

import { error, redirect } from '@sveltejs/kit';

import { env } from '$env/dynamic/public';

export async function GET(event) {
  const hostname = event.url.hostname;

  const baseDomain = env.PUBLIC_BASE_DOMAIN || 'devicegalaxy.me';
  const subdomain = hostname.replace(`.${baseDomain}`, '').replace(baseDomain, '');

  if (!subdomain || subdomain === hostname) {
    return redirect(307, '/');
  }

  const userRecord = await db.select().from(user).where(eq(user.subdomain, subdomain)).get();

  if (!userRecord) {
    throw error(404, 'User not found');
  }

  if (!userRecord.discordDomainVerifyToken) {
    throw error(403, 'Discord domain verification token not found');
  }

  return new Response(userRecord.discordDomainVerifyToken, { status: 200 });
}
