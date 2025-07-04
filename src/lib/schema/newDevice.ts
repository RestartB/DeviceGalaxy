import { z } from 'zod/v4';

export const newDeviceSchema = z.object({
	deviceID: z.number().optional(),
	deviceName: z
		.string()
		.min(1, 'Device name is required')
		.max(255, 'Device name must be 255 characters or less'),
	description: z.string().max(1024, 'Description must be 1024 characters or less').optional(),
	cpu: z.string().max(255, 'CPU must be 255 characters or less').optional(),
	memory: z.string().max(255, 'Memory must be 255 characters or less').optional(),
	storage: z.string().max(255, 'Storage must be 255 characters or less').optional(),
	os: z.string().max(255, 'OS must be 255 characters or less').optional(),
	brand: z.string().max(255, 'Brand must be 255 characters or less').optional(),
	imageURLs: z.url().min(0).array()
});
