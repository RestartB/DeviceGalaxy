import { createAuthClient } from 'better-auth/svelte';
import { twoFactorClient, adminClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { goto } from '$app/navigation';

import type { auth } from '$lib/server/auth';

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        goto('/dash/auth/verify-2fa');
      }
    }),
    adminClient(),
    inferAdditionalFields<typeof auth>()
  ]
});

export type Session = typeof authClient.$Infer.Session;
