import { superValidate, setError } from 'sveltekit-superforms';
import { passwordFormSchema, totpFormSchema } from './schema';
import type { Actions } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async () => {
	const passwordForm = await superValidate(zod(passwordFormSchema));
	const totpForm = await superValidate(zod(totpFormSchema));

	return { passwordForm, totpForm };
};

export const actions: Actions = {
	confirmPassword: async (event) => {
		const form = await superValidate(event, zod(passwordFormSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			const { totpURI, backupCodes } = await auth.api.enableTwoFactor({
				headers: event.request.headers,
				body: {
					password: form.data.password
				}
			});

			return {
				form,
				totpURI: totpURI,
				backupCodes: backupCodes
			};
		} catch (error) {
			console.log('Unexpected error while enabling 2FA', error);
			return setError(form, 'Unexpected error');
		}
	},
	verifyTOTP: async (event) => {
		const form = await superValidate(event, zod(totpFormSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			await auth.api.verifyTOTP({
				headers: event.request.headers,
				body: {
					code: form.data.totp
				}
			});

			return redirect(302, '/');
		} catch (error) {
			console.log('Unexpected error during TOTP verification', error);
			return setError(form, 'Unexpected error');
		}
	}
};
