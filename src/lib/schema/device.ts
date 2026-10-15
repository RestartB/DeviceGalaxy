import z from 'zod';
import { specValueSchema } from './spec';

const fileCheck = z.file().superRefine((file, ctx) => {
  if (file.size > 5_000_000) {
    ctx.addIssue({
      code: 'custom',
      message: `File is bigger than 5MB`
    });
  }

  if (!file.type.startsWith('image/')) {
    ctx.addIssue({
      code: 'custom',
      message: `Invalid image type: ${file.type || '(unknown)'}`
    });
  }
});

export const newDeviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Please enter a title.')
    .max(100, 'Must be 100 characters or less.'),
  description: z.string().max(1000, 'Must be 1000 characters or less.'),
  specs: z.array(specValueSchema).max(10, 'Please select up to 10 specifications.').default([]),
  images: z.array(fileCheck).max(5, 'Please select up to 5 images.').default([])
});

export const editDeviceSchema = z
  .object({
    id: z.uuid(),
    name: z
      .string()
      .trim()
      .min(1, 'Please enter a title.')
      .max(100, 'Must be 100 characters or less.'),
    description: z.string().max(1000, 'Must be 1000 characters or less.'),
    specs: z.array(specValueSchema).max(10, 'Please select up to 10 specifications.').default([]),
    images: z.array(fileCheck).default([]),
    existingImages: z.array(z.uuid()).default([])
  })
  .refine((data) => data.images.length + data.existingImages.length <= 5, {
    message: 'Please select up to 5 images.',
    path: ['images']
  });

export type DeviceSchema = z.infer<typeof newDeviceSchema>;
