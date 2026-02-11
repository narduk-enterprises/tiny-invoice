-- Migration: Remove foreign key constraint on opportunities.market_id
-- and add missing quality_score column.
-- SQLite does not support ALTER TABLE DROP CONSTRAINT, so we recreate the table.

PRAGMA foreign_keys=OFF;

-- 1. Create new table without FK, with all required columns including quality_score
CREATE TABLE opportunities_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  market_id TEXT NOT NULL,
  question TEXT NOT NULL DEFAULT '',
  yes_price REAL NOT NULL DEFAULT 0,
  no_price REAL NOT NULL DEFAULT 0,
  spread REAL NOT NULL DEFAULT 0,
  expected_profit REAL NOT NULL DEFAULT 0,
  traded INTEGER NOT NULL DEFAULT 0,
  detected_at TEXT NOT NULL DEFAULT (datetime('now')),
  type TEXT NOT NULL DEFAULT 'arbitrage',
  conviction REAL NOT NULL DEFAULT 0,
  dominant_side TEXT NOT NULL DEFAULT '',
  quality_score REAL DEFAULT 0,
  event_title TEXT,
  outcome_count INTEGER,
  outcomes_json TEXT,
  annualized_return REAL,
  days_to_resolution REAL
);

-- 2. Copy existing data (17 columns from old table)
INSERT INTO opportunities_new (
  id, market_id, question, yes_price, no_price, spread, expected_profit,
  traded, detected_at, type, conviction, dominant_side,
  event_title, outcome_count, outcomes_json, annualized_return, days_to_resolution
)
SELECT
  id, market_id, question, yes_price, no_price, spread, expected_profit,
  traded, detected_at, type, conviction, dominant_side,
  event_title, outcome_count, outcomes_json, annualized_return, days_to_resolution
FROM opportunities;

-- 3. Drop old table and rename
DROP TABLE opportunities;
ALTER TABLE opportunities_new RENAME TO opportunities;

-- 4. Recreate indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_market ON opportunities(market_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_detected ON opportunities(detected_at);

PRAGMA foreign_keys=ON;
