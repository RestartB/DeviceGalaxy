import z from 'zod';

export const specValueSchema = z.object({
  uuid: z.uuidv4().default(() => crypto.randomUUID()),
  fieldId: z.uuidv4(),
  valueId: z.uuidv4().optional()
});

export type SpecValueSchema = z.infer<typeof specValueSchema>;
