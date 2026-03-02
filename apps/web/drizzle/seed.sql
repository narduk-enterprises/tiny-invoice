-- Demo user: demo@tinyinvoice.com / demo1234
-- Password hash: PBKDF2-SHA256, 100k iterations, salt (16 zero bytes)
INSERT OR IGNORE INTO users (id, email, name, password_hash, business_name, business_address, created_at)
VALUES (
  'a0000001-0000-4000-8000-000000000001',
  'demo@tinyinvoice.com',
  'Demo User',
  '00000000000000000000000000000000:71760484cecb07d1340c118d5d7dc20222b1f9ab4a8c65af5961aacc5ab3c553',
  'Demo Freelance Co',
  '123 Main St, City, ST 12345',
  1700000000
);

-- 3 clients
INSERT OR IGNORE INTO clients (id, user_id, name, email, address, phone, created_at) VALUES
  ('c0000001-0000-4000-8000-000000000001', 'a0000001-0000-4000-8000-000000000001', 'Acme Corp', 'billing@acme.example.com', '456 Oak Ave, Town, ST 67890', '+1 555-0100', 1700000100),
  ('c0000001-0000-4000-8000-000000000002', 'a0000001-0000-4000-8000-000000000001', 'Startup Inc', 'finance@startup.example.com', '789 Pine Rd', NULL, 1700000200),
  ('c0000001-0000-4000-8000-000000000003', 'a0000001-0000-4000-8000-000000000001', 'Jane Doe', 'jane@personal.example.com', NULL, '+1 555-0200', 1700000300);

-- 6 invoices: 2 paid, 2 sent, 1 draft, 1 overdue (timestamps in Unix seconds)
-- INV-001 paid
INSERT OR IGNORE INTO invoices (id, user_id, client_id, invoice_number, status, issue_date, due_date, notes, subtotal, tax_rate, tax_amount, total, paid_at, created_at, updated_at) VALUES
  ('i0000001-0000-4000-8000-000000000001', 'a0000001-0000-4000-8000-000000000001', 'c0000001-0000-4000-8000-000000000001', 'INV-001', 'paid', 1704067200, 1706745600, 'Thank you for your business.', 450000, 825, 37125, 487125, 1706745600, 1704067200, 1706745600);

INSERT OR IGNORE INTO line_items (id, invoice_id, description, quantity, unit_price, amount, sort_order) VALUES
  ('l0000001-0000-4000-000000000001', 'i0000001-0000-4000-8000-000000000001', 'Web development – homepage', 1, 250000, 250000, 0),
  ('l0000001-0000-4000-8000-000000000002', 'i0000001-0000-4000-8000-000000000001', 'UI/UX design review', 2, 100000, 200000, 1);

-- INV-002 paid
INSERT OR IGNORE INTO invoices (id, user_id, client_id, invoice_number, status, issue_date, due_date, notes, subtotal, tax_rate, tax_amount, total, paid_at, created_at, updated_at) VALUES
  ('i0000001-0000-4000-8000-000000000002', 'a0000001-0000-4000-8000-000000000001', 'c0000001-0000-4000-8000-000000000002', 'INV-002', 'paid', 1704153600, 1706832000, NULL, 120000, 0, 0, 120000, 1706832000, 1704153600, 1706832000);

INSERT OR IGNORE INTO line_items (id, invoice_id, description, quantity, unit_price, amount, sort_order) VALUES
  ('l0000001-0000-4000-000000000003', 'i0000001-0000-4000-8000-000000000002', 'Monthly hosting & maintenance', 1, 120000, 120000, 0);

-- INV-003 sent
INSERT OR IGNORE INTO invoices (id, user_id, client_id, invoice_number, status, issue_date, due_date, notes, subtotal, tax_rate, tax_amount, total, paid_at, created_at, updated_at) VALUES
  ('i0000001-0000-4000-8000-000000000003', 'a0000001-0000-4000-8000-000000000001', 'c0000001-0000-4000-8000-000000000001', 'INV-003', 'sent', 1704240000, 1706918400, NULL, 185000, 825, 15263, 200263, NULL, 1704240000, 1704240000);

INSERT OR IGNORE INTO line_items (id, invoice_id, description, quantity, unit_price, amount, sort_order) VALUES
  ('l0000001-0000-4000-000000000004', 'i0000001-0000-4000-8000-000000000003', 'Consulting – architecture review', 3, 50000, 150000, 0),
  ('l0000001-0000-4000-000000000005', 'i0000001-0000-4000-8000-000000000003', 'Documentation', 1, 35000, 35000, 1);

-- INV-004 sent
INSERT OR IGNORE INTO invoices (id, user_id, client_id, invoice_number, status, issue_date, due_date, notes, subtotal, tax_rate, tax_amount, total, paid_at, created_at, updated_at) VALUES
  ('i0000001-0000-4000-8000-000000000004', 'a0000001-0000-4000-8000-000000000001', 'c0000001-0000-4000-8000-000000000003', 'INV-004', 'sent', 1704326400, 1707004800, 'Net 30.', 75000, 0, 0, 75000, NULL, 1704326400, 1704326400);

INSERT OR IGNORE INTO line_items (id, invoice_id, description, quantity, unit_price, amount, sort_order) VALUES
  ('l0000001-0000-4000-000000000006', 'i0000001-0000-4000-8000-000000000004', 'Logo design', 1, 75000, 75000, 0);

-- INV-005 draft
INSERT OR IGNORE INTO invoices (id, user_id, client_id, invoice_number, status, issue_date, due_date, notes, subtotal, tax_rate, tax_amount, total, paid_at, created_at, updated_at) VALUES
  ('i0000001-0000-4000-8000-000000000005', 'a0000001-0000-4000-8000-000000000001', 'c0000001-0000-4000-8000-000000000002', 'INV-005', 'draft', 1704412800, 1707091200, NULL, 200000, 825, 16500, 216500, NULL, 1704412800, 1704412800);

INSERT OR IGNORE INTO line_items (id, invoice_id, description, quantity, unit_price, amount, sort_order) VALUES
  ('l0000001-0000-4000-000000000007', 'i0000001-0000-4000-8000-000000000005', 'API integration', 1, 150000, 150000, 0),
  ('l0000001-0000-4000-000000000008', 'i0000001-0000-4000-8000-000000000005', 'Testing & QA', 1, 50000, 50000, 1);

-- INV-006 overdue
INSERT OR IGNORE INTO invoices (id, user_id, client_id, invoice_number, status, issue_date, due_date, notes, subtotal, tax_rate, tax_amount, total, paid_at, created_at, updated_at) VALUES
  ('i0000001-0000-4000-8000-000000000006', 'a0000001-0000-4000-8000-000000000001', 'c0000001-0000-4000-8000-000000000001', 'INV-006', 'overdue', 1701907200, 1704585600, 'Past due.', 300000, 825, 24750, 324750, NULL, 1701907200, 1701907200);

INSERT OR IGNORE INTO line_items (id, invoice_id, description, quantity, unit_price, amount, sort_order) VALUES
  ('l0000001-0000-4000-000000000009', 'i0000001-0000-4000-8000-000000000006', 'Full website redesign', 1, 200000, 200000, 0),
  ('l0000001-0000-4000-000000000010', 'i0000001-0000-4000-8000-000000000006', 'Content migration', 1, 100000, 100000, 1);
