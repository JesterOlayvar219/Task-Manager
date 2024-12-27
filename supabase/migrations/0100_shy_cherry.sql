-- Create comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_author ON task_comments(author);
CREATE INDEX idx_task_comments_created_at ON task_comments(created_at);

-- Enable RLS
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can read comments on tasks they have access to"
  ON task_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_id
      AND (
        t.channel_id IS NOT NULL OR
        t.assignee = (SELECT username FROM users WHERE id = auth.uid()) OR
        t.created_by = (SELECT username FROM users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can comment on tasks they have access to"
  ON task_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    author = (SELECT username FROM users WHERE id = auth.uid()) AND
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_id
      AND (
        t.assignee = (SELECT username FROM users WHERE id = auth.uid()) OR
        t.created_by = (SELECT username FROM users WHERE id = auth.uid())
      )
    )
  );

-- Create view for comment details
CREATE VIEW task_comment_details AS
SELECT 
  c.*,
  u.username as author_username
FROM task_comments c
LEFT JOIN users u ON u.username = c.author;

-- Grant access to authenticated users
GRANT SELECT ON task_comment_details TO authenticated;