-- Add a mobile column to students if it is not already present.
ALTER TABLE students ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);
