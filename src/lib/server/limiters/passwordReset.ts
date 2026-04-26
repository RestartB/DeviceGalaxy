import { RateLimiter } from 'sveltekit-rate-limiter/server';

import type { RequestEvent } from '@sveltejs/kit';
import type { Rate, RateLimiterPlugin } from 'sveltekit-rate-limiter/server';

class BATokenRateLimiter implements RateLimiterPlugin {
  readonly rate: Rate | Rate[];

  constructor(rate: Rate | Rate[]) {
    this.rate = rate;
  }

  async hash(event: RequestEvent) {
    if (!event.locals.user) return false;
    return event.locals.user.id;
  }
}

export const passwordResetLimiter = new RateLimiter({
  IPUA: [1, 'm']
});

export const deviceActionLimiter = new RateLimiter({
  plugins: [new BATokenRateLimiter([1, '5s'])]
});

export const tagActionLimiter = new RateLimiter({
  plugins: [new BATokenRateLimiter([1, 's'])]
});
