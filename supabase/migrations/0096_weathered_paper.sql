-- Drop existing task type handler
DROP FUNCTION IF EXISTS handle_task_type() CASCADE;

-- Create improved task handler
CREATE OR REPLACE FUNCTION handle_task_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure either channel_id or personal_chat_id is set, but not both
  IF NEW.channel_id IS NOT NULL THEN
    -- For channel tasks
    NEW.personal_chat_id := NULL;
  ELSE
    -- For personal tasks
    NEW.personal_chat_id := NEW.assignee;
  END IF;

  -- Validate channel_id is not empty string
  IF NEW.channel_id = '' THEN
    NEW.channel_id := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER handle_task_type
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_task_type();

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
  c.username as creator_username,
  t.assignee as assignee_username
FROM tasks t
LEFT JOIN users c ON c.username = t.created_by;

-- Fix any existing tasks with empty channel_id
UPDATE tasks 
SET channel_id = NULL 
WHERE channel_id = '';