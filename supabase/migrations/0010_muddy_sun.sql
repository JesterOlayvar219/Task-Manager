/*
  # Update Tasks Table and Policies

  1. Changes
    - Drop existing policies first
    - Drop foreign key constraints
    - Update column types from UUID to TEXT
    - Recreate policies with proper TEXT type comparisons
  
  2. Security
    - Maintain same access control rules
    - Use auth.uid()::text for comparisons
*/

-- First drop all existing policies
DROP POLICY IF EXISTS "Enable read access for tasks" ON tasks;
DROP POLICY IF EXISTS "Enable insert access for tasks" ON tasks;
DROP POLICY IF EXISTS "Enable update access for tasks" ON tasks;
DROP POLICY IF EXISTS "Enable delete access for tasks" ON tasks;
DROP POLICY IF EXISTS "Enable update access for assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Enable delete access for own tasks" ON tasks;

-- Drop foreign key constraints
ALTER TABLE tasks
  DROP CONSTRAINT IF EXISTS tasks_created_by_fkey,
  DROP CONSTRAINT IF EXISTS tasks_assignee_fkey;

-- Update column types
ALTER TABLE tasks
  ALTER COLUMN created_by TYPE TEXT USING created_by::TEXT,
  ALTER COLUMN assignee TYPE TEXT USING assignee::TEXT;

-- Recreate policies with proper TEXT type comparisons
CREATE POLICY "Enable read access for tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "Enable update access for tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    auth.uid()::text = created_by OR
    auth.uid()::text = assignee
  );

CREATE POLICY "Enable delete access for tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid()::text = created_by);