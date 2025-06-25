import { z } from 'zod';

export const formSchema = z.object({
	code: z.string()
});

export type FormSchema = typeof formSchema;