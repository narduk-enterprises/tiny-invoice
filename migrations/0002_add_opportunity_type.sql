-- Add opportunity type and high-conviction support
-- Run via: wrangler d1 execute polymarket-arb-db --remote --file=./migrations/0002_add_opportunity_type.sql

-- Add type column to opportunities: 'arbitrage' or 'high_conviction'
ALTER TABLE opportunities ADD COLUMN type TEXT NOT NULL DEFAULT 'arbitrage';

-- Add conviction (the probability of the dominant side, 0-1)
ALTER TABLE opportunities ADD COLUMN conviction REAL NOT NULL DEFAULT 0;

-- Add dominant_side to track which side is favoured: 'YES' or 'NO'
ALTER TABLE opportunities ADD COLUMN dominant_side TEXT NOT NULL DEFAULT '';

-- Add min conviction threshold to bot config
ALTER TABLE bot_config ADD COLUMN min_conviction_pct REAL NOT NULL DEFAULT 92;

-- Update default config with the new column
UPDATE bot_config SET min_conviction_pct = 92 WHERE id = 1;

-- Index for type filtering
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
