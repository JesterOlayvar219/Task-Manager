-- First update tasks with valid user mappings
WITH user_mappings AS (
  SELECT 
    id::text as user_id,
    username
  FROM users
)
UPDATE tasks t
SET 
  created_by = COALESCE((SELECT username FROM user_mappings WHERE user_id = t.created_by), t.created_by),
  assignee = COALESCE((SELECT username FROM user_mappings WHERE user_id = t.assignee), t.assignee);

-- Drop existing foreign key constraints if they exist
ALTER TABLE tasks 
  DROP CONSTRAINT IF EXISTS tasks_created_by_fkey,
  DROP CONSTRAINT IF EXISTS tasks_assignee_fkey;

-- Add NOT NULL constraints first
ALTER TABLE tasks
  ALTER COLUMN created_by SET NOT NULL,
  ALTER COLUMN assignee SET NOT NULL;

-- Add foreign key constraints
ALTER TABLE tasks
  ADD CONSTRAINT tasks_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES users(username),
  ADD CONSTRAINT tasks_assignee_fkey 
    FOREIGN KEY (assignee) 
    REFERENCES users(username);

-- Update task_details view
DROP VIEW IF EXISTS task_details;
CREATE VIEW task_details AS
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
  a.username as assignee_username
FROM tasks t
LEFT JOIN users c ON c.username = t.created_by
LEFT JOIN users a ON a.username = t.assignee;

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;