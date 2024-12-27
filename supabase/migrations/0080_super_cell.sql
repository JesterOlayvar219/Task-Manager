-- Drop existing view first
DROP VIEW IF EXISTS task_details;

-- Create improved task_details view
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
  COALESCE(c."displayName", c.username) as creator_username,
  COALESCE(a."displayName", a.username) as assignee_username,
  c.username as creator_id,
  a.username as assignee_id
FROM tasks t
LEFT JOIN users c ON c.id::text = t.created_by::text
LEFT JOIN users a ON a.id::text = t.assignee::text;

-- Create function to validate task assignment
CREATE OR REPLACE FUNCTION validate_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
  assignee_exists BOOLEAN;
  creator_exists BOOLEAN;
BEGIN
  -- Check if users exist
  SELECT EXISTS (
    SELECT 1 FROM users WHERE username = NEW.assignee
  ) INTO assignee_exists;

  SELECT EXISTS (
    SELECT 1 FROM users WHERE username = NEW.created_by
  ) INTO creator_exists;

  -- Validate users exist
  IF NOT assignee_exists THEN
    RAISE EXCEPTION 'Invalid assignee: User does not exist';
  END IF;

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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_task_assignment ON tasks;

-- Create trigger for task validation
CREATE TRIGGER validate_task_assignment
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION validate_task_assignment();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_channel_id ON tasks(channel_id);
CREATE INDEX IF NOT EXISTS idx_tasks_personal_chat_id ON tasks(personal_chat_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;

-- Add RLS policies for tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

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
    created_by = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Create policy
CREATE POLICY "Task create access"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (SELECT username FROM users WHERE id = auth.uid()) AND
    (
      channel_id IS NOT NULL OR
      (channel_id IS NULL AND assignee = (SELECT username FROM users WHERE id = auth.uid()))
    )
  );

-- Update policy
CREATE POLICY "Task update access"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    created_by = (SELECT username FROM users WHERE id = auth.uid()) OR
    assignee = (SELECT username FROM users WHERE id = auth.uid()) OR
    personal_chat_id = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Delete policy
CREATE POLICY "Task delete access"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    created_by = (SELECT username FROM users WHERE id = auth.uid()) OR
    personal_chat_id = (SELECT username FROM users WHERE id = auth.uid())
  );