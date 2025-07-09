import { createAuthClient } from 'better-auth/svelte';
import { twoFactorClient } from 'better-auth/client/plugins';
import { goto } from '$app/navigation';

export const authClient = createAuthClient({
	baseURL: "http://localhost:5173",
	plugins: [
		twoFactorClient({
			onTwoFactorRedirect() {
				goto('/auth/verify-2fa');
			}
		})
	]
});

export type Session = typeof authClient.$Infer.Session;
