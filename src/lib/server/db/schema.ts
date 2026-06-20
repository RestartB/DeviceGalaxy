import { sql } from 'drizzle-orm';
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

export const devices = pgTable('devices', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  deviceName: text('name').notNull(),
  description: text('description').default('').notNull(),
  additional: text('additional').default('').notNull(),
  images: text('images')
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  tagName: text('name').notNull(),
  tagColour: text('colour').default('').notNull(),
  tagTextColour: text('text_colour').default('').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const deviceTags = pgTable(
  'device_tags',
  {
    deviceId: uuid('device_id')
      .notNull()
      .references(() => devices.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' })
  },
  (t) => [primaryKey({ columns: [t.deviceId, t.tagId] }), index('device_tags_tag_idx').on(t.tagId)]
);

export const specificationFields = pgTable(
  'specification_fields',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    key: text('key').notNull()
  },
  (t) => [unique().on(t.userId, t.key).nullsNotDistinct()]
);

export const deviceSpecifications = pgTable(
  'device_specifications',
  {
    deviceId: uuid('device_id')
      .notNull()
      .references(() => devices.id, { onDelete: 'cascade' }),
    fieldId: uuid('field_id')
      .notNull()
      .references(() => specificationFields.id, { onDelete: 'cascade' }),
    value: text('value').notNull(),
    position: integer().notNull()
  },
  (t) => [
    primaryKey({ columns: [t.deviceId, t.fieldId] }),
    index('device_specs_field_value_idx').on(t.fieldId, t.value)
  ]
);

export const shares = pgTable('shares', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: integer('type').notNull(),
  sharedDevice: uuid('shared_device').references(() => devices.id, { onDelete: 'cascade' }),
  sharedTags: text('shared_tags')
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  internal: boolean('internal')
    .default(false)
    .$defaultFn(() => false)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export * from './auth.schema';
