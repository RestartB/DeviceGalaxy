import {
  device,
  deviceSpecification,
  specificationField,
  specificationValue
} from '#lib/server/db/schema.js';

export type DeviceWithSpecifications = typeof device.$inferSelect & {
  specifications: Array<
    typeof deviceSpecification.$inferSelect & {
      field: typeof specificationField.$inferSelect;
      value: typeof specificationValue.$inferSelect;
    }
  >;
};
