-- Drop existing task validation function and trigger
DROP TRIGGER IF EXISTS validate_task_assignment ON tasks;
DROP FUNCTION IF EXISTS validate_task_assignment();

-- Create new task validation function with NO validation
CREATE OR REPLACE FUNCTION handle_task_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Only handle personal_chat_id setting, no validation
  IF NEW.channel_id IS NULL THEN
    NEW.personal_chat_id := NEW.assignee;
  ELSE
    NEW.personal_chat_id := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger that only handles task type
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
  t.assignee as assignee_username -- Always use direct assignee value
FROM tasks t
LEFT JOIN users c ON c.username = t.created_by;

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;