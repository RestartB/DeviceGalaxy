import { createAuthClient } from 'better-auth/svelte';
import { twoFactorClient } from 'better-auth/client/plugins';
import { goto } from '$app/navigation';

export const authClient = createAuthClient({
	baseURL: 'https://devicegalaxy.me',
	plugins: [
		twoFactorClient({
			onTwoFactorRedirect() {
				goto('/dash/auth/verify-2fa');
			}
		})
	]
});

export type Session = typeof authClient.$Infer.Session;
