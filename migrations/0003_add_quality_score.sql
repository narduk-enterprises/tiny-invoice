-- Add quality_score column to opportunities table
ALTER TABLE opportunities ADD COLUMN quality_score REAL DEFAULT 0;
