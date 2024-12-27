/*
  # Fix task_details view

  1. Changes
    - Update task_details view to properly join with users table
    - Fix join conditions to use correct username comparisons
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
  -- Use COALESCE to fall back to username if displayName is null
  COALESCE(creator."displayName", creator.username) as creator_username,
  COALESCE(assignee."displayName", assignee.username) as assignee_username
FROM tasks t
-- Join with users table for creator using exact username match
LEFT JOIN users creator ON LOWER(creator.username) = LOWER(t.created_by)
-- Join with users table for assignee using exact username match
LEFT JOIN users assignee ON LOWER(assignee.username) = LOWER(t.assignee);

-- Add indexes for better join performance
DROP INDEX IF EXISTS idx_users_username_lower;
DROP INDEX IF EXISTS idx_tasks_created_by_lower;
DROP INDEX IF EXISTS idx_tasks_assignee_lower;

CREATE INDEX idx_users_username_lower ON users(LOWER(username));
CREATE INDEX idx_tasks_created_by_lower ON tasks(LOWER(created_by));
CREATE INDEX idx_tasks_assignee_lower ON tasks(LOWER(assignee));

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;