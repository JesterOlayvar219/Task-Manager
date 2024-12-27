/*
  # Task Schema Update
  
  1. Changes
    - Add personal_chat_id column
    - Add task type constraint
    - Update indexes and views
    
  2. Security
    - Maintain RLS policies
    - Ensure data consistency
*/

-- First add personal_chat_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'personal_chat_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN personal_chat_id TEXT;
  END IF;
END $$;

-- Add constraint to ensure task type consistency
ALTER TABLE tasks
  DROP CONSTRAINT IF EXISTS check_task_type,
  ADD CONSTRAINT check_task_type CHECK (
    (channel_id IS NOT NULL AND personal_chat_id IS NULL) OR
    (channel_id IS NULL AND personal_chat_id IS NOT NULL)
  );

-- Update indexes
DROP INDEX IF EXISTS idx_tasks_personal_chat_id;
CREATE INDEX idx_tasks_personal_chat_id ON tasks(personal_chat_id)
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