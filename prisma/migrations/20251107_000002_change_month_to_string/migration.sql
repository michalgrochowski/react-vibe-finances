-- Clear existing data and change month column from DateTime to String
DELETE FROM budget_months;
ALTER TABLE budget_months DROP COLUMN month;
ALTER TABLE budget_months ADD COLUMN month VARCHAR(7) NOT NULL; -- Format: "2025-10"

-- Update the unique constraint
ALTER TABLE budget_months DROP CONSTRAINT budget_months_userId_month_key;
ALTER TABLE budget_months ADD CONSTRAINT budget_months_userId_month_key UNIQUE ("user_id", month);
