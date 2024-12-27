/*
  # Fix tasks table schema

  1. Changes
    - Rename channel_id to channelId for consistency
    - Add NOT NULL constraints
    - Add default values
    - Update indexes
*/

-- First create a new table with the correct schema
CREATE TABLE IF NOT EXISTS tasks_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  createdBy TEXT NOT NULL,
  assignee TEXT NOT NULL,
  dueDate TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'not-started',
  channelId TEXT NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  files JSONB DEFAULT '[]'::jsonb,
  CONSTRAINT tasks_status_check CHECK (status IN ('not-started', 'in-progress', 'completed'))
);

-- Copy data from old table if it exists
INSERT INTO tasks_new (
  id, title, description, createdBy, assignee, 
  dueDate, status, channelId, createdAt, files
)
SELECT 
  id,
  title,
  description,
  created_by,
  assignee,
  due_date,
  COALESCE(status, 'not-started'),
  channel_id,
  COALESCE(created_at, NOW()),
  COALESCE(files, '[]'::jsonb)
FROM tasks;

-- Drop old table and rename new one
DROP TABLE IF EXISTS tasks CASCADE;
ALTER TABLE tasks_new RENAME TO tasks;

-- Add indexes
CREATE INDEX idx_tasks_created_by ON tasks(createdBy);
CREATE INDEX idx_tasks_assignee ON tasks(assignee);
CREATE INDEX idx_tasks_channel_id ON tasks(channelId);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(createdAt DESC);

-- Update task_details view
CREATE OR REPLACE VIEW task_details AS
SELECT 
  t.id,
  t.title,
  t.description,
  t.createdBy,
  t.assignee,
  t.dueDate,
  t.status,
  t.channelId,
  t.createdAt,
  t.files,
  COALESCE(c.username, t.createdBy) as creator_username,
  COALESCE(a.username, t.assignee) as assignee_username
FROM tasks t
LEFT JOIN users c ON c.id::text = t.createdBy::text
LEFT JOIN users a ON a.id::text = t.assignee::text;

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Update policies
CREATE POLICY "Anyone can read tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = createdBy);

CREATE POLICY "Users can update their tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    auth.uid()::text = createdBy OR
    auth.uid()::text = assignee
  );

CREATE POLICY "Users can delete their tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid()::text = createdBy);

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;