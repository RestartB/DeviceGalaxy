import { sql, relations } from 'drizzle-orm';
import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';
import { user } from './auth.schema';

export const userDevices = sqliteTable('devices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  deviceName: text('name', { length: 255 }).notNull(),
  description: text('description', { length: 1024 }).default(''),
  additional: text('additional', { length: 1024 }).default(''),
  cpu: integer('cpu'),
  gpu: integer('gpu'),
  memory: integer('memory'),
  storage: integer('storage'),
  os: integer('os'),
  brand: integer('brand'),
  tags: text('tag_ids', { mode: 'json' })
    .$type<number[]>()
    .$defaultFn(() => []),
  internalImages: text('internal_images', { mode: 'json' })
    .$type<string[]>()
    .$defaultFn(() => []),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
});

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  tagName: text('tag_name', { length: 40 }).notNull(),
  tagColour: text('tag_color', { length: 7 }),
  tagTextColour: text('tag_text_color', { length: 7 }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
});

export const cpus = sqliteTable('cpus', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userID: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  value: text('name', { length: 255 }).notNull(),
  displayName: text('display_name', { length: 255 }).notNull()
});

export const gpus = sqliteTable('gpus', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userID: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  value: text('name', { length: 255 }).notNull(),
  displayName: text('display_name', { length: 255 }).notNull()
});

export const memory = sqliteTable('memory', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userID: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  value: text('name', { length: 255 }).notNull(),
  displayName: text('display_name', { length: 255 }).notNull()
});

export const storage = sqliteTable('storage', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userID: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  value: text('name', { length: 255 }).notNull(),
  displayName: text('display_name', { length: 255 }).notNull()
});

export const os = sqliteTable('os', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userID: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  value: text('name', { length: 255 }).notNull(),
  displayName: text('display_name', { length: 255 }).notNull()
});

export const brands = sqliteTable('brands', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  value: text('name', { length: 255 }).notNull(),
  displayName: text('display_name', { length: 255 }).notNull()
});

export const shares = sqliteTable('shares', {
  id: text('id').unique(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: integer('type').notNull(),
  sharedDevice: integer('shared_device').references(() => userDevices.id, { onDelete: 'cascade' }),
  sharedTags: text('shared_tags', { mode: 'json' })
    .$type<number[]>()
    .$defaultFn(() => []),
  internal: integer('internal', { mode: 'boolean' })
    .default(false)
    .$defaultFn(() => false)
});

export * from './auth.schema';
