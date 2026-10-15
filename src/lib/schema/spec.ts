import z from 'zod';

export const specValueSchema = z.object({
  uuid: z.uuidv4().default(() => crypto.randomUUID()),
  fieldId: z.uuidv4(),
  valueId: z.uuidv4().optional()
});

export type SpecValueSchema = z.infer<typeof specValueSchema>;

export const newSpecFieldSchema = z.object({
  name: z.string().trim().min(1, 'Please enter a name.').max(50, 'Must be 50 characters or less.')
});

export type NewSpecFieldSchema = z.infer<typeof newSpecFieldSchema>;

export const editSpecFieldSchema = z.object({
  fieldId: z.uuidv4(),
  name: z.string().trim().min(1, 'Please enter a name.').max(50, 'Must be 50 characters or less.')
});

export type EditSpecFieldSchema = z.infer<typeof editSpecFieldSchema>;

export const newSpecValueSchema = z.object({
  fieldId: z.uuidv4(),
  value: z
    .string()
    .trim()
    .min(1, 'Please enter a value.')
    .max(100, 'Must be 100 characters or less.')
});

export type NewSpecValueSchema = z.infer<typeof newSpecValueSchema>;

export const editSpecValueSchema = z.object({
  fieldId: z.uuidv4(),
  valueId: z.uuidv4(),
  value: z
    .string()
    .trim()
    .min(1, 'Please enter a value.')
    .max(100, 'Must be 100 characters or less.')
});

export type EditSpecValueSchema = z.infer<typeof editSpecValueSchema>;
