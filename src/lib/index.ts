import crypto from 'crypto';
import { db } from '$lib/server/db';
import { shares } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

import { TURNSTILE_SECRET_KEY } from '$env/static/private';

export async function generateShareId() {
  let trying = true;
  let shareId;

  while (trying) {
    shareId = crypto.randomBytes(4).toString('hex');
    const existingShare = await db.select().from(shares).where(eq(shares.id, shareId)).get();

    if (!existingShare) {
      trying = false;
    }
  }

  return shareId;
}

export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const formData = new FormData();
  formData.append('secret', TURNSTILE_SECRET_KEY);
  formData.append('response', token);
  formData.append('remoteip', ip);

  const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  const result = await fetch(url, {
    body: formData,
    method: 'POST'
  });

  const outcome = await result.json();
  if (outcome.success) {
    return true;
  } else {
    console.error('Turnstile verification failed:', outcome);
    return false;
  }
}
