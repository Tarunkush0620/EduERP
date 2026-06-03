import { pgTable, uuid, varchar, text, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ───────────────────────────────────────────────────
export const roleEnum = pgEnum('user_role', ['super_admin', 'teacher', 'student']);
export const userStatusEnum = pgEnum('user_status', ['active', 'suspended', 'inactive']);

// ─── Users ───────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull().default('student'),
  status: userStatusEnum('status').notNull().default('active'),
  avatar: text('avatar'),
  phone: varchar('phone', { length: 20 }),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Roles & Permissions ─────────────────────────────────────
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  module: varchar('module', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const rolePermissions = pgTable('role_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
});

// ─── Refresh Tokens ──────────────────────────────────────────
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revoked: boolean('revoked').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Relations ───────────────────────────────────────────────
export const usersRelations = relations(users, ({ one, many }) => ({
  teacherProfile: one(teachers, {
    fields: [users.id],
    references: [teachers.userId],
  }),
  studentProfile: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  refreshTokens: many(refreshTokens),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

// ─── Forward declarations for relations (defined in academics.ts) ──
// These are imported here for relation definitions
import { teachers, students } from './academics';
