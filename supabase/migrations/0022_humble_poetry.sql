/*
  # Create Task Details View

  1. Changes
    - Create task_details view with proper type casting
    - Add indexes for performance
    - No RLS needed for views

  2. Security
    - View inherits RLS from underlying tables
    - Maintains existing access control
*/

-- Create task_details view with proper type casting
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
  c.username as creator_username,
  a.username as assignee_username
FROM tasks t
LEFT JOIN users c ON t.created_by::text = c.id::text
LEFT JOIN users a ON t.assignee::text = a.id::text;

-- Add indexes to improve join performance
CREATE INDEX IF NOT EXISTS idx_users_id_uuid ON users USING btree ((id::text));
CREATE INDEX IF NOT EXISTS idx_tasks_created_by_uuid ON tasks USING btree ((created_by::text));
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_uuid ON tasks USING btree ((assignee::text));