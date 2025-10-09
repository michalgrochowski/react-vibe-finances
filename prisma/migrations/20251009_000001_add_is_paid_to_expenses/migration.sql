-- Add isPaid column to expenses table
ALTER TABLE "expenses" ADD COLUMN "is_paid" BOOLEAN NOT NULL DEFAULT false;

