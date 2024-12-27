-- Drop existing policies
DROP POLICY IF EXISTS "Task read access" ON tasks;
DROP POLICY IF EXISTS "Task create access" ON tasks;
DROP POLICY IF EXISTS "Task update access" ON tasks;
DROP POLICY IF EXISTS "Task delete access" ON tasks;

-- Read policy - Allow reading channel tasks and personal tasks
CREATE POLICY "Task read access"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    -- Can read channel tasks
    channel_id IS NOT NULL OR
    -- Can read personal tasks assigned to you
    (channel_id IS NULL AND assignee = (SELECT username FROM users WHERE id = auth.uid())) OR
    -- Can read tasks you created
    created_by = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Create policy - Allow creating tasks in channels or personal tasks
CREATE POLICY "Task create access"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Update policy - Allow updating tasks you created or are assigned to
CREATE POLICY "Task update access"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    created_by = (SELECT username FROM users WHERE id = auth.uid()) OR
    assignee = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Delete policy - Allow deleting tasks you created
CREATE POLICY "Task delete access"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    created_by = (SELECT username FROM users WHERE id = auth.uid())
  );