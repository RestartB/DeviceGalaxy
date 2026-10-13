import { specificationField, specificationValue } from '#lib/server/db/schema.js';

export type SpecWithValues = typeof specificationField.$inferSelect & {
  values: Array<typeof specificationValue.$inferSelect>;
};
