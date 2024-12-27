/*
  # Fix Tasks Table Structure

  1. Changes
    - Add NOT NULL constraints to required fields
    - Add default values for status and timestamps
    - Add proper indexes for common queries

  2. Security
    - Update RLS policies for better access control
*/

-- Add NOT NULL constraints and defaults
ALTER TABLE tasks
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN description SET NOT NULL,
  ALTER COLUMN created_by SET NOT NULL,
  ALTER COLUMN assignee SET NOT NULL,
  ALTER COLUMN due_date SET NOT NULL,
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN channel_id SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN status SET DEFAULT 'not-started';

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_channel ON tasks(channel_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);

-- Update RLS policies
DROP POLICY IF EXISTS "Enable read access for tasks" ON tasks;
DROP POLICY IF EXISTS "Enable insert access for tasks" ON tasks;
DROP POLICY IF EXISTS "Enable update access for tasks" ON tasks;
DROP POLICY IF EXISTS "Enable delete access for tasks" ON tasks;

-- Recreate policies
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