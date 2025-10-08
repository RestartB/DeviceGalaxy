import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

import { PUBLIC_BASE_DOMAIN } from '$env/static/public';

export const handle: Handle = async ({ event, resolve }) => {
  const hostname = event.url.hostname;

  const baseDomain = PUBLIC_BASE_DOMAIN || 'devicegalaxy.me';
  const subdomain = hostname.replace(`.${baseDomain}`, '').replace(baseDomain, '');

  if (subdomain && subdomain !== hostname) {
    const pathParts = event.url.pathname.split('/').filter(Boolean);
    const firstPart = pathParts[0];

    if (
      event.url.pathname === '/' ||
      (firstPart && !isNaN(Number(firstPart))) ||
      firstPart === '.well_known'
    ) {
      const response = await resolve(event);
      return response;
    } else {
      return redirect(
        307,
        event.url
          .toString()
          .replace('www.', '')
          .replace(subdomain + '.', '')
      );
    }
  }

  const response = await resolve(event);
  return response;
};
