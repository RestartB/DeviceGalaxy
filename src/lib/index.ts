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
  console.log('Verifying Turnstile token:', token);
  console.log('IP:', ip);

  if (!token || token.trim() === '') {
    console.error('Turnstile verification failed: Empty token');
    return false;
  }

  const params = new URLSearchParams();
  params.append('secret', TURNSTILE_SECRET_KEY);
  params.append('response', token);

  const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  try {
    console.log('Sending verification request to Turnstile...');
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const outcome = await result.json();
    console.log('Turnstile response:', outcome);

    if (outcome.success) {
      return true;
    } else {
      console.error('Turnstile verification failed:', outcome);
      return false;
    }
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}
