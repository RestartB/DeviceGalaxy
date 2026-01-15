import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { userDevices, shares, user } from '$lib/server/db/schema';

export async function GET(event) {
  // Get status ID
  const statusIdBase: string = event.params.statusid;

  const base64Encoded = statusIdBase.replace(/-/g, '+').replace(/_/g, '/');
  const padding = statusIdBase.length % 4 === 0 ? '' : '='.repeat(4 - (statusIdBase.length % 4));
  const base64WithPadding = base64Encoded + padding;
  const statusId = atob(base64WithPadding)
    .split('')
    .map((char) => String.fromCharCode(char.charCodeAt(0)))
    .join('');

  if (!statusId) {
    console.error('Status ID is required');
    return json({ error: 'Status ID is required' }, { status: 400 });
  }

  const [shareId, deviceId] = statusId.split('-');
  if (!shareId || !deviceId) {
    console.error('Invalid status ID format');
    return json({ error: 'Invalid status ID format' }, { status: 400 });
  }

  // Check for share in database
  const share = await db.select().from(shares).where(eq(shares.id, shareId)).get();

  if (!share) {
    console.error('Share not found');
    return json({ error: 'Share not found' }, { status: 404 });
  }

  if (share.type === 2 && share.sharedDevice !== parseInt(deviceId)) {
    console.error('Device does not match share type');
    return json({ error: 'Device does not match' }, { status: 404 });
  }

  // Get device
  const device = await db
    .select()
    .from(userDevices)
    .where(and(eq(userDevices.userId, share.userId), eq(userDevices.id, parseInt(deviceId))))
    .get();

  if (!device) {
    console.error('Device not found');
    return json({ error: 'Device not found' }, { status: 404 });
  }

  // Get user
  const userData = await db.select().from(user).where(eq(user.id, share.userId)).get();

  if (!userData) {
    console.error('User not found');
    return json({ error: 'User not found' }, { status: 404 });
  }

  const mediaAttachments = [];

  if (device.internalImages && device.internalImages.length > 0) {
    for (const [id, image] of device.internalImages.entries()) {
      mediaAttachments.push({
        id: id.toString(),
        preview_url: `${event.url.origin}/api/image/device/${device.id}/${image}?share=${shareId}`,
        type: 'image',
        url: `${event.url.origin}/api/image/device/${device.id}/${image}?share=${shareId}&name=orig`
      });
    }
  }

  // https://docs.joinmastodon.org/methods/statuses/
  const jsonResponse = {
    account: {
      acct: userData.name,
      avatar: userData.image,
      avatar_static: userData.image,
      display_name: device.deviceName,
      hide_collections: false,
      locked: false,
      noindex: false,
      uri: `https://devicegalaxy.me/share/${shareId}`,
      url: `https://devicegalaxy.me/share/${shareId}`,
      username: userData.name
    },
    application: { website: null },
    content: `<p>${device.description}</p>`,
    created_at: device.createdAt.toISOString(),
    edited_at: null,
    id: statusIdBase,
    in_reply_to_account_id: null,
    language: 'en',
    media_attachments: mediaAttachments,
    reblog: null,
    spoiler_text: '',
    uri: `https://devicegalaxy.me/share/${shareId}`,
    url: `https://devicegalaxy.me/share/${shareId}`,
    visibility: 'public'
  };

  return json(jsonResponse);
}
