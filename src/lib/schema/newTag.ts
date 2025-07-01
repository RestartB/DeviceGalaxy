import { z } from 'zod/v4';

export const newTagSchema = z.object({
	tagName: z
		.string()
		.min(1, 'Tag name is required')
		.max(40, 'Tag name must be 40 characters or less'),
	colour: z
		.string()
		.regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Invalid hex color code')
		.optional(),
	textColour: z
		.string()
		.regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Invalid hex color code')
		.optional()
});
