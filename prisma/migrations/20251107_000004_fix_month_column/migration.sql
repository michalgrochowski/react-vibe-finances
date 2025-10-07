-- Fix month column to be VARCHAR instead of DATE
-- First clear all data
DELETE FROM budget_months;

-- Drop the existing month column
ALTER TABLE budget_months DROP COLUMN month;

-- Add new month column as VARCHAR(7)
ALTER TABLE budget_months ADD COLUMN month VARCHAR(7) NOT NULL;

-- Recreate the unique constraint
ALTER TABLE budget_months DROP CONSTRAINT IF EXISTS budget_months_userId_month_key;
ALTER TABLE budget_months ADD CONSTRAINT budget_months_userId_month_key UNIQUE ("user_id", month);
