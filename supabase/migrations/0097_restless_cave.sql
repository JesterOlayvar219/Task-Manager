-- Drop existing task type handler
DROP FUNCTION IF EXISTS handle_task_type() CASCADE;

-- Create improved task handler
CREATE OR REPLACE FUNCTION handle_task_type()
RETURNS TRIGGER AS $$
BEGIN
  -- For personal tasks (no channel_id), set personal_chat_id to assignee
  IF NEW.channel_id IS NULL OR NEW.channel_id = '' THEN
    NEW.channel_id := NULL;
    NEW.personal_chat_id := NEW.assignee;
  ELSE
    -- For channel tasks, set both personal_chat_id AND keep channel_id
    -- This allows the task to appear in both places
    NEW.personal_chat_id := NEW.assignee;
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

-- Update RLS policies to ensure proper visibility
DROP POLICY IF EXISTS "Task read access" ON tasks;
DROP POLICY IF EXISTS "Task create access" ON tasks;
DROP POLICY IF EXISTS "Task update access" ON tasks;
DROP POLICY IF EXISTS "Task delete access" ON tasks;

-- Read policy - Allow reading tasks if:
-- 1. You're assigned to it (personal_chat_id matches your username)
-- 2. It's in a channel (channel_id is not null)
-- 3. You created it
CREATE POLICY "Task read access"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    channel_id IS NOT NULL OR
    personal_chat_id = (SELECT username FROM users WHERE id = auth.uid()) OR
    created_by = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Other policies remain the same
CREATE POLICY "Task create access"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (SELECT username FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Task update access"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    created_by = (SELECT username FROM users WHERE id = auth.uid()) OR
    assignee = (SELECT username FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Task delete access"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    created_by = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Fix any existing tasks
UPDATE tasks 
SET 
  personal_chat_id = assignee,
  channel_id = NULL
WHERE channel_id = '';

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;