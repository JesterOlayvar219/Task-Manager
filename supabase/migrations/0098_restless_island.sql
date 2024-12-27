-- Drop existing task type handler
DROP FUNCTION IF EXISTS handle_task_type() CASCADE;

-- Create improved task handler that ALWAYS sets personal_chat_id
CREATE OR REPLACE FUNCTION handle_task_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Always set personal_chat_id to assignee for both channel and personal tasks
  NEW.personal_chat_id := NEW.assignee;

  -- Clean up empty channel_id
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

-- Update RLS policies
DROP POLICY IF EXISTS "Task read access" ON tasks;
DROP POLICY IF EXISTS "Task create access" ON tasks;
DROP POLICY IF EXISTS "Task update access" ON tasks;
DROP POLICY IF EXISTS "Task delete access" ON tasks;

-- Read policy - Allow reading tasks if:
-- 1. It's in a channel OR
-- 2. You're the assignee OR
-- 3. You created it
CREATE POLICY "Task read access"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    channel_id IS NOT NULL OR
    assignee = (SELECT username FROM users WHERE id = auth.uid()) OR
    created_by = (SELECT username FROM users WHERE id = auth.uid())
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

-- Update existing tasks to ensure consistency
UPDATE tasks 
SET personal_chat_id = assignee 
WHERE personal_chat_id IS NULL OR personal_chat_id != assignee;

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;