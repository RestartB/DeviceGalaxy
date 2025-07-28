import { z } from 'zod/v4';

export const editDescriptionSchema = z.object({
  description: z
    .string()
    .max(512, 'Description must be 512 characters or less')
});
