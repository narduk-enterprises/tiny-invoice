-- Migration: Add new strategy type columns to opportunities table
-- Supports: multi_outcome_arb and tail_end_sweep strategies

-- Multi-outcome arb fields
ALTER TABLE opportunities ADD COLUMN event_title TEXT;
ALTER TABLE opportunities ADD COLUMN outcome_count INTEGER;
ALTER TABLE opportunities ADD COLUMN outcomes_json TEXT;

-- Tail-end sweep fields
ALTER TABLE opportunities ADD COLUMN annualized_return REAL;
ALTER TABLE opportunities ADD COLUMN days_to_resolution REAL;
