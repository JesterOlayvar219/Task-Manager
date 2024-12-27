/*
  # Fix Personal Chat ID Migration

  1. Changes
    - Update trigger to set personal_chat_id to assignee's username
    - Update existing tasks to use assignee's username
    - Add validation to ensure consistency

  2. Security
    - Maintain existing RLS policies
    - Add specific checks for personal tasks access
*/

-- Create function to get username from user id
CREATE OR REPLACE FUNCTION get_username(user_id TEXT)
RETURNS TEXT AS $$
  SELECT username FROM users WHERE id::text = user_id;
$$ LANGUAGE sql STABLE;

-- Update trigger function to use username
CREATE OR REPLACE FUNCTION handle_task_type()
RETURNS TRIGGER AS $$
BEGIN
  -- For personal tasks (no channel_id), set personal_chat_id to assignee's username
  IF NEW.channel_id IS NULL THEN
    NEW.personal_chat_id := get_username(NEW.assignee);
  ELSE
    -- For channel tasks, ensure personal_chat_id is NULL
    NEW.personal_chat_id := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update existing tasks to use usernames
UPDATE tasks t
SET personal_chat_id = (
  SELECT username 
  FROM users 
  WHERE id::text = t.assignee
)
WHERE channel_id IS NULL;

-- Recreate task_details view
DROP VIEW IF EXISTS task_details;
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
    channel_id IS NOT NULL OR
    personal_chat_id = (SELECT username FROM users WHERE id = auth.uid()) OR
    created_by = auth.uid()::text
  );

-- Create policy
CREATE POLICY "Task create access"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()::text AND
    (
      channel_id IS NOT NULL OR
      (channel_id IS NULL AND assignee = auth.uid()::text)
    )
  );

-- Update policy
CREATE POLICY "Task update access"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()::text OR
    assignee = auth.uid()::text OR
    personal_chat_id = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Delete policy
CREATE POLICY "Task delete access"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()::text OR
    personal_chat_id = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;