import { RateLimiter } from 'sveltekit-rate-limiter/server';

export const passwordResetLimiter = new RateLimiter({
  IPUA: [1, 'm']
});
