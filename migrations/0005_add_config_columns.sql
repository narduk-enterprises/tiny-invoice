-- Add missing columns to bot_config table
ALTER TABLE bot_config ADD COLUMN min_volume REAL DEFAULT 50000;
ALTER TABLE bot_config ADD COLUMN min_liquidity REAL DEFAULT 10000;
ALTER TABLE bot_config ADD COLUMN max_daily_trades INTEGER DEFAULT 3;
