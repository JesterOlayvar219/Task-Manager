-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their tasks" ON tasks;

-- Create new policies with proper checks
CREATE POLICY "Task read access"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    -- Allow access to channel tasks
    (channel_id IS NOT NULL) OR
    -- Allow access to personal tasks for the assigned user
    (personal_chat_id IS NOT NULL AND auth.uid()::text = assignee) OR
    -- Allow access to tasks created by the user
    auth.uid()::text = created_by
  );

CREATE POLICY "Task create access"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Must be authenticated to create tasks
    auth.uid()::text = created_by AND
    -- Ensure either channel_id or personal_chat_id is set, but not both
    (
      (channel_id IS NOT NULL AND personal_chat_id IS NULL) OR
      (channel_id IS NULL AND personal_chat_id IS NOT NULL)
    )
  );

CREATE POLICY "Task update access"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    -- Can update if user created the task
    auth.uid()::text = created_by OR
    -- Can update if user is assigned to the task
    auth.uid()::text = assignee
  );

CREATE POLICY "Task delete access"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    -- Can only delete tasks they created
    auth.uid()::text = created_by
  );