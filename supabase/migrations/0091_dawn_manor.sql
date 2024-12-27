-- Drop existing task validation function and trigger
DROP TRIGGER IF EXISTS validate_task_assignment ON tasks;
DROP FUNCTION IF EXISTS validate_task_assignment();

-- Create new task validation function that only validates the creator
CREATE OR REPLACE FUNCTION validate_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Set personal_chat_id for personal tasks
  IF NEW.channel_id IS NULL THEN
    NEW.personal_chat_id := NEW.assignee;
  ELSE
    NEW.personal_chat_id := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger for task validation
CREATE TRIGGER validate_task_assignment
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION validate_task_assignment();

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
  -- Use assignee directly if user doesn't exist yet
  COALESCE(a.username, t.assignee) as assignee_username
FROM tasks t
LEFT JOIN users c ON c.username = t.created_by
LEFT JOIN users a ON a.username = t.assignee;

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;