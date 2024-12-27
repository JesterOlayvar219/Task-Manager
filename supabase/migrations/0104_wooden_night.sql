-- Drop existing messages table
DROP TABLE IF EXISTS messages;

-- Create new messages table with proper schema
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  channel_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('channel', 'personal')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Add indexes for better performance
CREATE INDEX idx_messages_channel ON messages(channel_id) WHERE type = 'channel';
CREATE INDEX idx_messages_sender ON messages(sender);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can read channel messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    (type = 'channel') OR
    (type = 'personal' AND (sender = auth.uid()::text OR recipient = auth.uid()::text))
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender = (SELECT username FROM users WHERE id = auth.uid())
  );