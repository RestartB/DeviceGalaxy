import { superValidate, setError } from 'sveltekit-superforms';
import { formSchema } from './schema';
import type { Actions } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
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

		try {
			await auth.api.signInEmail({
				body: {
					email: form.data.email,
					password: form.data.password,
					callbackURL: '/auth/verified'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return setError(form, error.message || 'Signin failed');
			}
			console.log('Unexpected error during sign in', error);
			return setError(form, 'Unexpected error');
		}
		return redirect(302, '/');
	}
};
