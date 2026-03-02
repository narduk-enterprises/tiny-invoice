-- TinyInvoice schema: users, sessions, clients, invoices, line_items
-- All timestamps are Unix seconds.

CREATE TABLE IF NOT EXISTS `users` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `name` text NOT NULL,
  `password_hash` text NOT NULL,
  `business_name` text,
  `business_address` text,
  `created_at` integer NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `users_email_unique` ON `users` (`email`);

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `expires_at` integer NOT NULL,
  `created_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `clients` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `name` text NOT NULL,
  `email` text NOT NULL,
  `address` text,
  `phone` text,
  `created_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `invoices` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `client_id` text NOT NULL REFERENCES `clients`(`id`) ON DELETE RESTRICT,
  `invoice_number` text NOT NULL,
  `status` text NOT NULL DEFAULT 'draft',
  `issue_date` integer NOT NULL,
  `due_date` integer NOT NULL,
  `notes` text,
  `subtotal` integer NOT NULL,
  `tax_rate` integer DEFAULT 0,
  `tax_amount` integer NOT NULL,
  `total` integer NOT NULL,
  `paid_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `invoices_invoice_number_unique` ON `invoices` (`invoice_number`);

CREATE TABLE IF NOT EXISTS `line_items` (
  `id` text PRIMARY KEY NOT NULL,
  `invoice_id` text NOT NULL REFERENCES `invoices`(`id`) ON DELETE CASCADE,
  `description` text NOT NULL,
  `quantity` integer NOT NULL DEFAULT 1,
  `unit_price` integer NOT NULL,
  `amount` integer NOT NULL,
  `sort_order` integer NOT NULL DEFAULT 0
);
