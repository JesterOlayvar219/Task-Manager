/*
  # Fix task_details view

  1. Changes
    - Update task_details view to properly join with users table
    - Fix join conditions to use id instead of username
    - Add proper indexes for performance
    
  2. Indexes
    - Add indexes to improve join performance
*/

-- Drop existing view
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
  -- Use COALESCE to fall back to created_by/assignee if no user found
  COALESCE(c.username, t.created_by) as creator_username,
  COALESCE(a.username, t.assignee) as assignee_username
FROM tasks t
-- Join with users table for creator using id
LEFT JOIN users c ON c.id::text = t.created_by
-- Join with users table for assignee using id
LEFT JOIN users a ON a.id::text = t.assignee;

-- Add indexes for better join performance
DROP INDEX IF EXISTS idx_tasks_created_by;
DROP INDEX IF EXISTS idx_tasks_assignee;

CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_assignee ON tasks(assignee);

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;