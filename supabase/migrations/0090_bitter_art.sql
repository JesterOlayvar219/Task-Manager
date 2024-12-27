-- Drop existing task validation function and trigger
DROP TRIGGER IF EXISTS validate_task_assignment ON tasks;
DROP FUNCTION IF EXISTS validate_task_assignment();

-- Create new task validation function that only validates the creator
CREATE OR REPLACE FUNCTION validate_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
  creator_exists BOOLEAN;
BEGIN
  -- Check if creator exists
  SELECT EXISTS (
    SELECT 1 FROM users WHERE username = NEW.created_by
  ) INTO creator_exists;

  -- Only validate that the creator exists
  IF NOT creator_exists THEN
    RAISE EXCEPTION 'Invalid creator: User does not exist';
  END IF;

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

-- Update task_details view to handle non-existent assignees
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

-- Update RLS policies for tasks
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
    created_by = (SELECT username FROM users WHERE id = auth.uid()) OR
    assignee = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Create policy
CREATE POLICY "Task create access"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Update policy
CREATE POLICY "Task update access"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    created_by = (SELECT username FROM users WHERE id = auth.uid()) OR
    assignee = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Delete policy
CREATE POLICY "Task delete access"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    created_by = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;