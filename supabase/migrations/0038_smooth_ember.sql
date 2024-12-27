/*
  # Fix Personal Tasks

  1. Changes
    - Add NOT NULL constraint to personal_chat_id for personal tasks
    - Update existing tasks to properly set personal_chat_id
    - Add check constraint to ensure task type consistency
    - Update RLS policies to handle personal tasks correctly

  2. Security
    - Ensure proper access control for personal tasks
    - Only allow users to see their own personal tasks
*/

-- First ensure all personal tasks have personal_chat_id set
UPDATE tasks
SET personal_chat_id = assignee
WHERE channel_id IS NULL;

-- Add constraint to ensure task type consistency
ALTER TABLE tasks
  DROP CONSTRAINT IF EXISTS check_task_type,
  ADD CONSTRAINT check_task_type CHECK (
    -- Channel tasks must have channel_id and no personal_chat_id
    (channel_id IS NOT NULL AND personal_chat_id IS NULL) OR
    -- Personal tasks must have personal_chat_id and no channel_id
    (channel_id IS NULL AND personal_chat_id IS NOT NULL)
  );

-- Update task_details view to include personal_chat_id
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

-- Update RLS policies
DROP POLICY IF EXISTS "Task read access" ON tasks;
DROP POLICY IF EXISTS "Task create access" ON tasks;
DROP POLICY IF EXISTS "Task update access" ON tasks;
DROP POLICY IF EXISTS "Task delete access" ON tasks;

-- Read policy
CREATE POLICY "Task read access"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    -- Can read channel tasks
    channel_id IS NOT NULL OR
    -- Can read personal tasks if they belong to the user
    (personal_chat_id IS NOT NULL AND personal_chat_id = auth.uid()::text) OR
    -- Can read tasks they created
    created_by = auth.uid()::text
  );

-- Create policy
CREATE POLICY "Task create access"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Must be the creator
    created_by = auth.uid()::text AND
    -- For personal tasks, must be the assignee
    (
      (channel_id IS NOT NULL) OR
      (personal_chat_id IS NOT NULL AND personal_chat_id = auth.uid()::text)
    )
  );

-- Update policy
CREATE POLICY "Task update access"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    -- Can update if creator
    created_by = auth.uid()::text OR
    -- Can update if assignee
    assignee = auth.uid()::text OR
    -- Can update if it's their personal task
    personal_chat_id = auth.uid()::text
  );

-- Delete policy
CREATE POLICY "Task delete access"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    -- Can delete if creator
    created_by = auth.uid()::text OR
    -- Can delete if it's their personal task
    personal_chat_id = auth.uid()::text
  );

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;