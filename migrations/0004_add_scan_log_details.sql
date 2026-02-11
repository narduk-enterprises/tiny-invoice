-- Add details column to scan_logs for JSON debug info
ALTER TABLE scan_logs ADD COLUMN details text;
