import { createAuthClient } from 'better-auth/svelte';
import { twoFactorClient } from 'better-auth/client/plugins';
import { goto } from '$app/navigation';

import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';

export const authClient = createAuthClient({
	baseURL: PUBLIC_BETTER_AUTH_URL,
	plugins: [
		twoFactorClient({
			onTwoFactorRedirect() {
				goto('/auth/verify-2fa');
			}
		})
	]
});

export type Session = typeof authClient.$Infer.Session;
