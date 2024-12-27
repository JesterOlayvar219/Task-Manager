/*
  # Add Personal Tasks Support

  1. Changes
    - Add personal_chat_id column to tasks table to track tasks in personal chats
    - Update task_details view to include personal chat tasks
    - Add indexes for performance
    - Update RLS policies

  2. Security
    - Ensure users can only access their own personal tasks
    - Maintain existing channel task permissions
*/

-- Add personal_chat_id column
ALTER TABLE tasks
ADD COLUMN personal_chat_id TEXT;

-- Update task_details view
DROP VIEW IF EXISTS task_details;
CREATE VIEW task_details AS
SELECT 
  t.id,
  t.title,
  t.description,
  t.created_by,
  t.assignee,
  t.due_date,
  t.status,
  t.channel_id,
  t.personal_chat_id,
  t.created_at,
  t.files,
  COALESCE(c.username, t.created_by) as creator_username,
  COALESCE(a.username, t.assignee) as assignee_username
FROM tasks t
LEFT JOIN users c ON c.id::text = t.created_by::text
LEFT JOIN users a ON a.id::text = t.assignee::text;

-- Add index for personal tasks
CREATE INDEX idx_tasks_personal_chat ON tasks(personal_chat_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Anyone can read tasks" ON tasks;
CREATE POLICY "Anyone can read tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    -- Allow access to channel tasks
    (channel_id IS NOT NULL) OR
    -- Allow access to personal tasks for the assigned user
    (personal_chat_id IS NOT NULL AND auth.uid()::text = assignee)
  );

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;