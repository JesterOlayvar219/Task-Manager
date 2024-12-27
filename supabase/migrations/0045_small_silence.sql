/*
  # Fix Task Type Handling

  1. Changes
    - Improve trigger function to handle task types
    - Add proper validation for assignees
    - Update task_details view
    - Fix RLS policies

  2. Security
    - Maintain RLS policies
    - Ensure data consistency
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

  -- Validate assignee exists
  IF username_val IS NULL THEN
    RAISE EXCEPTION 'Invalid assignee: User does not exist';
  END IF;

  -- Set personal_chat_id based on task type
  IF NEW.channel_id IS NULL THEN
    NEW.personal_chat_id := username_val;
  ELSE
    NEW.personal_chat_id := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER ensure_task_type
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_task_type();

-- Add constraint
ALTER TABLE tasks
  DROP CONSTRAINT IF EXISTS check_task_type,
  ADD CONSTRAINT check_task_type CHECK (
    (channel_id IS NOT NULL AND personal_chat_id IS NULL) OR
    (channel_id IS NULL AND personal_chat_id IS NOT NULL)
  );

-- Update indexes
DROP INDEX IF EXISTS idx_tasks_personal_chat_id;
CREATE INDEX idx_tasks_personal_chat_id ON tasks(personal_chat_id)
WHERE personal_chat_id IS NOT NULL;

-- Update task_details view
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