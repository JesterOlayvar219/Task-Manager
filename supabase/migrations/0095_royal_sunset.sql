-- Update task type handler to preserve channel_id
CREATE OR REPLACE FUNCTION handle_task_type()
RETURNS TRIGGER AS $$
BEGIN
  -- For personal tasks (no channel_id), set personal_chat_id to assignee
  IF NEW.channel_id IS NULL THEN
    NEW.personal_chat_id := NEW.assignee;
  ELSE
    -- For channel tasks, ensure personal_chat_id is NULL but keep channel_id
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

-- Update RLS policies to ensure proper channel access
DROP POLICY IF EXISTS "Task read access" ON tasks;
DROP POLICY IF EXISTS "Task create access" ON tasks;
DROP POLICY IF EXISTS "Task update access" ON tasks;
DROP POLICY IF EXISTS "Task delete access" ON tasks;

-- Read policy
CREATE POLICY "Task read access"
  ON tasks FOR SELECT
  TO authenticated
  USING (true); -- Allow reading all tasks

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