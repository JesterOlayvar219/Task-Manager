/*
  # Fix Personal Tasks ID

  1. Changes
    - Add trigger to automatically set personal_chat_id for personal tasks
    - Update existing tasks to ensure proper personal_chat_id values
    - Add validation to ensure task type consistency

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control for personal tasks
*/

-- Create function to handle personal task creation/updates
CREATE OR REPLACE FUNCTION handle_personal_task()
RETURNS TRIGGER AS $$
BEGIN
  -- If it's a personal task (no channel_id), set personal_chat_id to assignee
  IF NEW.channel_id IS NULL THEN
    NEW.personal_chat_id := NEW.assignee;
  ELSE
    -- If it's a channel task, ensure personal_chat_id is NULL
    NEW.personal_chat_id := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new tasks
DROP TRIGGER IF EXISTS set_personal_chat_id ON tasks;
CREATE TRIGGER set_personal_chat_id
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_personal_task();

-- Update existing tasks to ensure consistency
UPDATE tasks
SET personal_chat_id = 
  CASE 
    WHEN channel_id IS NULL THEN assignee
    ELSE NULL
  END
WHERE 
  (channel_id IS NULL AND personal_chat_id IS NULL) OR
  (channel_id IS NOT NULL AND personal_chat_id IS NOT NULL);

-- Add index for personal tasks queries
CREATE INDEX IF NOT EXISTS idx_tasks_personal_chat_id ON tasks(personal_chat_id)
WHERE personal_chat_id IS NOT NULL;

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
  COALESCE(c.username, t.created_by) as creator_username,
  COALESCE(a.username, t.assignee) as assignee_username
FROM tasks t
LEFT JOIN users c ON c.id::text = t.created_by::text
LEFT JOIN users a ON a.id::text = t.assignee::text;

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;