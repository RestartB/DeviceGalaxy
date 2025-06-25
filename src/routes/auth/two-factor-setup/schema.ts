import { z } from 'zod';

export const formSchema = z.object({
	totp: z.string()
});

export type FormSchema = typeof formSchema;