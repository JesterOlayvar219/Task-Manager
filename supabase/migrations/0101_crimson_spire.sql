-- Add missing columns to notifications table
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS comment_id UUID REFERENCES task_comments(id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_task_id ON notifications(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_comment_id ON notifications(comment_id);

-- Update notifications view to include related data
CREATE OR REPLACE VIEW notification_details AS
SELECT 
  n.id,
  n.type,
  n.message,
  n.recipient,
  n.timestamp,
  n.read,
  n.task_id,
  n.comment_id,
  t.title as task_title,
  c.content as comment_content
FROM notifications n
LEFT JOIN tasks t ON t.id = n.task_id
LEFT JOIN task_comments c ON c.id = n.comment_id;

-- Grant access to authenticated users
GRANT SELECT ON notification_details TO authenticated;