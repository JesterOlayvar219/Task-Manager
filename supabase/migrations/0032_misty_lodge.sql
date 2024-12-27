/*
  # Fix task_details view column names

  1. Changes
    - Update view to use camelCase column names to match the tasks table
    - Fix join conditions to use correct column names
    - Maintain consistent column naming throughout the view
*/

DROP VIEW IF EXISTS task_details;

CREATE OR REPLACE VIEW task_details AS
SELECT 
  t.id,
  t.title,
  t.description,
  t.createdBy,
  t.assignee,
  t.dueDate,
  t.status,
  t.channelId,
  t.createdAt,
  t.files,
  COALESCE(c.username, t.createdBy) as creator_username,
  COALESCE(a.username, t.assignee) as assignee_username
FROM tasks t
LEFT JOIN users c ON c.id::text = t.createdBy::text
LEFT JOIN users a ON a.id::text = t.assignee::text;

-- Grant access to authenticated users
GRANT SELECT ON task_details TO authenticated;