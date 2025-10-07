import { z } from 'zod/v4';

export const discordVerificationSchema = z.object({
  token: z
    .string()
    .min(35, 'Token must be at least 35 characters')
    .max(
      50,
      "Token must be 50 characters or less. Can't fit your token? Join the support server for assistance."
    )
    .refine((val) => val.startsWith('dh='), {
      message: 'Invalid token'
    })
});
