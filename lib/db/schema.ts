import { pgTable, text, timestamp, boolean, integer, date } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').default(false),
  image: text('image'),
  // 'player' | 'admin' | 'super_admin'
  role: text('role').default('player'),
  location: text('location'),
  bio: text('bio'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  expiresAt: timestamp('expiresAt'),
  password: text('password'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------

export const rentalConsole = pgTable('rental_console', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  model: text('model').notNull(),
  condition: text('condition').notNull(),
  pricePerHour: integer('pricePerHour').notNull(),
  pricePerDay: integer('pricePerDay').notNull(),
  deposit: integer('deposit').notNull(),
  available: boolean('available').default(true),
  image: text('image'),
  features: text('features').array(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const rentalBooking = pgTable('rental_booking', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  consoleId: text('consoleId')
    .notNull()
    .references(() => rentalConsole.id, { onDelete: 'cascade' }),
  duration: integer('duration').notNull(),
  unit: text('unit').notNull(),
  deliveryOption: text('deliveryOption').notNull(),
  deliveryAddress: text('deliveryAddress'),
  totalPrice: integer('totalPrice').notNull(),
  status: text('status').default('pending'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- Admin work area tables ------------------------------------------------

export const workMessage = pgTable('work_message', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  authorName: text('authorName'),
  authorImage: text('authorImage'),
  body: text('body').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
})

export const workEvent = pgTable('work_event', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  eventDate: date('eventDate').notNull(),
  eventTime: text('eventTime'),
  category: text('category').default('general'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow(),
})
