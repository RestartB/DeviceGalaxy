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
	verifyTOTP: async (event) => {
		const form = await superValidate(event, zod(formSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			await auth.api.verifyTOTP({
				headers: event.request.headers,
				body: {
					code: form.data.code
				}
			});

			return redirect(302, '/dash/home');
		} catch (error) {
			console.log('TOTP verification failed', error);
			return setError(form, 'Invalid TOTP code');
		}
	}
};
