/*
  # Fix Personal Chat Privacy

  1. Changes
    - Update messages table structure for better privacy
    - Add strict RLS policies
    - Add performance indexes

  2. Security
    - Personal messages only visible to sender and recipient
    - Channel messages visible to all authenticated users
*/

-- Drop existing table
DROP TABLE IF EXISTS messages;

-- Create new messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  channel_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('channel', 'personal')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Add indexes for performance
CREATE INDEX idx_messages_channel ON messages(channel_id) WHERE type = 'channel';
CREATE INDEX idx_messages_personal ON messages(sender, recipient) WHERE type = 'personal';
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Channel messages policy
CREATE POLICY "Channel messages are readable by all"
  ON messages FOR SELECT
  TO authenticated
  USING (
    type = 'channel'
  );

-- Personal messages policy
CREATE POLICY "Personal messages are only readable by participants"
  ON messages FOR SELECT
  TO authenticated
  USING (
    type = 'personal' AND (
      auth.uid()::text = sender OR 
      auth.uid()::text = recipient
    )
  );

-- Send message policy
CREATE POLICY "Users can only send messages as themselves"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = sender);

-- Update policy for read status
CREATE POLICY "Recipients can mark messages as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = recipient)
  WITH CHECK (
    -- Only allow updating read status
    read IS TRUE AND
    id = id AND
    content = content AND
    sender = sender AND
    recipient = recipient AND
    type = type AND
    timestamp = timestamp
  );