/*
  # Fix Personal Chat ID Population

  1. Changes
    - Update trigger function to properly set personal_chat_id
    - Add explicit type casting
    - Update existing NULL values
    - Add validation constraints

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS ensure_task_type ON tasks;
DROP FUNCTION IF EXISTS handle_task_type();

-- Create improved trigger function
CREATE OR REPLACE FUNCTION handle_task_type()
RETURNS TRIGGER AS $$
DECLARE
  username_val TEXT;
BEGIN
  -- Get username for the assignee
  SELECT username INTO username_val
  FROM users 
  WHERE id::text = NEW.assignee::text;

  -- Set personal_chat_id based on task type
  IF NEW.channel_id IS NULL THEN
    -- For personal tasks, use assignee's username
    IF username_val IS NULL THEN
      RAISE EXCEPTION 'Cannot find username for assignee';
    END IF;
    NEW.personal_chat_id := username_val;
  ELSE
    -- For channel tasks, ensure personal_chat_id is NULL
    NEW.personal_chat_id := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER ensure_task_type
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_task_type();

-- Update existing tasks with NULL personal_chat_id
UPDATE tasks t
SET personal_chat_id = u.username
FROM users u
WHERE t.assignee::text = u.id::text
AND t.channel_id IS NULL
AND t.personal_chat_id IS NULL;

-- Add NOT NULL constraint for personal tasks
ALTER TABLE tasks
  DROP CONSTRAINT IF EXISTS check_personal_chat_id,
  ADD CONSTRAINT check_personal_chat_id
  CHECK (
    (channel_id IS NOT NULL AND personal_chat_id IS NULL) OR
    (channel_id IS NULL AND personal_chat_id IS NOT NULL)
  );

-- Refresh task_details view
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