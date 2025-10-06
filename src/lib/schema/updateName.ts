import { z } from 'zod/v4';

export const updateNameSchema = z.object({
  name: z.string().nonempty('Name is required').max(40, 'Name must be 40 characters or less')
});
