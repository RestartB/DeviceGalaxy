import { superValidate, setError } from 'sveltekit-superforms';
import { formSchema } from './schema';
import type { Actions } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async () => {
	const form = await superValidate(zod(formSchema));

	return { form };
};

export const actions: Actions = {
	signIn: async (event) => {
		const form = await superValidate(event, zod(formSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		let response: Response;

		try {
			response = await auth.api.signInEmail({
				body: {
					email: form.data.email,
					password: form.data.password,
				},
				asResponse: true
			});

			if (!response.ok) {
				const errorData = await response.json();
				return setError(form, errorData.message || 'Sign in failed');
			}
		} catch (error) {
			console.log('Unexpected error during sign in', error);
			return setError(form, 'Unexpected error');
		}

		// Check if 2FA is required
		const data = await response.json();
		console.log('Sign in response data:', data);
		if (data.twoFactorRedirect) {
			return redirect(302, '/auth/verify-2fa');
		}
		
		return redirect(302, '/');
	}
};
