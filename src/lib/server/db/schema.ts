import { relations, sql } from 'drizzle-orm';
import {
  pgTable,
  integer,
  boolean,
  text,
  uuid,
  timestamp,
  unique,
  primaryKey,
  index
} from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const device = pgTable('devices', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description').default('').notNull(),
  additional: text('additional').default('').notNull(),
  images: text('images')
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const tag = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  colour: text('colour').default('').notNull(),
  textColour: text('text_colour').default('').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const deviceTag = pgTable(
  'device_tags',
  {
    deviceId: uuid('device_id')
      .notNull()
      .references(() => device.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tag.id, { onDelete: 'cascade' })
  },
  (t) => [primaryKey({ columns: [t.deviceId, t.tagId] }), index('device_tags_tag_idx').on(t.tagId)]
);

export const specificationField = pgTable(
  'specification_fields',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    key: text('key').notNull()
  },
  (t) => [unique().on(t.userId, t.key).nullsNotDistinct()]
);

export const specificationValue = pgTable(
  'specification_values',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    fieldId: uuid('field_id')
      .notNull()
      .references(() => specificationField.id, { onDelete: 'cascade' }),
    value: text('value').notNull()
  },
  (t) => [unique().on(t.fieldId, t.value).nullsNotDistinct()]
);

export const deviceSpecification = pgTable(
  'device_specifications',
  {
    deviceId: uuid('device_id')
      .notNull()
      .references(() => device.id, { onDelete: 'cascade' }),
    fieldId: uuid('field_id')
      .notNull()
      .references(() => specificationField.id, { onDelete: 'cascade' }),
    valueId: uuid('value_id')
      .notNull()
      .references(() => specificationValue.id, { onDelete: 'cascade' }),
    position: integer().notNull()
  },
  (t) => [primaryKey({ columns: [t.deviceId, t.fieldId] })]
);

export const share = pgTable('shares', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: integer('type').notNull(),
  device: uuid('shared_device').references(() => device.id, { onDelete: 'cascade' }),
  tags: text('shared_tags')
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  internal: boolean('internal')
    .default(false)
    .$defaultFn(() => false)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const devicesRelations = relations(device, ({ many }) => ({
  specifications: many(deviceSpecification)
}));

export const deviceSpecificationsRelations = relations(deviceSpecification, ({ one }) => ({
  device: one(device, {
    fields: [deviceSpecification.deviceId],
    references: [device.id]
  }),
  field: one(specificationField, {
    fields: [deviceSpecification.fieldId],
    references: [specificationField.id]
  })
}));

export const specificationFieldsRelations = relations(specificationField, ({ many }) => ({
  deviceSpecifications: many(deviceSpecification)
}));

export * from './auth.schema';
