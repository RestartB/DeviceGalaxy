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
	signUp: async (event) => {
		const form = await superValidate(event, zod(formSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			await auth.api.signUpEmail({
				body: {
					email: form.data.email,
					password: form.data.password,
					name: form.data.fullname
				}
			});

			return redirect(302, '/');
		} catch (error) {
			console.log('Unexpected error during sign in', error);
			return setError(form, 'Unexpected error');
		}
	}
};
