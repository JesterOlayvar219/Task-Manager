-- First drop the existing view
DROP VIEW IF EXISTS task_details;

-- Rename columns in tasks table to use snake_case
ALTER TABLE tasks 
  RENAME COLUMN createdBy TO created_by;
ALTER TABLE tasks 
  RENAME COLUMN channelId TO channel_id;
ALTER TABLE tasks 
  RENAME COLUMN dueDate TO due_date;
ALTER TABLE tasks 
  RENAME COLUMN createdAt TO created_at;

-- Create view with consistent naming
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
  t.created_at,
  t.files,
  COALESCE(c.username, t.created_by) as creator_username,
  COALESCE(a.username, t.assignee) as assignee_username
FROM tasks t
LEFT JOIN users c ON c.id::text = t.created_by::text
LEFT JOIN users a ON a.id::text = t.assignee::text;

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;