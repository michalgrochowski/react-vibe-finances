-- Migration: Clean up expenses and recurring expenses without valid categories
-- This migration ensures data integrity before enforcing category requirements

-- Delete any expenses that reference non-existent categories
DELETE FROM expenses 
WHERE category_id NOT IN (SELECT id FROM categories);

-- Delete any recurring expenses that reference non-existent categories
DELETE FROM recurring_expenses 
WHERE category_id NOT IN (SELECT id FROM categories);

-- Optional: If you want to preserve data instead of deleting,
-- you can uncomment the following to create a "General" category for each user
-- and assign orphaned expenses to it:

/*
-- Create General category for users who don't have one
INSERT INTO categories (id, user_id, name, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  u.id,
  'General',
  now(),
  now()
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM categories c 
  WHERE c.user_id = u.id AND c.name = 'General'
);

-- Update orphaned expenses to use the General category
UPDATE expenses e
SET category_id = (
  SELECT c.id FROM categories c 
  WHERE c.user_id = e.user_id AND c.name = 'General'
  LIMIT 1
)
WHERE category_id NOT IN (SELECT id FROM categories);

-- Update orphaned recurring expenses to use the General category
UPDATE recurring_expenses re
SET category_id = (
  SELECT c.id FROM categories c 
  WHERE c.user_id = re.user_id AND c.name = 'General'
  LIMIT 1
)
WHERE category_id NOT IN (SELECT id FROM categories);
*/

