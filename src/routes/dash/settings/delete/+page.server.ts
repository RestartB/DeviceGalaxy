import { error, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

import { superValidate, setError } from 'sveltekit-superforms/server';
import { zod4 } from 'sveltekit-superforms/adapters';
import { deleteAccountSchema } from '$lib/schema/deleteAccount';

export const load = async () => {
	const deleteAccountForm = await superValidate(zod4(deleteAccountSchema));

	return { deleteAccountForm };
};

export const actions = {
	deleteAccount: async ({ request }) => {
		// Check if the user is authenticated
		const session = await auth.api.getSession({
			headers: request.headers
		});

		if (!session || !session.user) {
			return error(401, 'Unauthorized');
		}

		const form = await superValidate(request, zod4(deleteAccountSchema));

		if (!form.valid) {
			return error(400, 'Invalid form');
		}

		// Attempt to delete the user account
		let accountDeleted = false;
		try {
			await auth.api.deleteUser({
				body: {
					password: form.data.password
				},
				headers: request.headers
			});

			accountDeleted = true;
		} catch (err) {
			console.error('Error deleting account:', err);

			if (
				err &&
				typeof err === 'object' &&
				'body' in err &&
				err.body &&
				typeof err.body === 'object' &&
				'code' in err.body &&
				err.body.code === 'INVALID_PASSWORD'
			) {
				console.error('Invalid password provided for account deletion');
				return setError(form, 'password', 'Invalid password provided');
			}
		}

		if (accountDeleted) {
			return redirect(303, '/');
		} else {
			return { form };
		}
	}
};
