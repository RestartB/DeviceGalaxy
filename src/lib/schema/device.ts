import z from 'zod';
import { specValueSchema } from './spec';

export const deviceSchema = z.object({
  name: z.string().trim().min(1, 'Please enter a title.'),
  description: z.string(),
  specs: z.array(specValueSchema).default([]),
  images: z
    .array(
      z.file().superRefine((file, ctx) => {
        if (file.size > 5_000_000) {
          ctx.addIssue({
            code: 'custom',
            message: `File is bigger than 5MB`
          });
        }

        if (!file.type.startsWith('image/')) {
          ctx.addIssue({
            code: 'custom',
            message: `Invalid image type: ${file.type || '(empty)'}`
          });
        }
      })
    )
    .max(5, 'Please select up to 5 images.')
});

export type DeviceSchema = z.infer<typeof deviceSchema>;
