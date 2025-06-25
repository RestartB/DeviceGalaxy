import { createAuthClient } from 'better-auth/svelte';
import { passkeyClient, twoFactorClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	baseURL: 'http://localhost:5173', // the base url of your auth server
	plugins: [passkeyClient(), twoFactorClient()]
});

export type Session = typeof authClient.$Infer.Session