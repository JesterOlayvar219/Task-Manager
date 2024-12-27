-- Drop existing notifications table
DROP TABLE IF EXISTS notifications CASCADE;

-- Create notifications table with proper structure
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  recipient TEXT NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES task_comments(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT false
);

-- Add indexes
CREATE INDEX idx_notifications_recipient ON notifications(recipient);
CREATE INDEX idx_notifications_timestamp ON notifications(timestamp DESC);
CREATE INDEX idx_notifications_unread ON notifications(recipient, read) WHERE NOT read;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (recipient = (SELECT username FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (recipient = (SELECT username FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (recipient = (SELECT username FROM users WHERE id = auth.uid()));

CREATE POLICY "Anyone can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);