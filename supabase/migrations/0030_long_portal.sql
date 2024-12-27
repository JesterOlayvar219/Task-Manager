/*
  # Fix task details view and column names

  1. Changes
    - Drop existing view
    - Create task_details view with proper column mapping
    - Add indexes for performance optimization
    - Grant access to authenticated users

  2. Security
    - Enable read access for authenticated users
*/

-- Drop existing view if it exists
DROP VIEW IF EXISTS task_details;

-- Create task_details view with proper column mapping
CREATE OR REPLACE VIEW task_details AS
SELECT 
  t.id,
  t.title,
  t.description,
  t.created_by,
  t.assignee,
  t.due_date,
  t.status,
  t.channel_id,
  t.created_at,
  t.files,
  COALESCE(c.username, t.created_by) as creator_username,
  COALESCE(a.username, t.assignee) as assignee_username
FROM tasks t
LEFT JOIN users c ON c.id::text = t.created_by::text
LEFT JOIN users a ON a.id::text = t.assignee::text;

-- Add indexes to improve join performance
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_channel_id ON tasks(channel_id);

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;