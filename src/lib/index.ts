import { TURNSTILE_SECRET_KEY } from '$env/static/private';

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
