import { z } from 'zod/v4';

export const updateEmailSchema = z.object({
  email: z.email()
});
