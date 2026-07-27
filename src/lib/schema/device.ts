import z from 'zod';
import { specValueSchema } from './spec';

export const deviceSchema = z.object({
  name: z.string(),
  description: z.string(),
  specs: z.array(specValueSchema).default([]),
  images: z.array(z.file().mime('image/')).max(5, 'Please select up to 5 images.')
});

export type DeviceSchema = z.infer<typeof deviceSchema>;
