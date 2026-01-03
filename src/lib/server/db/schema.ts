import { sql, relations } from 'drizzle-orm';
import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';

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

export const lastActionTimes = sqliteTable('last_action_times', {
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  lastCreatedTime: integer('last_created_time', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  lastUpdatedTime: integer('last_updated_time', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  lastDeletedTime: integer('last_deleted_time', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  lastTagCreatedTime: integer('last_tag_created_time', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  lastTagUpdatedTime: integer('last_tag_updated_time', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  lastTagDeletedTime: integer('last_tag_deleted_time', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull()
});

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  twoFactorEnabled: integer('two_factor_enabled', { mode: 'boolean' }).default(false),
  role: text('role'),
  banned: integer('banned', { mode: 'boolean' }).default(false),
  banReason: text('ban_reason'),
  banExpires: integer('ban_expires', { mode: 'timestamp_ms' }),
  backgroundImage: text('background_image'),
  backgroundImageBlurPx: integer('background_image_blur_px'),
  description: text('description'),
  subdomain: text('subdomain'),
  subdomainShareId: text('subdomain_share_id'),
  discordDomainVerifyToken: text('discord_domain_verify_token'),
  suspended: integer('suspended', { mode: 'boolean' }).default(false),
  suspendReason: text('suspend_reason')
});

export const session = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonated_by')
  },
  (table) => [index('session_userId_idx').on(table.userId)]
);

export const account = sqliteTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', {
      mode: 'timestamp_ms'
    }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', {
      mode: 'timestamp_ms'
    }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull()
  },
  (table) => [index('account_userId_idx').on(table.userId)]
);

export const verification = sqliteTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull()
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)]
);

export const twoFactor = sqliteTable(
  'two_factor',
  {
    id: text('id').primaryKey(),
    secret: text('secret').notNull(),
    backupCodes: text('backup_codes').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' })
  },
  (table) => [
    index('twoFactor_secret_idx').on(table.secret),
    index('twoFactor_userId_idx').on(table.userId)
  ]
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  twoFactors: many(twoFactor)
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id]
  })
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id]
  })
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(user, {
    fields: [twoFactor.userId],
    references: [user.id]
  })
}));
