import { z } from 'zod/v4';

export const newUserSchema = z.object({
	email: z.email(),
	name: z.string().max(40, 'Name must be 50 characters or less'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.max(128, 'Password must be 128 characters or less')
});
