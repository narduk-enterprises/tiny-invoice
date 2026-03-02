/**
 * TinyInvoice database schema.
 *
 * Defines users, sessions, clients, invoices, and line items.
 * All timestamps are Unix seconds unless noted.
 */
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// ─── Users ──────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  businessName: text('business_name'),
  businessAddress: text('business_address'),
  createdAt: integer('created_at').notNull(),
})

// ─── Sessions ───────────────────────────────────────────────
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at').notNull(),
  createdAt: integer('created_at').notNull(),
})

// ─── Clients ────────────────────────────────────────────────
export const clients = sqliteTable('clients', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  address: text('address'),
  phone: text('phone'),
  createdAt: integer('created_at').notNull(),
})

// ─── Invoices ───────────────────────────────────────────────
export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'restrict' }),
  invoiceNumber: text('invoice_number').notNull().unique(),
  status: text('status').notNull().default('draft'),
  issueDate: integer('issue_date').notNull(),
  dueDate: integer('due_date').notNull(),
  notes: text('notes'),
  subtotal: integer('subtotal').notNull(),
  taxRate: integer('tax_rate').default(0),
  taxAmount: integer('tax_amount').notNull(),
  total: integer('total').notNull(),
  paidAt: integer('paid_at'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
})

// ─── Line Items ─────────────────────────────────────────────
export const lineItems = sqliteTable('line_items', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id')
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: integer('unit_price').notNull(),
  amount: integer('amount').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const invoiceStatusEnum = ['draft', 'sent', 'paid', 'overdue'] as const
export type InvoiceStatus = (typeof invoiceStatusEnum)[number]

// ─── Type helpers ───────────────────────────────────────────
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type Client = typeof clients.$inferSelect
export type NewClient = typeof clients.$inferInsert
export type Invoice = typeof invoices.$inferSelect
export type NewInvoice = typeof invoices.$inferInsert
export type LineItem = typeof lineItems.$inferSelect
export type NewLineItem = typeof lineItems.$inferInsert
