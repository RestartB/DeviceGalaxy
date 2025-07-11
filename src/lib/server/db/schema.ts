import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const userDevices = sqliteTable('devices', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	deviceName: text('name', { length: 255 }).notNull(),
	description: text('description', { length: 1024 }).default(''),
	cpu: integer('cpu'),
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
	externalImages: text('image_urls', { mode: 'json' })
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
	value: text('name', { length: 255 }).notNull().unique(),
	displayName: text('display_name', { length: 255 }).notNull()
});

export const memory = sqliteTable('memory', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userID: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	value: text('name', { length: 255 }).notNull().unique(),
	displayName: text('display_name', { length: 255 }).notNull()
});

export const storage = sqliteTable('storage', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userID: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	value: text('name', { length: 255 }).notNull().unique(),
	displayName: text('display_name', { length: 255 }).notNull()
});

export const os = sqliteTable('os', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userID: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	value: text('name', { length: 255 }).notNull().unique(),
	displayName: text('display_name', { length: 255 }).notNull()
});

export const brands = sqliteTable('brands', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	value: text('name', { length: 255 }).notNull().unique(),
	displayName: text('display_name', { length: 255 }).notNull()
});

export const shares = sqliteTable('shares', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	type: integer('type').notNull(),
	sharedDevice: integer('shared_device'),
	sharedTags: text('shared_tags', { mode: 'json' })
		.$type<number[]>()
		.$defaultFn(() => [])
});

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' })
		.$defaultFn(() => false)
		.notNull(),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	twoFactorEnabled: integer('two_factor_enabled', { mode: 'boolean' })
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = sqliteTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
	refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
	scope: text('scope'),
	password: text('password'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
		() => /* @__PURE__ */ new Date()
	),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
		() => /* @__PURE__ */ new Date()
	)
});

export const twoFactor = sqliteTable('two_factor', {
	id: text('id').primaryKey(),
	secret: text('secret').notNull(),
	backupCodes: text('backup_codes').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});
