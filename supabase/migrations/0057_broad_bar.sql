-- First ensure users table has proper constraints
ALTER TABLE users
  ALTER COLUMN username SET NOT NULL,
  ALTER COLUMN role SET NOT NULL,
  ALTER COLUMN display_name SET NOT NULL;

-- Update existing users to ensure display_name is set
UPDATE users 
SET display_name = username 
WHERE display_name IS NULL;

-- Create or replace improved task assignment function
CREATE OR REPLACE FUNCTION handle_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
  assignee_record RECORD;
BEGIN
  -- Get assignee record with all needed fields
  SELECT id, username, display_name 
  INTO assignee_record
  FROM users 
  WHERE id::text = NEW.assignee::text;

  -- Validate assignee exists
  IF assignee_record IS NULL THEN
    RAISE EXCEPTION 'Invalid assignee: User does not exist';
  END IF;

  -- Set personal_chat_id based on task type
  IF NEW.channel_id IS NULL THEN
    NEW.personal_chat_id := assignee_record.username;
  ELSE
    NEW.personal_chat_id := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS validate_task_assignment ON tasks;
CREATE TRIGGER validate_task_assignment
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_task_assignment();

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
  COALESCE(c.display_name, c.username) as creator_username,
  COALESCE(a.display_name, a.username) as assignee_username
FROM tasks t
LEFT JOIN users c ON c.id::text = t.created_by::text
LEFT JOIN users a ON a.id::text = t.assignee::text;

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;