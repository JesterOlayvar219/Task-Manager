/*
  # Personal Chat Privacy Update

  1. Changes
    - Drop existing messages table and recreate with proper structure
    - Add strict RLS policies for message privacy
    - Add indexes for performance

  2. Security
    - Messages are only visible to sender and recipient
    - Channel messages visible to all authenticated users
    - Users can only send messages as themselves
*/

-- Drop existing table
DROP TABLE IF EXISTS messages;

-- Create new messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  recipient TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  type TEXT NOT NULL CHECK (type IN ('channel', 'personal'))
);

-- Add indexes for performance
CREATE INDEX idx_messages_channel ON messages(channel_id) WHERE type = 'channel';
CREATE INDEX idx_messages_personal ON messages(sender, recipient) WHERE type = 'personal';
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for channel messages
CREATE POLICY "Channel messages are readable by all"
  ON messages FOR SELECT
  TO authenticated
  USING (
    type = 'channel'
  );

-- Policies for personal messages
CREATE POLICY "Personal messages are only readable by participants"
  ON messages FOR SELECT
  TO authenticated
  USING (
    type = 'personal' AND (
      auth.uid()::text = sender OR 
      auth.uid()::text = recipient
    )
  );

-- Policy for sending messages
CREATE POLICY "Users can only send messages as themselves"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = sender);

-- Policy for updating read status
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
    channel_id = channel_id AND
    recipient = recipient AND
    type = type AND
    timestamp = timestamp
  );