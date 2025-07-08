import { z } from 'zod/v4';

export const profilePictureSchema = z.object({
	image: z
		.instanceof(File, { message: 'Please upload a file.' })
		.refine((f) => f.size < 5000000, 'Max 5MB upload size.')
		.refine(
			(f) => f.type === 'image/png' || f.type === 'image/jpeg' || f.type === 'image/webp',
			'Only PNG, JPEG and WEBP images are allowed.'
		)
});
