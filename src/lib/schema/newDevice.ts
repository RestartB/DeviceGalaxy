import { z } from 'zod/v4';
import { PUBLIC_TURNSTILE_ENABLED } from '$env/static/public';

export const newDeviceSchema = z.object({
  deviceID: z.number().optional(),
  deviceName: z
    .string()
    .min(1, 'Device name is required')
    .max(255, 'Device name must be 255 characters or less'),
  description: z.string().max(1024, 'Description must be 1024 characters or less').optional(),
  additional: z.string().max(1024, 'Additional notes must be 1024 characters or less').optional(),
  cpu: z.string().max(255, 'CPU must be 255 characters or less').optional(),
  gpu: z.string().max(255, 'GPU must be 255 characters or less').optional(),
  memory: z.string().max(255, 'Memory must be 255 characters or less').optional(),
  storage: z.string().max(255, 'Storage must be 255 characters or less').optional(),
  os: z.string().max(255, 'OS must be 255 characters or less').optional(),
  brand: z.string().max(255, 'Brand must be 255 characters or less').optional(),
  images: z
    .instanceof(File, { message: 'Please upload a file.' })
    .refine((f) => f.size < 10_000_000, 'This file is too big. The max size per file is 10MB.')
    .refine(
      (f) => f.type === 'image/png' || f.type === 'image/jpeg' || f.type === 'image/webp',
      'Only PNG, JPEG and WEBP images are allowed.'
    )
    .array()
    .min(0)
    .max(5, 'You can only select up to 5 images'),
  imageURLs: z.url().array().min(0).max(5, 'You can only select up to 5 images'),
  tags: z.number().array().min(0),
  'cf-turnstile-response':
    PUBLIC_TURNSTILE_ENABLED.toLowerCase() === 'true'
      ? z.string().nonempty('Please complete the Captcha.')
      : z.string().optional()
});
