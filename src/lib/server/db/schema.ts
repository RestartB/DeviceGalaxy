import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const userDevices = sqliteTable('devices', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').notNull(),
	deivceName: text('name', { length: 255 }).notNull(),
	description: text('description', { length: 255 }).notNull().default(''),
	createdAt: integer('created_at').notNull().default(0),
	updatedAt: integer('updated_at').notNull().default(0),
	deviceTypeID: integer('device_type_id').notNull()
});

export const deviceTypes = sqliteTable('device_types', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').notNull(),
	name: text('name', { length: 255 }).notNull(),
	description: text('description', { length: 255 }).notNull().default(''),
	iconURL: text('icon_url').notNull().default('')
});
