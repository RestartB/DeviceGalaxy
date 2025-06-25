import { z } from 'zod';

export const passwordFormSchema = z.object({
	password: z.string()
});

export const totpFormSchema = z.object({
	totp: z.string()
});

export type PasswordFormSchema = typeof passwordFormSchema;
export type TotpFormSchema = typeof totpFormSchema;