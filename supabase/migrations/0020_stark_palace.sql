/*
  # Fix Tasks Table Relationships and User References

  1. Changes
    - Update tasks table to properly handle user references
    - Add proper indexes for performance
    - Update RLS policies
    - Add constraints for data integrity

  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Ensure proper access control
*/

-- First drop existing policies
DROP POLICY IF EXISTS "Anyone can read tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their tasks" ON tasks;

-- Create temporary table with correct structure
CREATE TABLE tasks_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by TEXT NOT NULL,
  assignee TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'not-started',
  channel_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  files JSONB DEFAULT '[]'::jsonb,
  CONSTRAINT tasks_status_check CHECK (status IN ('not-started', 'in-progress', 'completed'))
);

-- Copy data from old table if it exists
INSERT INTO tasks_new (
  id, title, description, created_by, assignee, 
  due_date, status, channel_id, created_at, files
)
SELECT 
  id,
  title,
  description,
  created_by,
  assignee,
  COALESCE(due_date, NOW()) as due_date,
  COALESCE(status, 'not-started') as status,
  channel_id,
  COALESCE(created_at, NOW()) as created_at,
  COALESCE(files, '[]'::jsonb) as files
FROM tasks;

-- Drop old table and rename new one
DROP TABLE IF EXISTS tasks;
ALTER TABLE tasks_new RENAME TO tasks;

-- Add indexes for performance
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_assignee ON tasks(assignee);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_channel ON tasks(channel_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "Users can update their tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    auth.uid()::text = created_by OR
    auth.uid()::text = assignee
  );

CREATE POLICY "Users can delete their tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid()::text = created_by);