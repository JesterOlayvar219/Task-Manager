-- Make channel_id nullable
ALTER TABLE tasks ALTER COLUMN channel_id DROP NOT NULL;

-- Update task validation function
CREATE OR REPLACE FUNCTION handle_task_type()
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

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS handle_task_type ON tasks;
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

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;